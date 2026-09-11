import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Bell
} from 'lucide-react';
import { verificationService, MockNotificationMessage } from '../services/verification';

interface NotificationToastProps {
  onAutoFillCode?: (code: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onAutoFillCode }) => {
  const [messages, setMessages] = useState<MockNotificationMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = verificationService.onNotification((msg) => {
      setMessages((prev) => [msg, ...prev.slice(0, 2)]);
      
      // Auto dismiss after 12 seconds
      setTimeout(() => {
        setMessages((current) => current.filter((m) => m.id !== msg.id));
      }, 12000);
    });

    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCopyCode = (msg: MockNotificationMessage) => {
    navigator.clipboard?.writeText(msg.code);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onAutoFillCode) {
      onAutoFillCode(msg.code);
    }
  };

  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`pointer-events-auto rounded-2xl shadow-2xl border p-4 text-xs animate-fade-in-up transition-all ${
            msg.channel === 'whatsapp'
              ? 'bg-emerald-950 text-emerald-50 border-emerald-500/80 shadow-emerald-950/60'
              : 'bg-indigo-950 text-indigo-50 border-indigo-500/80 shadow-indigo-950/60'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                msg.channel === 'whatsapp' ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}>
                {msg.channel === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-extrabold text-[11px] block leading-tight">
                  {msg.channel === 'whatsapp' ? 'Simulasi Mesej WhatsApp' : 'Simulasi Emel Masuk'}
                </span>
                <span className="text-[10px] text-white/60">
                  Kepada: {msg.destination} • {msg.timestamp}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDismiss(msg.id)}
              className="p-1 text-white/60 hover:text-white rounded-md cursor-pointer hover:bg-white/10"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="bg-black/30 rounded-xl p-2.5 border border-white/10">
              <p className="text-[11px] leading-relaxed whitespace-pre-line text-white/90">
                {msg.message}
              </p>
            </div>

            {/* OTP Code Badge & Quick Action */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                <span className="text-[10px] text-white/70 font-semibold">Kod 2FA:</span>
                <span className="font-mono font-black text-sm tracking-widest text-amber-300">
                  {msg.code}
                </span>
              </div>

              <button
                onClick={() => handleCopyCode(msg)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedId === msg.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-stone-900 hover:bg-stone-100 shadow-xs'
                }`}
              >
                {copiedId === msg.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Salin & Autofill</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
