import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, LogIn, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

export function AuthProvider({ children }: { children: (user: User | null, profile: UserProfile | null) => React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          // Create default profile
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName,
            role: u.email === "sharanabasupatil91088@gmail.com" ? 'admin' : 'user'
          };
          await setDoc(doc(db, 'users', u.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-red-600" />
        </motion.div>
      </div>
    );
  }

  return <>{children(user, profile)}</>;
}

export function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] p-6 text-stone-200 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#450a0a,transparent_75%)] opacity-20"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-12 relative z-10"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-serif italic tracking-tight text-stone-100 leading-none">
              Guardian <span className="text-red-600">Aura</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-stone-500 font-bold">
              Women's Safety Protocol System
            </p>
          </div>
          <div className="h-px w-12 bg-stone-800"></div>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-full border border-stone-800 bg-stone-900/50 px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-300 transition-all hover:border-stone-600 hover:bg-stone-800 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Shield className="h-5 w-5 text-red-600" />
                Initiate Secure Access
              </>
            )}
          </button>
          
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-mono text-red-500 italic"
            >
              System Error: {error}
            </motion.p>
          )}

          <p className="pt-8 text-[9px] text-stone-600 uppercase tracking-[0.3em] font-medium max-w-[200px] mx-auto italic font-serif">
            Encrypted session transmission active
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function UserHeader({ user, profile }: { user: User, profile: UserProfile | null }) {
  const handleLogout = () => signOut(auth);

  return (
    <header className="flex items-end justify-between border-b border-stone-800 bg-[#0a0a0a] px-6 py-6 sm:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif italic tracking-tight text-stone-100">Guardian Aura</h1>
        <p className="text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold leading-none">Women's Safety Protocol</p>
      </div>
      <div className="flex items-center gap-6 text-[10px]">
        <div className="hidden text-right sm:block space-y-0.5">
          <p className="text-stone-500 uppercase tracking-widest font-bold">Authenticated Profile</p>
          <p className="font-mono text-stone-300 flex items-center justify-end gap-2 italic">
            {profile?.role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>}
            {user.displayName}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-stone-800 bg-stone-900/50 p-2.5 text-stone-500 transition-all hover:border-stone-600 hover:text-stone-300 active:scale-95"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
