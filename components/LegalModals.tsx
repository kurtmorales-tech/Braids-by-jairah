
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Undo2 } from 'lucide-react';
import { Button } from './Button';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | 'refund';
}

const CONTENT = {
  terms: {
    title: "Terms & Conditions",
    icon: FileText,
    text: `Welcome to Braids By Jaira. By booking an appointment, you agree to the following protocols:
    1. Arrival: Please arrive 10 minutes early. Late arrivals exceeding 15 minutes may result in cancellation.
    2. Hair Prep: Hair must be washed, detangled, and blown out unless the service specifies otherwise.
    3. Conduct: We maintain a sanctuary of peace; disruptive behavior is not permitted.`
  },
  privacy: {
    title: "Privacy Policy",
    icon: ShieldCheck,
    text: `Your privacy is our priority. 
    1. Data Collection: We collect name, email, and phone for booking purposes only.
    2. Security: Payment information is handled exclusively by Stripe or PayPal. We do not store card details.
    3. Communication: You will receive appointment reminders and receipts via email.`
  },
  refund: {
    title: "Refund Policy",
    icon: Undo2,
    text: `Strict Non-Refundable Reservation Policy:
    1. Deposits: The reservation fee is 100% non-refundable under any circumstances.
    2. Rescheduling: You may reschedule up to 48 hours before your appointment. Deposits are transferable once.
    3. No-Shows: Failure to arrive without notice forfeits the deposit and prevents future bookings.`
  }
};

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  const data = CONTENT[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-braid-text/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-braid-bg dark:bg-braid-dark-panel rounded-[3rem] p-12 shadow-2xl overflow-hidden border border-braid-primary/10"
          >
            <div className="absolute top-0 right-0 p-8">
              <button onClick={onClose} className="p-2 hover:bg-braid-primary/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-braid-primary/10 rounded-full flex items-center justify-center text-braid-primary">
                <data.icon size={32} />
              </div>
              <h2 className="text-4xl font-serif italic">{data.title}</h2>
              <div className="w-20 h-1 bg-braid-primary/20 rounded-full" />
              <div className="text-left space-y-4 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                {data.text.split('\n').map((line, i) => (
                  <p key={i} className="text-braid-muted dark:text-braid-dark-muted leading-relaxed font-light">
                    {line.trim()}
                  </p>
                ))}
              </div>
              <Button onClick={onClose} className="px-12 mt-4">I Understand</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
