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

    const cleanKey = apiKey.trim();

    const testEndpoints = [
      '/api/hitpay.php?action=test-connection',
      '/hitpay.php?action=test-connection',
      '/api/hitpay/test-connection',
    ];

    for (const ep of testEndpoints) {
      try {
        const serverRes = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: cleanKey, isSandbox }),
        });

        const text = await serverRes.text();
        try {
          const data = JSON.parse(text);
          if (data && typeof data === 'object') {
            return {
              success: !!data.success,
              message: data.message || (data.success ? 'Sambungan Berjaya' : 'Ralat sambungan HitPay'),
              data: data.data,
            };
          }
        } catch {
          // Fallback to next endpoint
        }
      } catch {
        // Backend unreachable on this endpoint
      }
    }

    // Direct Client-Side HitPay API Check
    try {
      const baseUrl = isSandbox ? 'https://api.sandbox.hit-pay.com/v1' : 'https://api.hit-pay.com/v1';
      const directRes = await fetch(`${baseUrl}/payment-requests`, {
        method: 'GET',
        headers: {
          'X-BUSINESS-API-KEY': cleanKey,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
      });

      const data = await directRes.json().catch(() => ({}));
      if (directRes.ok) {
        return {
          success: true,
          message: `Sambungan API HitPay Berjaya! (${isSandbox ? 'Mod Sandbox / Ujian' : 'Mod Pengeluaran / Live'})`,
          data,
        };
      } else {
        return {
          success: false,
          message: `Ralat HitPay: ${data.message || 'Kunci API tidak sah atau tidak dibenarkan.'}`,
        };
      }
    } catch {
      return {
        success: false,
        message: 'Pelayan backend tidak dapat dihubungi untuk mengesahkan kunci API HitPay. Sila semak fail hitpay.php di pelayan.',
      };
    }
  }

  /**
   * Save HitPay configuration to PHP backend server
   */
  async saveServerConfig(apiKey: string, salt: string, isSandbox: boolean): Promise<boolean> {
    const endpoints = ['/api/hitpay.php?action=save-config', '/hitpay.php?action=save-config'];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: apiKey.trim(), salt: salt.trim(), isSandbox }),
        });
        if (res.ok) return true;
      } catch {
        // continue
      }
    }
    return false;
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

    let baseReturnUrl = typeof window !== 'undefined' ? window.location.origin : '';
    if (config.redirectUrl && config.redirectUrl.trim() !== '') {
      try {
        const u = new URL(config.redirectUrl.trim(), typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        u.searchParams.delete('hitpay_status');
        u.searchParams.delete('order_id');
        u.searchParams.delete('status');
        u.searchParams.delete('reference');
        baseReturnUrl = u.toString().replace(/\/$/, '');
      } catch {
        baseReturnUrl = config.redirectUrl.trim().replace(/\/$/, '');
      }
    }
    const separator = baseReturnUrl.includes('?') ? '&' : '?';
    const redirectUrl = `${baseReturnUrl}${separator}hitpay_return=1&order_id=${encodeURIComponent(order.orderId)}`;
    const webhookUrl = config.webhookUrl || `${baseReturnUrl}/api/hitpay/webhook`;

    // 1. Try PHP Backend Proxy First (Fast, Native HestiaCP / Apache / Nginx PHP support)
    const phpEndpoints = [
      '/api/hitpay.php?action=create-payment',
      '/hitpay.php?action=create-payment',
      '/api/hitpay/create-payment',
    ];

    const sanitizedOrder = {
      orderId: order.orderId,
      total: order.total,
      customer: {
        fullName: order.customer?.fullName || '',
        email: order.customer?.email || '',
        phone: order.customer?.phone || '',
      },
    };

    const requestPayload = JSON.stringify({
      order: sanitizedOrder,
      config: {
        apiKey,
        isSandbox,
        merchantName: config.merchantName || 'Khairul FRESH Food',
        enabledMethods: config.enabledMethods,
        redirectUrl,
        webhookUrl,
      },
    });

    let lastErrorMessage = '';

    for (const endpoint of phpEndpoints) {
      try {
        const serverResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestPayload,
        });

        const text = await serverResponse.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          // Non-JSON response, try next endpoint
          continue;
        }

        if (serverResponse.ok && (data?.success || data?.url)) {
          return {
            id: data.id || `hp_${Date.now()}`,
            url: data.url,
            status: data.status || 'pending',
            reference_number: data.reference_number || String(order.orderId),
            amount: data.amount || String(order.total),
            currency: data.currency || 'MYR',
            created_at: data.created_at || new Date().toISOString(),
            payment_methods: data.payment_methods,
            isSimulated: data.isSimulated || false,
            message: data.message,
          };
        }

        if (data && data.message) {
          lastErrorMessage = data.message;
        }
      } catch (err: any) {
        console.warn(`[HitPay Endpoint Call ${endpoint} Notice]`, err);
        lastErrorMessage = err?.message || 'Gagal menghubungi pelayan backend HitPay.';
      }
    }

    // 2. Second Attempt: Direct Client-Side HitPay API Call
    if (apiKey && apiKey.length >= 5) {
      try {
        const baseUrl = isSandbox ? 'https://api.sandbox.hit-pay.com/v1' : 'https://api.hit-pay.com/v1';
        const customerEmail = (order.customer?.email && order.customer.email.includes('@'))
          ? order.customer.email.trim()
          : `${(order.customer?.phone || 'cust').replace(/\D/g, '') || 'order'}@khairulfreshfood.my`;

        const payload: Record<string, any> = {
          amount: Number(order.total).toFixed(2),
          currency: 'MYR',
          email: customerEmail,
          name: order.customer?.fullName || 'Pelanggan Khairul Fresh Food',
          phone: order.customer?.phone || '',
          purpose: `Tempahan Ayam Segar Pasar Semenyih #${order.orderId}`,
          reference_number: String(order.orderId),
          redirect_url: redirectUrl,
          webhook: webhookUrl,
          send_email: false,
          send_sms: false,
        };

        if (Array.isArray(config.enabledMethods) && config.enabledMethods.length > 0 && config.enabledMethods.length < 6) {
          const allowedMethods = config.enabledMethods
            .map((m: string) => {
              if (m === 'duitnow') return 'duitnow';
              if (m === 'tng') return 'touch_n_go';
              if (m === 'fpx' || m === 'card') return m;
              if (m === 'grabpay') return 'grabpay_direct';
              if (m === 'shopeepay') return 'shopee_pay';
              return null;
            })
            .filter(Boolean);
          if (allowedMethods.length > 0) {
            payload.payment_methods = allowedMethods;
          }
        }

        let directRes = await fetch(`${baseUrl}/payment-requests`, {
          method: 'POST',
          headers: {
            'X-BUSINESS-API-KEY': apiKey,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        });

        // Auto-retry without payment_methods if specific method is not yet active on the account
        if (!directRes.ok && payload.payment_methods) {
          const directErrClone = await directRes.clone().json().catch(() => ({}));
          const msg = (directErrClone?.message || '').toLowerCase();
          if (msg.includes('unavailable for your account') || msg.includes('payment method') || directRes.status === 422) {
            delete payload.payment_methods;
            directRes = await fetch(`${baseUrl}/payment-requests`, {
              method: 'POST',
              headers: {
                'X-BUSINESS-API-KEY': apiKey,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
              },
              body: JSON.stringify(payload),
            });
          }
        }

        if (directRes.ok) {
          const directData = await directRes.json();
          if (directData && directData.url) {
            return {
              id: directData.id || `hp_${Date.now()}`,
              url: directData.url,
              status: directData.status || 'pending',
              reference_number: directData.reference_number || String(order.orderId),
              amount: directData.amount || payload.amount,
              currency: directData.currency || 'MYR',
              created_at: directData.created_at || new Date().toISOString(),
              payment_methods: directData.payment_methods || payload.payment_methods,
              isSimulated: false,
            };
          }
        } else {
          const directErrData = await directRes.json().catch(() => ({}));
          if (directErrData?.message) {
            throw new Error(`HitPay: ${directErrData.message}`);
          }
        }
      } catch (directErr: any) {
        if (directErr.message?.includes('HitPay:')) {
          throw directErr;
        }
        console.warn('[HitPay Direct API Call Notice]', directErr);
      }
    }

    // Fail clearly instead of quietly falling back to simulation
    throw new Error(
      lastErrorMessage ||
      'Gagal menghasilkan pautan bayaran HitPay. Sila pastikan API Key dimasukkan dengan betul di Portal Pentadbir > Tetapan Kedai.'
    );
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

    const statusEndpoints = [
      `/api/hitpay.php?action=payment-status&id=${encodeURIComponent(paymentRequestId)}&apiKey=${encodeURIComponent(apiKey)}&isSandbox=${isSandbox}`,
      `/hitpay.php?action=payment-status&id=${encodeURIComponent(paymentRequestId)}&apiKey=${encodeURIComponent(apiKey)}&isSandbox=${isSandbox}`,
      `/api/hitpay/payment-status/${encodeURIComponent(paymentRequestId)}?apiKey=${encodeURIComponent(apiKey)}&isSandbox=${isSandbox}`,
    ];

    for (const ep of statusEndpoints) {
      try {
        const res = await fetch(ep);
        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          continue;
        }
        if (res.ok && data.success) {
          return { success: true, status: data.status, data };
        }
      } catch {
        // Try next endpoint
      }
    }
    return { success: false, status: 'pending' };
  }
}

export const hitpayService = new HitPayService();
