import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, where } from 'firebase/firestore';
import { AlertTriangle, MapPin, Clock, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Alert } from '../types';

export function AdminMonitor() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'alerts'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
      setAlerts(list);
      setLoading(false);
    });
  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await updateDoc(doc(db, 'alerts', id), {
        status: 'resolved'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="space-y-0.5">
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-stone-500">Emergency Uplink Monitor</h2>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono italic">Live Stream Active</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-stone-600 uppercase tracking-widest font-bold">Admin Authority</p>
          <p className="text-[10px] text-stone-400 font-mono italic">Sector: Global</p>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-stone-700" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="border border-dashed border-stone-800 rounded-2xl py-20 text-center space-y-2">
            <p className="text-[10px] text-stone-600 uppercase tracking-[0.4em] font-bold">Sector Silence</p>
            <p className="text-xs text-stone-700 font-serif italic">No emergency transmissions currently detected</p>
          </div>
        ) : (
          alerts.map(alert => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={alert.id}
              className={`overflow-hidden rounded-2xl border transition-all duration-500 ${
                alert.status === 'active' 
                  ? 'border-red-900/50 bg-red-950/5 shadow-[0_0_15px_rgba(153,27,27,0.1)]' 
                  : 'border-stone-800 bg-stone-900/30 grayscale opacity-80'
              } p-6 relative`}
            >
              {alert.status === 'active' && (
                <div className="absolute top-0 right-0 h-1 w-24 bg-red-600 blur-sm"></div>
              )}
              
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative z-10">
                <div className="flex items-start gap-6">
                  <div className={`rounded-xl border p-4 transition-colors ${
                    alert.status === 'active' 
                      ? 'border-red-800 bg-red-900/20' 
                      : 'border-stone-800 bg-stone-900/50'
                  }`}>
                    {alert.status === 'active' ? (
                      <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-stone-500" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-serif italic text-stone-100 leading-none">{alert.userName}</h3>
                      <span className={`text-[8px] font-mono border px-2 py-0.5 rounded italic uppercase font-bold tracking-widest ${
                        alert.status === 'active' ? 'border-red-600 text-red-200' : 'border-stone-700 text-stone-500'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-serif italic leading-relaxed tracking-wide">Incident: {alert.message}</p>
                    <div className="pt-3 flex flex-wrap gap-6 text-[9px] font-mono text-stone-600 uppercase tracking-widest italic">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp?.toDate().toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {alert.location.lat.toFixed(6)}N, {alert.location.lng.toFixed(6)}E
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <a
                    href={`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-full border border-stone-800 bg-stone-900 px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-stone-300 transition-all hover:bg-stone-800 hover:border-stone-600"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Trace Line
                  </a>
                  {alert.status === 'active' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="rounded-full bg-emerald-700/80 px-6 py-2.5 text-[9px] font-bold uppercase tracking-widest text-emerald-100 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-950/50"
                    >
                      Dismiss Case
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export function UserAlerts({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
      setAlerts(list);
    });
  }, [userId]);

  if (alerts.length === 0) return null;

  return (
    <div className="bg-stone-900/20 border border-stone-800 rounded-2xl p-6 space-y-6">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-600 border-b border-stone-800 pb-2">Incident Audit History</h2>
      <div className="grid gap-3">
        {alerts.map(alert => (
          <div key={alert.id} className="flex items-center justify-between p-4 bg-stone-900/60 rounded-xl border border-stone-800/30 group transition-all hover:bg-stone-900/80">
             <div className="flex items-center gap-4">
               <div className={`w-1 h-1 rounded-full ${alert.status === 'active' ? 'bg-red-500 animate-pulse shadow-[0_0_5px_#ef4444]' : 'bg-stone-700'}`}></div>
               <div className="space-y-0.5">
                 <div className={`text-[10px] font-serif italic font-medium uppercase tracking-widest ${
                   alert.status === 'active' ? 'text-red-300' : 'text-stone-500'
                 }`}>
                   {alert.status === 'active' ? 'Transmission Active' : 'Protocol Resolved'}
                 </div>
                 <div className="text-[9px] font-mono text-stone-600 tracking-tighter italic">Timestamp: {alert.timestamp?.toDate().toLocaleTimeString()}</div>
               </div>
             </div>
             <div className="text-[9px] font-mono text-stone-700 uppercase italic opacity-60">
               LOC: {alert.location.lat.toFixed(3)}, {alert.location.lng.toFixed(3)}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
