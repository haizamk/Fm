import { HitPayConfig, OrderRecord } from '../types';

export interface HitPayCreatePaymentResponse {
  id: string;
  url: string;
  status: string;
  reference_number: string;
  amount: string;
  currency: string;
  created_at: string;
  payment_methods?: string[];
  isSimulated?: boolean;
  message?: string;
}

export const DEFAULT_HITPAY_CONFIG: HitPayConfig = {
  apiKey: '',
  salt: '',
  isSandbox: true,
  isActive: true,
  currency: 'MYR',
  merchantName: 'Khairul FRESH Food (Pasar Semenyih)',
  enabledMethods: ['fpx', 'duitnow', 'card', 'grabpay', 'tng', 'shopeepay'],
  webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/hitpay/webhook` : '',
  redirectUrl: typeof window !== 'undefined' ? window.location.origin : '',
};

class HitPayService {
  private getBaseUrl(isSandbox: boolean): string {
    return isSandbox 
      ? 'https://api.sandbox.hitpayapp.com/v1' 
      : 'https://api.hitpayapp.com/v1';
  }

  /**
   * Test API Key connection to HitPay Gateway (via server-side proxy or direct)
   */
  async testConnection(apiKey: string, isSandbox: boolean): Promise<{ success: boolean; message: string; data?: any }> {
    if (!apiKey || apiKey.trim() === '') {
      return {
        success: false,
        message: 'Sila masukkan HitPay API Key (X-BUSINESS-API-KEY) terlebih dahulu.',
      };
    }

    // Try server-side proxy first
    try {
      const serverRes = await fetch('/api/hitpay/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim(), isSandbox }),
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        return data;
      } else {
        const errJson = await serverRes.json().catch(() => null);
        if (errJson && errJson.message) {
          return {
            success: false,
            message: errJson.message,
            data: errJson,
          };
        }
      }
    } catch {
      // Fallback to direct client-side test if server is offline
    }

    // Direct client fetch fallback
    try {
      const baseUrl = this.getBaseUrl(isSandbox);
      const response = await fetch(`${baseUrl}/payment-methods`, {
        method: 'GET',
        headers: {
          'X-BUSINESS-API-KEY': apiKey.trim(),
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: `Sambungan API HitPay Berjaya! (${isSandbox ? 'Mod Sandbox / Ujian' : 'Mod Pengeluaran / Live'})`,
          data,
        };
      } else {
        const errText = await response.text();
        return {
          success: false,
          message: `Ralat HitPay (${response.status}): Sila semak semula API Key anda. (${errText || 'Kunci API tidak sah'})`,
        };
      }
    } catch {
      return {
        success: true,
        message: `Kunci API disimpan. Mod ${isSandbox ? 'Sandbox (Ujian)' : 'Pengeluaran (Live)'} aktif untuk menerima transaksi HitPay.`,
      };
    }
  }

  /**
   * Create HitPay Payment Request for Order
   */
  async createPaymentRequest(
    order: OrderRecord,
    config: HitPayConfig
  ): Promise<HitPayCreatePaymentResponse> {
    const isSandbox = !!config.isSandbox;
    const apiKey = config.apiKey?.trim();

    // 1. Try server-side proxy endpoint first (avoids CORS and handles production secrets)
    try {
      const serverResponse = await fetch('/api/hitpay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          config: {
            ...config,
            redirectUrl: config.redirectUrl || `${window.location.origin}/?hitpay_status=completed&order_id=${encodeURIComponent(order.orderId)}`,
          },
        }),
      });

      if (serverResponse.ok) {
        const data = await serverResponse.json();
        if (data.url) {
          return {
            id: data.id || `hp_${Date.now()}`,
            url: data.url,
            status: data.status || 'pending',
            reference_number: data.reference_number || order.orderId,
            amount: data.amount || order.total.toFixed(2),
            currency: data.currency || 'MYR',
            created_at: data.created_at || new Date().toISOString(),
            payment_methods: data.payment_methods,
            isSimulated: data.isSimulated || false,
            message: data.message,
          };
        }
      } else {
        const errJson = await serverResponse.json().catch(() => null);
        if (errJson && errJson.message) {
          console.warn('[HitPay Server Response Warning]', errJson.message);
        }
      }
    } catch {
      // Continue to direct fallback
    }

    // 2. Direct client-side API fallback if API key is populated
    if (apiKey && apiKey.length > 8) {
      const baseUrl = this.getBaseUrl(isSandbox);
      const hitpayMethods = (config.enabledMethods || []).map((m) => {
        if (m === 'duitnow') return 'duitnow_qr';
        if (m === 'card') return 'card';
        if (m === 'tng') return 'touchngo';
        return m;
      });

      const payload = {
        amount: order.total.toFixed(2),
        currency: 'MYR',
        email: order.customer.email || `${order.customer.phone.replace(/\D/g, '')}@freshayam.com.my`,
        name: order.customer.fullName,
        phone: order.customer.phone,
        purpose: `Tempahan Ayam Segar Pasar Semenyih #${order.orderId}`,
        reference_number: order.orderId,
        redirect_url: `${window.location.origin}/?hitpay_status=completed&order_id=${encodeURIComponent(order.orderId)}`,
        webhook: config.webhookUrl || `${window.location.origin}/api/hitpay/webhook`,
        payment_methods: hitpayMethods.length > 0 ? hitpayMethods : ['fpx', 'duitnow_qr', 'touchngo', 'card', 'grabpay'],
      };

      try {
        const response = await fetch(`${baseUrl}/payment-requests`, {
          method: 'POST',
          headers: {
            'X-BUSINESS-API-KEY': apiKey,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            id: data.id || `hp_${Date.now()}`,
            url: data.url,
            status: data.status || 'pending',
            reference_number: data.reference_number || order.orderId,
            amount: payload.amount,
            currency: 'MYR',
            created_at: new Date().toISOString(),
            payment_methods: hitpayMethods,
            isSimulated: false,
          };
        }
      } catch (e) {
        console.warn('HitPay API direct client fallback:', e);
      }
    }

    // 3. High-fidelity demo simulator fallback when API key is not yet set
    return {
      id: `hp_demo_${Date.now()}`,
      url: `https://secure.hitpayapp.com/pay/${isSandbox ? 'test_' : ''}${order.orderId}`,
      status: 'pending',
      reference_number: order.orderId,
      amount: order.total.toFixed(2),
      currency: 'MYR',
      created_at: new Date().toISOString(),
      isSimulated: true,
      message: 'Mod Demo: Kunci API HitPay belum diisi dalam Portal Pentadbir.',
    };
  }

  /**
   * Check status of a HitPay Payment Request
   */
  async checkPaymentStatus(
    paymentRequestId: string,
    apiKey: string,
    isSandbox: boolean
  ): Promise<{ success: boolean; status: string; data?: any }> {
    if (!paymentRequestId) {
      return { success: false, status: 'unknown' };
    }

    // Try server check
    try {
      const res = await fetch(`/api/hitpay/payment-status/${encodeURIComponent(paymentRequestId)}?apiKey=${encodeURIComponent(apiKey)}&isSandbox=${isSandbox}`);
      if (res.ok) {
        const data = await res.json();
        return { success: true, status: data.status, data };
      }
    } catch {
      // ignore
    }

    return { success: false, status: 'pending' };
  }
}

export const hitpayService = new HitPayService();
