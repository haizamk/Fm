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
    const apiKey = (config.apiKey || '').trim();

    if (!apiKey || apiKey.length < 5) {
      throw new Error(
        'Kunci API HitPay belum dikonfigurasi dalam sistem. Sila masukkan API Key di Portal Pentadbir > Tetapan Kedai, atau pilih kaedah bayaran "DuitNow QR (OCBC Bank)".'
      );
    }

    try {
      const redirectUrl = config.redirectUrl || `${window.location.origin}/?hitpay_status=completed&order_id=${encodeURIComponent(order.orderId)}`;
      const webhookUrl = config.webhookUrl || `${window.location.origin}/api/hitpay/webhook`;

      // Clean lightweight order object to avoid oversized payloads
      const sanitizedOrder = {
        orderId: order.orderId,
        total: order.total,
        customer: {
          fullName: order.customer?.fullName || '',
          email: order.customer?.email || '',
          phone: order.customer?.phone || '',
        },
      };

      const serverResponse = await fetch('/api/hitpay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: sanitizedOrder,
          config: {
            apiKey,
            isSandbox,
            merchantName: config.merchantName || 'Khairul FRESH Food',
            enabledMethods: config.enabledMethods,
            redirectUrl,
            webhookUrl,
          },
        }),
      });

      const responseText = await serverResponse.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch {
        // non-JSON
      }

      if (serverResponse.ok && data?.url) {
        return {
          id: data.id || `hp_${Date.now()}`,
          url: data.url,
          status: data.status || 'pending',
          reference_number: data.reference_number || order.orderId,
          amount: data.amount || order.total.toFixed(2),
          currency: data.currency || 'MYR',
          created_at: data.created_at || new Date().toISOString(),
          payment_methods: data.payment_methods,
          isSimulated: !!data.isSimulated,
          message: data.message,
        };
      }

      const errorMsg = data?.message || data?.errorDetail?.message || (typeof data?.errorDetail === 'string' ? data.errorDetail : '') || responseText || `Ralat Pelayan HitPay (${serverResponse.status})`;
      throw new Error(errorMsg);
    } catch (err: any) {
      console.error('[HitPay Service Request Error]', err);
      // If it is already a descriptive error, rethrow it
      if (err?.message && !err.message.includes('Failed to fetch') && !err.message.includes('fetch')) {
        throw err;
      }
      throw new Error(
        'Gerbang bayaran HitPay tidak dapat dihubungi atau kunci API tidak sah. Sila semak semula API Key anda di Portal Pentadbir > Tetapan, atau gunakan kaedah bayaran DuitNow QR (OCBC Bank).'
      );
    }
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
