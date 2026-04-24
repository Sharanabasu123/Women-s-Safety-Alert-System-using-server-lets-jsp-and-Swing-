import { useState } from 'react';
import { AuthProvider, LoginScreen, UserHeader } from './components/Auth';
import { SOSButton } from './components/SOSButton';
import { ContactsList } from './components/Contacts';
import { AdminMonitor, UserAlerts } from './components/Alerts';
import { Shield, Users, Bell, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function Dashboard({ user, profile }: any) {
  const [activeTab, setActiveTab] = useState('sos');

  const tabs = [
    { id: 'sos', label: 'Safety Hub', icon: Home },
    { id: 'contacts', label: 'Guardian Registry', icon: Users },
    ...(profile?.role === 'admin' ? [{ id: 'monitor', label: 'Threat Monitor', icon: Bell }] : [])
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-stone-200">
      <UserHeader user={user} profile={profile} />
      
      <main className="flex-1 container mx-auto max-w-4xl px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'sos' && (
            <motion.div
              key="sos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <SOSButton user={user} />
              <UserAlerts userId={user.uid} />
            </motion.div>
          )}

          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ContactsList userId={user.uid} />
            </motion.div>
          )}

          {activeTab === 'monitor' && profile?.role === 'admin' && (
            <motion.div
              key="monitor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminMonitor />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-8 flex justify-between items-center bg-[#0a0a0a] border-t border-stone-800 px-8 py-6 text-[9px] text-stone-600 uppercase tracking-[0.3em] font-bold">
        <div className="italic font-serif opacity-60">Architectural Standard: Secure Protocol</div>
        <div className="hidden sm:flex gap-8">
          <span>Auth: Google-OIDC</span>
          <span>Buffer: TLS-1.3</span>
          <span className="text-stone-500/50 hover:text-stone-400 cursor-pointer transition-colors">Documentation</span>
        </div>
      </footer>

      <nav className="sticky bottom-0 border-t border-stone-800 bg-[#0a0a0a]/95 backdrop-blur-xl pb-safe">
        <div className="container mx-auto max-w-md flex items-center justify-around py-3 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${
                activeTab === tab.id ? 'text-red-500 scale-110' : 'text-stone-600 hover:text-stone-400'
              }`}
            >
              <tab.icon className={`h-5 w-5 transition-transform ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-1'}`} />
              <span className={`text-[8px] font-bold uppercase tracking-[0.2em] transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      {(user, profile) => (
        user ? <Dashboard user={user} profile={profile} /> : <LoginScreen />
      )}
    </AuthProvider>
  );
}
