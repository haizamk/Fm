import React, { useState } from 'react';
import { 
  MessageCircle, 
  Key, 
  Phone, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Zap, 
  Radio, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  ExternalLink,
  ShieldCheck,
  Bell,
  Smartphone,
  UserCheck
} from 'lucide-react';
import { fonnteService, FonnteConfig } from '../services/fonnteService';

interface AdminWhatsAppGatewayTabProps {
  fonnteToken: string;
  setFonnteToken: (val: string) => void;
  fonnteAdminPhone: string;
  setFonnteAdminPhone: (val: string) => void;
  fonnteAutoNotifyAdmin: boolean;
  setFonnteAutoNotifyAdmin: (val: boolean) => void;
  fonnteAutoNotifyCustomer: boolean;
  setFonnteAutoNotifyCustomer: (val: boolean) => void;
  showFonnteToken: boolean;
  setShowFonnteToken: (val: boolean) => void;
  fonnteTesting: boolean;
  fonnteTestResult: { success: boolean; message: string; data?: any } | null;
  handleTestFonnteConnection: () => Promise<void>;
  testCustomPhone: string;
  setTestCustomPhone: (val: string) => void;
  testCustomMessage: string;
  setTestCustomMessage: (val: string) => void;
  fonnteSendingTestMsg: boolean;
  handleSendTestMessage: () => Promise<void>;
  handleSaveFonnteConfig: (e?: React.FormEvent) => void;
}

