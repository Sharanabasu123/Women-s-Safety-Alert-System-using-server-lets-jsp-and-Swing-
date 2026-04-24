import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { UserPlus, Trash2, Phone, User as UserIcon, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmergencyContact } from '../types';

export function ContactsList({ userId }: { userId: string }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    const q = query(collection(db, 'users', userId, 'contacts'));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyContact));
      setContacts(list);
      setLoading(false);
    });
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    try {
      await addDoc(collection(db, 'users', userId, 'contacts'), newContact);
      setNewContact({ name: '', phone: '', email: '' });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'contacts', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="space-y-0.5">
          <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-stone-500">Emergency Protocol Contacts</h2>
          <p className="text-[10px] text-stone-600 font-serif italic">Verified broadcast recipients</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 transition-all hover:border-stone-600 hover:text-stone-200 active:scale-95"
        >
          {isAdding ? 'Close Protocol' : 'Append Entry +'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/40 p-6 space-y-6 shadow-2xl relative"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-stone-500 font-bold ml-1">Subject Identifier</label>
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={newContact.name}
                  onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl bg-[#0a0a0a] p-3 text-xs text-stone-200 border border-stone-800 focus:outline-none focus:border-stone-600 transition-colors font-serif italic"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-stone-500 font-bold ml-1">Communication Line</label>
                <input
                  required
                  type="tel"
                  placeholder="+91 •••• ••••"
                  value={newContact.phone}
                  onChange={e => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-xl bg-[#0a0a0a] p-3 text-xs text-stone-200 border border-stone-800 focus:outline-none focus:border-stone-600 transition-colors font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-stone-500 font-bold ml-1">Digital Anchor (Optional)</label>
              <input
                type="email"
                placeholder="Email Address"
                value={newContact.email}
                onChange={e => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl bg-[#0a0a0a] p-3 text-xs text-stone-200 border border-stone-800 focus:outline-none focus:border-stone-600 transition-colors font-mono"
              />
            </div>
            <div className="flex justify-end gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-stone-600 hover:text-stone-400 transition-colors italic font-serif"
              >
                Abort
              </button>
              <button 
                type="submit"
                className="rounded-full bg-stone-200 px-6 py-2 text-[#0a0a0a] hover:bg-white transition-colors"
              >
                Commit Record
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-6 sm:grid-cols-2">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-stone-700" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="col-span-full border border-dashed border-stone-800 rounded-2xl py-16 text-center space-y-2">
            <p className="text-[10px] text-stone-600 uppercase tracking-[0.4em] font-bold">Registry Vacuum</p>
            <p className="text-xs text-stone-700 font-serif italic">No emergency protocols currently established</p>
          </div>
        ) : (
          contacts.map(contact => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={contact.id}
              className="group flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900/30 p-5 transition-all hover:bg-stone-900/60 hover:border-stone-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 font-serif italic text-lg leading-none group-hover:text-stone-300 transition-colors">
                    {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-stone-200 group-hover:text-white transition-colors capitalize">{contact.name}</h3>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] font-mono text-stone-500 italic uppercase">GSM: {contact.phone}</p>
                      {contact.email && <p className="text-[10px] font-mono text-stone-600 italic lowercase truncate max-w-[120px]">{contact.email}</p>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="rounded-full border border-stone-800 p-2 text-stone-600 hover:bg-red-900/20 hover:border-red-900/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-800/50 flex justify-between items-center">
                <span className="text-[8px] uppercase tracking-widest text-stone-600 font-bold">Protocol Valid</span>
                <span className="text-[8px] uppercase tracking-widest text-stone-700 font-serif italic">Guardian ID: {contact.id.slice(0, 8)}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
