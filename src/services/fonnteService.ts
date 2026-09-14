import { OrderRecord } from '../types';

export interface FonnteConfig {
  token: string;
  adminPhone: string; // e.g. 011-11135503 or 601111135503
  autoNotifyAdmin: boolean;
  autoNotifyCustomer: boolean;
  deviceStatus?: 'connected' | 'disconnected' | 'unknown';
}

export const DEFAULT_FONNTE_CONFIG: FonnteConfig = {
  token: '',
  adminPhone: '011-11135503',
  autoNotifyAdmin: true,
  autoNotifyCustomer: false,
  deviceStatus: 'unknown',
};

export const FONNTE_STORAGE_KEY = 'khairul_fresh_fonnte_config_v1';

class FonnteService {
  private apiUrl = 'https://api.fonnte.com/send';
  private validateDeviceUrl = 'https://api.fonnte.com/device';

  getConfig(): FonnteConfig {
    try {
      const saved = localStorage.getItem(FONNTE_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_FONNTE_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error reading Fonnte config:', e);
    }
    return DEFAULT_FONNTE_CONFIG;
  }

  saveConfig(config: FonnteConfig): void {
    try {
      localStorage.setItem(FONNTE_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving Fonnte config:', e);
    }
  }

  /**
   * Format phone numbers for Malaysia (+60)
   * 011-11135503 -> 601111135503
   */
  formatPhoneNumber(phone: string): string {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('60')) {
      return clean;
    }
    if (clean.startsWith('0')) {
      return '60' + clean.slice(1);
    }
    return '60' + clean;
  }

  /**
   * Test connection to Fonnte API
   */
  async testConnection(token: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (!token || token.trim() === '') {
      return {
        success: false,
        message: 'Sila masukkan Fonnte API Token terlebih dahulu.',
      };
    }

    try {
      const response = await fetch(this.validateDeviceUrl, {
        method: 'POST',
        headers: {
          Authorization: token.trim(),
        },
      });

      const data = await response.json();
      if (response.ok && (data.status === true || data.device_status)) {
        return {
          success: true,
          message: `Sambungan Fonnte Berjaya! Peranti WhatsApp: ${data.name || data.device || 'Tersambung'} (${data.device_status || 'Aktif'})`,
          data,
        };
      } else {
        return {
          success: false,
          message: data.reason || data.message || 'Gagal menyambung ke Fonnte. Sila semak token anda.',
          data,
        };
      }
    } catch (err: any) {
      console.error('Fonnte test error:', err);
      return {
        success: false,
        message: 'Ralat sambungan: ' + (err.message || 'Sila pastikan token sah dan internet stabil.'),
      };
    }
  }

  /**
   * Build beautiful and clear WhatsApp Message for admin
   */
  buildAdminOrderNotificationMessage(order: OrderRecord): string {
    const isPickup = order.fulfillmentType === 'pickup';
    const itemsList = order.items
      .map((it, idx) => {
        let cutDesc = it.selectedCut;
        let cleaningDesc = it.selectedCleaning && it.selectedCleaning.length > 0
          ? ` (Bersih: ${it.selectedCleaning.join(', ')})`
          : '';
        let bakarDesc = it.bakarOption === 'bakar' ? ' 🔥 Bakar' : '';
        let organDesc = it.organVariationLabel ? ` [${it.organVariationLabel}]` : '';
        let noteDesc = it.specialNotes ? ` 📝 "${it.specialNotes}"` : '';
        
        return `${idx + 1}. *${it.product.name}* (x${it.quantity})\n   - Potongan: ${cutDesc}${bakarDesc}${organDesc}${cleaningDesc}${noteDesc}\n   - Subtotal: RM ${it.itemTotalPrice.toFixed(2)}`;
      })
      .join('\n\n');

    const paymentStatus = order.customer.hitpayStatus === 'completed' 
      ? '✅ DIBAYAR (HitPay FPX/DuitNow)' 
      : `💳 ${order.customer.paymentMethod.toUpperCase()}`;

    const deliveryNote = order.customer.deliveryInstructions 
      ? `\n📌 *Arahan Penghantaran:* ${order.customer.deliveryInstructions}` 
      : '';

    const orderNote = order.customer.orderNotes 
      ? `\n📝 *Nota Pesanan:* ${order.customer.orderNotes}` 
      : '';

    return `🐔 *PESANAN BAHARU MASUK - KHAIRUL FRESH FOOD* 🐔\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *No. Pesanan:* #${order.orderId}\n` +
      `📅 *Tarikh/Slot:* ${order.estimatedDeliveryText}\n` +
      `🚚 *Jenis:* ${isPickup ? '🏪 SELF-PICKUP DI PASAR SEMENYIH (GA 59)' : '🛵 PENGHANTARAN TERUS KE RUMAH'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *MAKLUMAT PELANGGAN:*\n` +
      `• *Nama:* ${order.customer.fullName}\n` +
      `• *Telefon:* ${order.customer.phone}\n` +
      (isPickup ? `• *Masa Ambil:* Sebelum 12:00 Tengah Hari\n` : `• *Alamat:* ${order.customer.address}, ${order.customer.postcode} ${order.customer.city}, ${order.customer.state}\n`) +
      deliveryNote +
      orderNote +
      `\n\n` +
      `🥩 *SENARAI AYAM & PESANAN:*\n` +
      `${itemsList}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💵 *RINGKASAN BAYARAN:*\n` +
      `• Subtotal Item: RM ${order.subtotal.toFixed(2)}\n` +
      `• Caj Penghantaran: RM ${order.deliveryFee.toFixed(2)}\n` +
      (order.discount > 0 ? `• Diskaun (Kupon): -RM ${order.discount.toFixed(2)}\n` : '') +
      `• *JUMLAH KESELURUHAN: RM ${order.total.toFixed(2)}*\n` +
      `• *Status Bayaran:* ${paymentStatus}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⏱️ *Masa Masuk:* ${new Date(order.createdAt).toLocaleString('ms-MY')}\n\n` +
      `_Sistem Automatik Khairul Fresh Food_`;
  }

  /**
   * Build customer confirmation receipt message
   */
  buildCustomerOrderNotificationMessage(order: OrderRecord): string {
    const isPickup = order.fulfillmentType === 'pickup';
    return `Salam *${order.customer.fullName}*, terima kasih atas pesanan anda di *Khairul Fresh Food*! 🐔✨\n\n` +
      `Pesanan anda *#${order.orderId}* telah berjaya didaftarkan.\n\n` +
      `📅 *Slot:* ${order.estimatedDeliveryText}\n` +
      `💵 *Jumlah Bayaran:* RM ${order.total.toFixed(2)}\n` +
      `📍 *Kaedah:* ${isPickup ? 'Self-Pickup di Gerai GA 59, Pasar Semenyih' : 'Penghantaran Segar ke Alamat Anda'}\n\n` +
      `Ayam segar anda akan diproses awal pagi dan dibungkus rapi. Anda boleh semak status pesanan bila-bila masa di laman web kami.\n\n` +
      `Sebarang pertanyaan boleh hubungi kami di 011-11135503.`;
  }

  /**
   * Send WhatsApp message via Fonnte
   */
  async sendMessage(targetPhone: string, message: string, customToken?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const config = this.getConfig();
    const token = customToken || config.token;

    if (!token || token.trim() === '') {
      return {
        success: false,
        message: 'Fonnte API Token belum dikonfigurasikan.',
      };
    }

    const formattedTarget = this.formatPhoneNumber(targetPhone);
    if (!formattedTarget || formattedTarget.length < 9) {
      return {
        success: false,
        message: `Nombor telefon tidak sah: ${targetPhone}`,
      };
    }

    try {
      const formData = new FormData();
      formData.append('target', formattedTarget);
      formData.append('message', message);
      formData.append('countryCode', '60');

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: token.trim(),
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && (data.status === true || data.id || data.process === 'success')) {
        return {
          success: true,
          message: `Mesej WhatsApp berjaya dihantar ke ${formattedTarget}!`,
          data,
        };
      } else {
        return {
          success: false,
          message: data.reason || data.message || 'Gagal menghantar mesej WhatsApp melalui Fonnte.',
          data,
        };
      }
    } catch (err: any) {
      console.error('Error sending WhatsApp via Fonnte:', err);
      return {
        success: false,
        message: 'Ralat penghantaran: ' + (err.message || 'Masalah rangkaian'),
      };
    }
  }

