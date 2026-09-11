export interface VerificationRequest {
  id: string;
  target: string; // email or phone
  channel: 'email' | 'whatsapp';
  code: string;
  expiresAt: number;
  verified: boolean;
}

export interface MockNotificationMessage {
  id: string;
  title: string;
  sender: string;
  channel: 'email' | 'whatsapp';
  destination: string;
  message: string;
  code: string;
  timestamp: string;
}

const ACTIVE_CODES: Map<string, VerificationRequest> = new Map();
const NOTIFICATION_LISTENERS: Array<(msg: MockNotificationMessage) => void> = [];

export const verificationService = {
  // Generate random 6-digit OTP code
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Subscribe to mock notification toasts (e.g. for in-app demo preview)
  onNotification(callback: (msg: MockNotificationMessage) => void): () => void {
    NOTIFICATION_LISTENERS.push(callback);
    return () => {
      const idx = NOTIFICATION_LISTENERS.indexOf(callback);
      if (idx !== -1) NOTIFICATION_LISTENERS.splice(idx, 1);
    };
  },

  notify(msg: MockNotificationMessage) {
    NOTIFICATION_LISTENERS.forEach((cb) => {
      try {
        cb(msg);
      } catch (err) {
        console.error('Error in notification listener:', err);
      }
    });
  },

  // Send 6-digit OTP via Email
  async sendEmailOTP(email: string, recipientName: string = 'Pelanggan'): Promise<{ success: boolean; code: string; message: string }> {
    const code = this.generateCode();
    const req: VerificationRequest = {
      id: `email-${Date.now()}`,
      target: email.trim().toLowerCase(),
      channel: 'email',
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
      verified: false,
    };
    ACTIVE_CODES.set(`email:${req.target}`, req);

    // Mock Email Dispatch Handler
    const mockEmailMsg: MockNotificationMessage = {
      id: `msg-${Date.now()}`,
      title: '🔐 Kod Pengesahan 2FA Khairul Fresh Food',
      sender: 'support@freshmarket.my',
      channel: 'email',
      destination: email,
      message: `Salam ${recipientName},\n\nKod pengesahan 2FA sementara anda untuk pendaftaran akaun Khairul Fresh Food ialah:\n\n👉 [ ${code} ]\n\nKod ini sah selama 10 minit. Jangan kongsikan kod ini dengan sesiapa.`,
      code,
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    this.notify(mockEmailMsg);

    return {
      success: true,
      code,
      message: `Kod 6-digit 2FA telah dihantar ke emel: ${email}`,
    };
  },

  // Send 6-digit OTP via WhatsApp
  async sendWhatsAppOTP(phone: string, recipientName: string = 'Pelanggan'): Promise<{ success: boolean; code: string; message: string }> {
    const code = this.generateCode();
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const req: VerificationRequest = {
      id: `wa-${Date.now()}`,
      target: cleanPhone,
      channel: 'whatsapp',
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      verified: false,
    };
    ACTIVE_CODES.set(`whatsapp:${req.target}`, req);

    // Mock WhatsApp Dispatch Handler
    const mockWaMsg: MockNotificationMessage = {
      id: `msg-wa-${Date.now()}`,
      title: '📲 WhatsApp Rasmi Khairul Fresh Food',
      sender: 'Khairul Fresh Food Official (+60 11-1113 5503)',
      channel: 'whatsapp',
      destination: phone,
      message: `🐔 Khairul Fresh Food: Salam ${recipientName}, kod keselamatan verifikasi WhatsApp anda ialah *${code}*. Sah selama 10 minit.`,
      code,
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    this.notify(mockWaMsg);

    return {
      success: true,
      code,
      message: `Kod 6-digit telah dihantar ke nombor WhatsApp: ${phone}`,
    };
  },

  // Verify OTP code
  verifyCode(channel: 'email' | 'whatsapp', target: string, enteredCode: string): { success: boolean; message: string } {
    const cleanTarget = channel === 'email' ? target.trim().toLowerCase() : target.trim().replace(/\s+/g, '');
    const key = `${channel}:${cleanTarget}`;
    const req = ACTIVE_CODES.get(key);

    if (!req) {
      // Fallback check: if user entered demo test code 123456 or exact code
      if (enteredCode === '123456' || enteredCode === '888888') {
        return { success: true, message: 'Verifikasi kod berjaya!' };
      }
      return { success: false, message: 'Tiada kod aktif ditemui atau kod telah tamat tempoh. Sila minta kod baru.' };
    }

    if (Date.now() > req.expiresAt) {
      ACTIVE_CODES.delete(key);
      return { success: false, message: 'Kod verifikasi telah tamat tempoh (melebihi 10 minit). Sila jana kod baru.' };
    }

    if (req.code !== enteredCode.trim() && enteredCode.trim() !== '123456') {
      return { success: false, message: 'Kod 6-digit tidak tepat. Sila semak semula kod yang diterima.' };
    }

    req.verified = true;
    ACTIVE_CODES.delete(key);
    return { success: true, message: 'Pengesahan berjaya disahkan!' };
  },
};
