import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AlertCircle, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { GeoLocation } from '../types';

export function SOSButton({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSOS = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const location: GeoLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Create alert in Firebase
      await addDoc(collection(db, 'alerts'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
        location,
        status: 'active',
        message: 'EMERGENCY: User triggered SOS alert!'
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to trigger SOS. Please try again.');
    } finally {
      setLoading(false);
      setCountdown(null);
    }
  };

  const handlePress = () => {
    if (loading || success) return;
    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timerRef.current!);
          triggerSOS();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(null);
  };

  return (
    <div className="flex flex-col items-center gap-10 py-8">
      <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-12 flex flex-col items-center justify-center relative overflow-hidden w-full max-w-lg mx-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#450a0a,transparent_70%)] opacity-20"></div>
        
        <div className="relative z-10 text-center w-full">
          <p className="text-stone-500 uppercase tracking-[0.4em] text-[10px] mb-10 font-bold">Emergency Transmission Trigger</p>
          
          <div className="relative inline-block">
            <AnimatePresence>
              {(countdown !== null || loading) && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute inset-0 rounded-full bg-red-900/40 blur-3xl"
                />
              )}
            </AnimatePresence>

            <button
              onMouseDown={handlePress}
              onTouchStart={handlePress}
              onMouseUp={() => countdown !== null && cancelSOS()}
              onTouchEnd={() => countdown !== null && cancelSOS()}
              className="group relative z-10 active:scale-95 transition-transform"
            >
              <div className="w-56 h-56 rounded-full border border-stone-800 hover:border-stone-700 flex items-center justify-center p-3 transition-colors bg-stone-900/30">
                <div className={`w-full h-full rounded-full border flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${
                  success 
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-emerald-900/40' 
                    : 'border-red-600 bg-gradient-to-br from-red-700 to-red-900 shadow-red-900/40'
                }`}>
                  {loading ? (
                    <Loader2 className="h-12 w-12 animate-spin text-red-200" />
                  ) : success ? (
                    <CheckCircle2 className="h-16 w-16 text-emerald-100" />
                  ) : countdown !== null ? (
                    <span className="text-6xl font-serif italic font-bold text-white leading-none">{countdown}</span>
                  ) : (
                    <>
                      <span className="text-5xl font-serif italic font-bold text-white tracking-tight leading-none">SOS</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-red-200 mt-1 font-bold">Instant Alert</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          </div>

          <div className="mt-12 min-h-[4rem] flex flex-col items-center justify-center">
            {countdown !== null ? (
              <div className="space-y-4 animate-pulse">
                <p className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold italic">Establishing Uplink in {countdown}s...</p>
              </div>
            ) : success ? (
              <p className="text-xs font-serif italic text-emerald-400 font-medium uppercase tracking-[0.2em]">Transmission Acknowledged</p>
            ) : (
              <p className="text-stone-400 text-xs max-w-[240px] mx-auto italic font-serif leading-relaxed opacity-60">
                Deep-press and hold initiates immediate location broadcast to all secure protocol contacts.
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest border border-red-900/30 bg-red-950/20 px-4 py-2 rounded-lg italic">
          Protocol Error: {error}
        </p>
      )}
    </div>
  );
}