  /**
   * Main trigger called when order is successfully placed
   */
  async triggerNewOrderNotification(order: OrderRecord): Promise<{ adminSent: boolean; customerSent: boolean; error?: string }> {
    const config = this.getConfig();
    let adminSent = false;
    let customerSent = false;
    let lastError: string | undefined;

    if (!config.token || config.token.trim() === '') {
      console.log('Fonnte token not configured. Skipping background WhatsApp notification.');
      return { adminSent: false, customerSent: false, error: 'Token belum diisi' };
    }

    // 1. Send to Admin (011-11135503 or configured admin number)
    if (config.autoNotifyAdmin) {
      const adminTarget = config.adminPhone || '011-11135503';
      const adminMsg = this.buildAdminOrderNotificationMessage(order);
      const res = await this.sendMessage(adminTarget, adminMsg);
      if (res.success) {
        adminSent = true;
        console.log(`[Fonnte] Auto-dispatched order #${order.orderId} to admin (${adminTarget})`);
      } else {
        lastError = res.message;
        console.warn(`[Fonnte] Failed to notify admin:`, res.message);
      }
    }

    // 2. Optionally send to Customer
    if (config.autoNotifyCustomer && order.customer?.phone) {
      const customerMsg = this.buildCustomerOrderNotificationMessage(order);
      const resCustomer = await this.sendMessage(order.customer.phone, customerMsg);
      if (resCustomer.success) {
        customerSent = true;
        console.log(`[Fonnte] Auto-dispatched order #${order.orderId} to customer (${order.customer.phone})`);
      }
    }

    return { adminSent, customerSent, error: lastError };
  }
}

export const fonnteService = new FonnteService();
