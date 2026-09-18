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
    if (!token || token.trim() === '') {
      return { success: false, message: 'Sila masukkan Fonnte API Token terlebih dahulu.' };
    }

    const fonnteEndpoints = [
      '/api/hitpay.php?action=fonnte-send',
      '/hitpay.php?action=fonnte-send',
      '/api/fonnte/send'
    ];

    for (const ep of fonnteEndpoints) {
      try {
        const response = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: '601111135503',
            message: 'Ujian Sambungan Fonnte Gateway dari Khairul FRESH Food',
            token: token.trim(),
            isTest: true
          }),
        });
        
        let data: any;
        try {
          const text = await response.text();
          data = JSON.parse(text);
        } catch {
          continue;
        }
        
        if (response.ok && data.success) {
          return { success: true, message: 'Sambungan ke Fonnte berjaya! (Mod Ujian Peranti)', data };
        }
      } catch {
        // Try next endpoint
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
    let token = customToken;
    if (!token || token.trim() === '') {
      const currentConfig = this.getConfig();
      token = currentConfig.token;
    }

    if (!token || token.trim() === '') {
      return { success: false, message: 'Fonnte API Token belum dikonfigurasikan.' };
    }

    const formattedTarget = this.formatPhoneNumber(targetPhone);
    if (!formattedTarget || formattedTarget.length < 9) {
      return { success: false, message: `Nombor telefon tidak sah: ${targetPhone}` };
    }

    const fonnteEndpoints = [
      '/api/hitpay.php?action=fonnte-send',
      '/hitpay.php?action=fonnte-send',
      '/api/fonnte/send'
    ];

    for (const ep of fonnteEndpoints) {
      try {
        const response = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: formattedTarget,
            message: message,
            token: token.trim(),
            isTest: isTest
          }),
        });

        let data: any;
        try {
          const text = await response.text();
          data = JSON.parse(text);
        } catch {
          continue;
        }

        if (response.ok && data.success) {
          return { success: true, message: 'Berjaya dihantar', data };
        }
      } catch {
        // Try next endpoint
      }
    }

    return { success: false, message: 'Gagal menghantar melalui gateway WhatsApp.' };
  }

  async triggerNewOrderNotification(
    order: OrderRecord, 
    customConfig?: Partial<FonnteConfig>
  ): Promise<{ adminSent: boolean; customerSent: boolean; error?: string }> {
    let config = this.getConfig();

    if (customConfig && customConfig.token && customConfig.token.trim() !== '') {
      config = {
        ...config,
        ...customConfig,
        token: customConfig.token.trim(),
        autoNotifyAdmin: customConfig.autoNotifyAdmin !== false,
      };
      this.saveConfig(config);
    }

    if (!config.token || config.token.trim() === '') {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const settingsSnap = await getDoc(doc(db, 'site_settings', 'main'));
        if (settingsSnap.exists()) {
          const cloudData = settingsSnap.data() as any;
          if (cloudData && cloudData.fonnteConfig && cloudData.fonnteConfig.token) {
            config = {
              ...DEFAULT_FONNTE_CONFIG,
              ...cloudData.fonnteConfig,
              autoNotifyAdmin: cloudData.fonnteConfig.autoNotifyAdmin !== false,
            };
            this.saveConfig(config);
          }
        }
      } catch (e) {
        // ignore
      }
    }

    let adminSent = false;
    let customerSent = false;
    let lastError: string | undefined;

    if (!config.token || config.token.trim() === '') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('khairul_fresh_fonnte_dispatched', {
          detail: { orderId: order.orderId, adminSent: false, customerSent: false, error: 'Token belum diisi' }
        }));
      }
      return { adminSent: false, customerSent: false, error: 'Token belum diisi' };
    }

    const shouldNotifyAdmin = config.autoNotifyAdmin !== false;
    if (shouldNotifyAdmin) {
      const adminTarget = config.adminPhone || '01111135503';
      const adminMsg = this.buildAdminOrderNotificationMessage(order);
      const res = await this.sendMessage(adminTarget, adminMsg, config.token);
      if (res.success) {
        adminSent = true;
      } else {
        lastError = res.message;
      }
    }

    if (config.autoNotifyCustomer && order.customer?.phone) {
      const customerMsg = this.buildCustomerOrderNotificationMessage(order);
      const resCustomer = await this.sendMessage(order.customer.phone, customerMsg, config.token);
      if (resCustomer.success) {
        customerSent = true;
      }
    }

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
