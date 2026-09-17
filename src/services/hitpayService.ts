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
  /**
   * Test API Key connection to HitPay Gateway
   */
  async testConnection(apiKey: string, isSandbox: boolean): Promise<{ success: boolean; message: string; data?: any }> {
    if (!apiKey || apiKey.trim() === '') {
      return {
        success: false,
        message: 'Sila masukkan HitPay API Key (X-BUSINESS-API-KEY) terlebih dahulu.',
      };
    }

    try {
      const serverRes = await fetch('/api/hitpay/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim(), isSandbox }),
      });

      const text = await serverRes.text();
      try {
        const data = JSON.parse(text);
        return data;
      } catch {
        return {
          success: false,
          message: 'Ralat: API Gateway HitPay memulangkan teks tidak sah (Bukan format JSON).',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal menghubungi pelayan proksi HitPay. Sila pastikan pelayan sedang berjalan.',
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
        'Kunci API HitPay belum dikonfigurasi. Sila hubungi pentadbir untuk mengemaskini Tetapan Kedai.'
      );
    }

    try {
      const redirectUrl = config.redirectUrl || `${window.location.origin}/?hitpay_status=completed&order_id=${encodeURIComponent(order.orderId)}`;
      const webhookUrl = config.webhookUrl || `${window.location.origin}/api/hitpay/webhook`;

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

      let data: any;
      try {
        const text = await serverResponse.text();
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Ralat pelayan: Gagal memproses pautan bayaran. Sila pastikan sistem backend/Node.js berfungsi sepenuhnya.');
      }

      if (serverResponse.ok && data?.success) {
        return {
          id: data.id,
          url: data.url,
          status: data.status,
          reference_number: data.reference_number,
          amount: data.amount,
          currency: data.currency,
          created_at: data.created_at,
          payment_methods: data.payment_methods,
          isSimulated: data.isSimulated,
          message: data.message,
        };
      }

      throw new Error(data?.message || 'Ralat dari server HitPay.');
    } catch (err: any) {
      console.error('[HitPay Service Error]', err);
      throw new Error(err.message || 'Gerbang bayaran HitPay tidak dapat dihubungi.');
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

    try {
      const res = await fetch(`/api/hitpay/payment-status/${encodeURIComponent(paymentRequestId)}?apiKey=${encodeURIComponent(apiKey)}&isSandbox=${isSandbox}`);
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, status: 'pending' };
      }
      if (res.ok && data.success) {
        return { success: true, status: data.status, data };
      }
      return { success: false, status: 'pending' };
    } catch {
      return { success: false, status: 'pending' };
    }
  }
}

export const hitpayService = new HitPayService();