export const AdminWhatsAppGatewayTab: React.FC<AdminWhatsAppGatewayTabProps> = ({
  fonnteToken,
  setFonnteToken,
  fonnteAdminPhone,
  setFonnteAdminPhone,
  fonnteAutoNotifyAdmin,
  setFonnteAutoNotifyAdmin,
  fonnteAutoNotifyCustomer,
  setFonnteAutoNotifyCustomer,
  showFonnteToken,
  setShowFonnteToken,
  fonnteTesting,
  fonnteTestResult,
  handleTestFonnteConnection,
  testCustomPhone,
  setTestCustomPhone,
  testCustomMessage,
  setTestCustomMessage,
  fonnteSendingTestMsg,
  handleSendTestMessage,
  handleSaveFonnteConfig,
}) => {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Banner Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-emerald-950 via-stone-900 to-stone-950 text-white border border-emerald-800/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-900/50 shrink-0">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black text-white font-['Outfit']">
                  WhatsApp Auto-Gateway (Fonnte)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Auto-Dispatch 24/7
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                Hantar notifikasi pesanan baharu terus masuk ke WhatsApp Admin (011-11135503) secara automatik tanpa perlu pelanggan klik WhatsApp secara manual.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
              fonnteToken.trim() 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{fonnteToken.trim() ? '🟢 Gateway Aktif' : '🟡 Menunggu Token'}</span>
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="pt-3 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-[11px]">Auto Hantar Admin</span>
              <span className="text-[10px] text-stone-400">011-11135503 serta-merta</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-[11px]">Format Pesanan Kemas</span>
              <span className="text-[10px] text-stone-400">Butiran ayam, potong & slot</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-[11px]">Fonnte API Server</span>
              <span className="text-[10px] text-stone-400">Stabil, pantas & selamat</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-[11px]">Tanpa Klik Manual</span>
              <span className="text-[10px] text-stone-400">Background trigger terus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Configuration Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSaveFonnteConfig(); }} className="p-5 sm:p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        
        {/* Section 1: API Token & Credentials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-800">
            <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>1. Kunci API Fonnte (API Token)</span>
            </h4>
            <a 
              href="https://fonnte.com" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Daftar / Buka Fonnte.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Token Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <span>Fonnte Account Device Token (Authorization Header)</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowFonnteToken(!showFonnteToken)}
                className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showFonnteToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showFonnteToken ? 'Sembunyi' : 'Papar Token'}</span>
              </button>
            </div>

            <input
              type={showFonnteToken ? 'text' : 'password'}
              value={fonnteToken}
              onChange={(e) => setFonnteToken(e.target.value)}
              placeholder="cth: abc123def456_xyz789..."
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-3 text-xs font-mono text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-900"
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              Token ini boleh disalin dari dashboard <strong>Fonnte.com &gt; Device &gt; Token</strong> setelah anda mengimbas kod QR WhatsApp peranti anda.
            </p>
          </div>
        </div>

        {/* Section 2: Target Admin & Recipient Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-800">
            <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>2. Nombor WhatsApp Admin & Polisi Notifikasi</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Nombor WhatsApp Admin Utama Penerima Pesanan
              </label>
              <input
                type="text"
                value={fonnteAdminPhone}
                onChange={(e) => setFonnteAdminPhone(e.target.value)}
                placeholder="011-11135503"
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-xs text-stone-900 dark:text-white font-bold focus:outline-hidden focus:border-emerald-500"
              />
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Setiap kali pesanan siap dibayar, pesanan lengkap akan dihantar terus ke nombor ini.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Option 1: Auto notify Admin */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fonnteAutoNotifyAdmin}
                  onChange={(e) => setFonnteAutoNotifyAdmin(e.target.checked)}
                  className="mt-0.5 rounded-sm text-emerald-600"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900 dark:text-white block">
                    Auto-Hantar ke WhatsApp Admin (011-11135503)
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Disyorkan AKTIF untuk memastikan admin terima notifikasi tanpa menunggu pelanggan tekan butang.
                  </span>
                </div>
              </label>

              {/* Option 2: Auto notify Customer */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fonnteAutoNotifyCustomer}
                  onChange={(e) => setFonnteAutoNotifyCustomer(e.target.checked)}
                  className="mt-0.5 rounded-sm text-emerald-600"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900 dark:text-white block">
                    Auto-Hantar Resit Ringkas ke WhatsApp Pelanggan
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Hantar mesej pengesahan pesanan terus ke nombor telefon pelanggan yang membuat pesanan.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Live Connection Diagnostics & Status Checker */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>3. Ujian Sambungan Peranti WhatsApp Fonnte (Diagnostics)</span>
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Semak sama ada token Fonnte sah dan peranti WhatsApp anda sedang tersambung (Connected).
              </p>
            </div>

            <button
              type="button"
              disabled={fonnteTesting || !fonnteToken.trim()}
              onClick={handleTestFonnteConnection}
              className="px-4 py-2.5 bg-stone-900 dark:bg-stone-700 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {fonnteTesting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyemak Fonnte...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Semak Sambungan Peranti</span>
                </>
              )}
            </button>
          </div>

          {/* Test Result Message */}
          {fonnteTestResult && (
            <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
              fonnteTestResult.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              {fonnteTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="block font-bold">
                  {fonnteTestResult.success ? 'Peranti WhatsApp Tersambung!' : 'Ralat Sambungan Fonnte'}
                </strong>
                <span className="text-[11px] mt-0.5 block">{fonnteTestResult.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Live Message Dispatch Test */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
          <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>4. Hantar Mesej WhatsApp Ujian Sebenar (Live Test Message)</span>
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Hantar satu mesej ujian ke nombor telefon anda untuk memastikan gateway berfungsi sepenuhnya.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                Nombor Penerima Ujian:
              </label>
              <input
                type="text"
                value={testCustomPhone}
                onChange={(e) => setTestCustomPhone(e.target.value)}
                placeholder="011-11135503"
                className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-xs text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                Teks Mesej Ujian:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testCustomMessage}
                  onChange={(e) => setTestCustomMessage(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-xs text-stone-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  disabled={fonnteSendingTestMsg || !fonnteToken.trim()}
                  onClick={handleSendTestMessage}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {fonnteSendingTestMsg ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menghantar...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Hantar Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Konfigurasi WhatsApp Gateway</span>
          </button>
        </div>

      </form>
    </div>
  );
};
