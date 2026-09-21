import { FonnteConfig, OrderRecord } from '../types';

export type { FonnteConfig };

export const DEFAULT_FONNTE_CONFIG: FonnteConfig = {
  token: '',
  adminPhone: '01111135503',
  autoNotifyAdmin: true,
  autoNotifyCustomer: true,
  deliveryPersonPhone: '',
};

const STORAGE_KEY = 'freshayam_fonnte_config';

class FonnteService {
  getConfig(): FonnteConfig {
    if (typeof window === 'undefined') return DEFAULT_FONNTE_CONFIG;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_FONNTE_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_FONNTE_CONFIG;
  }

  saveConfig(config: FonnteConfig): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return '601111135503';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('60')) {
      return clean;
    }
    if (clean.startsWith('0')) {
      return '60' + clean.slice(1);
    }
    return '60' + clean;
  }

  async testConnection(token: string): Promise<{ success: boolean; message: string; data?: any }> {
    console.log('[FonnteService] testConnection called with token length:', token?.length || 0);
    if (!token || token.trim() === '') {
      console.warn('[FonnteService] testConnection failed: Empty token provided.');
      return { success: false, message: 'Sila masukkan Fonnte API Token terlebih dahulu.' };
    }

    const fonnteEndpoints = [
      '/api/hitpay.php?action=fonnte-send',
      '/hitpay.php?action=fonnte-send',
      '/api/fonnte/send'
    ];

    const payload = {
      target: '601111135503',
      message: 'Ujian Sambungan Fonnte Gateway dari Khairul FRESH Food',
      token: token.trim(),
      isTest: true
    };

    console.log('[FonnteService] testConnection request payload constructed:', {
      target: payload.target,
      tokenLength: payload.token.length,
      tokenPreview: `${payload.token.slice(0, 4)}...${payload.token.slice(-4)}`,
      isTest: payload.isTest
    });

    for (const ep of fonnteEndpoints) {
      console.log(`[FonnteService] testConnection attempting fetch to: ${ep}`);
      try {
        const response = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        console.log(`[FonnteService] testConnection response status from ${ep}:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        let data: any;
        const text = await response.text();
        console.log(`[FonnteService] testConnection raw response from ${ep}:`, text);

        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.warn(`[FonnteService] testConnection failed to parse JSON from ${ep}:`, parseErr);
          continue;
        }
        
        if (response.ok && data.success) {
          console.log(`[FonnteService] testConnection SUCCESS via ${ep}:`, data);
          return { success: true, message: 'Sambungan ke Fonnte berjaya! (Mod Ujian Peranti)', data };
        } else {
          console.warn(`[FonnteService] testConnection returned non-success from ${ep}:`, data);
        }
      } catch (err) {
        console.error(`[FonnteService] testConnection exception for ${ep}:`, err);
      }
    }
    return { success: false, message: 'Gagal menghubungi proksi Fonnte.' };
  }

  buildAdminOrderNotificationMessage(order: OrderRecord): string {
    return `*[ADMIN] PESANAN BARU KHAIRUL FRESH FOOD*\n\n` +
      `ID Pesanan: ${order.orderId}\n` +
      `Pelanggan: ${order.customer.fullName}\n` +
      `No. Telefon: ${order.customer.phone}\n\n` +
      `*Item Tempahan:*\n` +
      order.items.map(item => `- ${item.quantity}x ${item.product.name} (RM ${(item.itemTotalPrice).toFixed(2)})`).join('\n') +
      `\n\nJumlah Keseluruhan: *RM ${order.total.toFixed(2)}*\n` +
      `Status Bayaran: ${order.customer?.paymentMethod || 'Online'}\n\n` +
      `Sila semak Portal Pentadbir untuk butiran lanjut.`;
  }

  buildCustomerOrderNotificationMessage(order: OrderRecord): string {
    return `*KHAIRUL FRESH FOOD*\n\n` +
      `Terima kasih ${order.customer.fullName}! Kami telah menerima pesanan anda.\n\n` +
      `ID Pesanan: ${order.orderId}\n` +
      `Jumlah Keseluruhan: *RM ${order.total.toFixed(2)}*\n\n` +
      `Pesanan anda sedang diproses dan kami akan menghubungi anda jika terdapat sebarang masalah.\n\n` +
      `Sebarang pertanyaan, sila balas WhatsApp ini.`;
  }

  async sendMessage(targetPhone: string, message: string, customToken?: string, isTest: boolean = false): Promise<{ success: boolean; message: string; data?: any }> {
    console.log('[FonnteService] sendMessage initiated:', {
      targetPhone,
      messageLength: message?.length,
      hasCustomToken: !!customToken,
      isTest
    });

    let token = customToken;
    if (!token || token.trim() === '') {
      const currentConfig = this.getConfig();
      token = currentConfig.token;
    }

    if (!token || token.trim() === '') {
      console.warn('[FonnteService] sendMessage aborted: API token missing or empty.');
      return { success: false, message: 'Fonnte API Token belum dikonfigurasikan.' };
    }

    const formattedTarget = this.formatPhoneNumber(targetPhone);
    console.log('[FonnteService] Formatted target phone:', { original: targetPhone, formatted: formattedTarget });

    if (!formattedTarget || formattedTarget.length < 9) {
      console.warn('[FonnteService] sendMessage aborted: Invalid target phone length:', formattedTarget);
      return { success: false, message: `Nombor telefon tidak sah: ${targetPhone}` };
    }

    const fonnteEndpoints = [
      '/api/hitpay.php?action=fonnte-send',
      '/hitpay.php?action=fonnte-send',
      '/api/fonnte/send'
    ];

    const payload = {
      target: formattedTarget,
      message: message,
      token: token.trim(),
      isTest: isTest
    };

    console.log('[FonnteService] Payload constructed for sendMessage:', {
      target: payload.target,
      tokenLength: payload.token.length,
      tokenPreview: `${payload.token.slice(0, 4)}...${payload.token.slice(-4)}`,
      messagePreview: payload.message.slice(0, 80) + '...',
      isTest: payload.isTest
    });

    for (const ep of fonnteEndpoints) {
      console.log(`[FonnteService] Fetching endpoint: ${ep}`);
      try {
        const response = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        console.log(`[FonnteService] Response status from ${ep}:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        let data: any;
        const text = await response.text();
        console.log(`[FonnteService] Raw response body from ${ep}:`, text);

        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.warn(`[FonnteService] Failed to parse JSON response from ${ep}:`, parseErr);
          continue;
        }

        console.log(`[FonnteService] Parsed response data from ${ep}:`, data);

        if (response.ok && data.success) {
          console.log(`[FonnteService] Message successfully dispatched via ${ep}`);
          return { success: true, message: 'Berjaya dihantar', data };
        } else {
          console.warn(`[FonnteService] Endpoint ${ep} returned failure state:`, {
            statusOk: response.ok,
            dataSuccess: data?.success,
            dataDetail: data?.detail || data?.reason || data?.message || data
          });
        }
      } catch (err) {
        console.error(`[FonnteService] Exception during fetch to ${ep}:`, err);
      }
    }

    console.error('[FonnteService] All Fonnte endpoints failed to send message.');
    return { success: false, message: 'Gagal menghantar melalui gateway WhatsApp.' };
  }

  async triggerNewOrderNotification(
    order: OrderRecord, 
    customConfig?: Partial<FonnteConfig>
  ): Promise<{ adminSent: boolean; customerSent: boolean; error?: string }> {
    console.log('[FonnteService] === START triggerNewOrderNotification ===', {
      orderId: order.orderId,
      customerName: order.customer?.fullName,
      customerPhone: order.customer?.phone,
      total: order.total,
      customConfigProvided: !!customConfig
    });

    let config = this.getConfig();
    console.log('[FonnteService] Loaded local config:', {
      hasToken: !!config.token,
      tokenLength: config.token?.length || 0,
      adminPhone: config.adminPhone,
      autoNotifyAdmin: config.autoNotifyAdmin,
      autoNotifyCustomer: config.autoNotifyCustomer
    });

    if (customConfig && customConfig.token && customConfig.token.trim() !== '') {
      console.log('[FonnteService] Overriding config with provided customConfig token.');
      config = {
        ...config,
        ...customConfig,
        token: customConfig.token.trim(),
        autoNotifyAdmin: customConfig.autoNotifyAdmin !== false,
      };
      this.saveConfig(config);
    }

    if (!config.token || config.token.trim() === '') {
      console.log('[FonnteService] Token empty in local storage. Attempting Firestore fallback (site_settings/main)...');
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const settingsSnap = await getDoc(doc(db, 'site_settings', 'main'));
        if (settingsSnap.exists()) {
          const cloudData = settingsSnap.data() as any;
          if (cloudData && cloudData.fonnteConfig && cloudData.fonnteConfig.token) {
            console.log('[FonnteService] Retrieved fonnteConfig token from Firestore cloud document.');
            config = {
              ...DEFAULT_FONNTE_CONFIG,
              ...cloudData.fonnteConfig,
              autoNotifyAdmin: cloudData.fonnteConfig.autoNotifyAdmin !== false,
            };
            this.saveConfig(config);
          } else {
            console.warn('[FonnteService] Firestore site_settings/main exists but fonnteConfig.token is missing or empty.');
          }
        } else {
          console.warn('[FonnteService] Firestore site_settings/main document does not exist.');
        }
      } catch (e) {
        console.error('[FonnteService] Error fetching fonnteConfig from Firestore:', e);
      }
    }

    // Step 1: Token Validation
    const isTokenValid = !!(config.token && config.token.trim() !== '');
    console.log('[FonnteService] [STEP 1] API Token Validation:', {
      isTokenValid,
      tokenLength: config.token ? config.token.trim().length : 0,
      tokenPreview: isTokenValid ? `${config.token.trim().slice(0, 4)}...${config.token.trim().slice(-4)}` : 'N/A'
    });

    let adminSent = false;
    let customerSent = false;
    let lastError: string | undefined;

    if (!isTokenValid) {
      console.error('[FonnteService] [STEP 1 FAILED] Validation error: API Token is empty or unconfigured. Aborting auto-notification.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('khairul_fresh_fonnte_dispatched', {
          detail: { orderId: order.orderId, adminSent: false, customerSent: false, error: 'Token belum diisi' }
        }));
      }
      return { adminSent: false, customerSent: false, error: 'Token belum diisi' };
    }

    // Step 2: Admin Request Payload Construction & Dispatch
    const shouldNotifyAdmin = config.autoNotifyAdmin !== false;
    console.log('[FonnteService] [STEP 2] Admin Notification Config:', {
      autoNotifyAdminConfig: config.autoNotifyAdmin,
      shouldNotifyAdmin,
      adminPhoneConfigured: config.adminPhone
    });

    if (shouldNotifyAdmin) {
      const adminTarget = config.adminPhone || '01111135503';
      const adminMsg = this.buildAdminOrderNotificationMessage(order);
      
      console.log('[FonnteService] [STEP 2] Admin Payload Construction:', {
        adminTarget,
        adminTargetFormatted: this.formatPhoneNumber(adminTarget),
        messageLength: adminMsg.length,
        messagePreview: adminMsg.slice(0, 120) + '...'
      });

      console.log('[FonnteService] [STEP 3] Dispatching Admin Notification...');
      const res = await this.sendMessage(adminTarget, adminMsg, config.token);
      console.log('[FonnteService] [STEP 3] Admin Notification Dispatch Result:', {
        success: res.success,
        responseMessage: res.message,
        data: res.data
      });

      if (res.success) {
        adminSent = true;
      } else {
        lastError = res.message;
      }
    } else {
      console.warn('[FonnteService] Auto-notify admin is explicitly disabled in config.');
    }

    // Step 3: Customer Request Payload Construction & Dispatch
    if (config.autoNotifyCustomer && order.customer?.phone) {
      const customerTarget = order.customer.phone;
      const customerMsg = this.buildCustomerOrderNotificationMessage(order);
      
      console.log('[FonnteService] Dispatching Customer Notification:', {
        customerTarget,
        customerTargetFormatted: this.formatPhoneNumber(customerTarget),
        messageLength: customerMsg.length
      });

      const resCustomer = await this.sendMessage(customerTarget, customerMsg, config.token);
      console.log('[FonnteService] Customer Notification Dispatch Result:', {
        success: resCustomer.success,
        responseMessage: resCustomer.message,
        data: resCustomer.data
      });

      if (resCustomer.success) {
        customerSent = true;
      }
    } else {
      console.log('[FonnteService] Customer notification skipped:', {
        autoNotifyCustomer: config.autoNotifyCustomer,
        hasCustomerPhone: !!order.customer?.phone
      });
    }

    console.log('[FonnteService] === SUMMARY triggerNewOrderNotification ===', {
      orderId: order.orderId,
      adminSent,
      customerSent,
      error: lastError
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('khairul_fresh_fonnte_dispatched', {
        detail: { 
          orderId: order.orderId, 
          adminSent, 
          customerSent, 
          error: adminSent ? undefined : lastError 
        }
      }));
    }

    return { adminSent, customerSent, error: lastError };
  }
}

export const fonnteService = new FonnteService();
