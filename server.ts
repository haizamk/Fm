import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'Khairul FRESH Food API',
      timestamp: new Date().toISOString() 
    });
  });

  // Test HitPay API Connection
  app.post('/api/hitpay/test-connection', async (req, res) => {
    try {
      const { apiKey, isSandbox } = req.body;

      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Sila masukkan HitPay API Key (X-BUSINESS-API-KEY) terlebih dahulu.',
        });
      }

      const cleanKey = apiKey.trim();
      const baseUrl = isSandbox 
        ? 'https://api.sandbox.hitpayapp.com/v1' 
        : 'https://api.hitpayapp.com/v1';

      // Test by querying payment-methods endpoint from HitPay
      const response = await fetch(`${baseUrl}/payment-methods`, {
        method: 'GET',
        headers: {
          'X-BUSINESS-API-KEY': cleanKey,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return res.json({
          success: true,
          message: `Sambungan API HitPay Berjaya! (${isSandbox ? 'Mod Sandbox / Ujian' : 'Mod Pengeluaran / Live'})`,
          data,
          environment: isSandbox ? 'sandbox' : 'production',
        });
      } else {
        const errText = await response.text().catch(() => '');
        let parsedErr: any = null;
        try {
          parsedErr = JSON.parse(errText);
        } catch {
          // keep text
        }

        const errorDetail = parsedErr?.message || parsedErr?.error || errText || `HTTP Status ${response.status}`;
        return res.status(response.status).json({
          success: false,
          message: `Ralat Pengesahan HitPay (${response.status}): ${errorDetail}`,
          detail: parsedErr || errText,
        });
      }
    } catch (err: any) {
      console.error('[HitPay Test Error]', err);
      return res.status(500).json({
        success: false,
        message: `Ralat sambungan pelayan: ${err.message || 'Gagal menghubungi pelayan HitPay.'}`,
      });
    }
  });

  // Create HitPay Payment Request
  app.post('/api/hitpay/create-payment', async (req, res) => {
    try {
      const { order, config } = req.body;

      if (!order || !order.orderId || !order.total) {
        return res.status(400).json({
          success: false,
          message: 'Data pesanan tidak lengkap.',
        });
      }

      const isSandbox = !!config?.isSandbox;
      const apiKey = (config?.apiKey || process.env.HITPAY_API_KEY || '').trim();

      // If no API Key is provided, inform caller that it is in Demo Mode
      if (!apiKey || apiKey.length < 5) {
        return res.json({
          success: true,
          isSimulated: true,
          message: 'Mod Demo/Simulasi: Tiada API Key HitPay dikonfigurasi. Sila masukkan API Key di Portal Admin untuk transaksi live sebenar.',
          id: `hp_demo_${Date.now()}`,
          url: `https://secure.hitpayapp.com/pay/${isSandbox ? 'test_' : ''}${order.orderId}`,
          status: 'pending',
          reference_number: order.orderId,
          amount: Number(order.total).toFixed(2),
          currency: 'MYR',
        });
      }

      const baseUrl = isSandbox 
        ? 'https://api.sandbox.hitpayapp.com/v1' 
        : 'https://api.hitpayapp.com/v1';

      // Map payment methods for HitPay API
      const inputMethods: string[] = Array.isArray(config?.enabledMethods) ? config.enabledMethods : [];
      const hitpayMethods: string[] = [];
      
      inputMethods.forEach((m: string) => {
        if (m === 'duitnow') hitpayMethods.push('duitnow_qr');
        else if (m === 'tng') hitpayMethods.push('touchngo');
        else if (m === 'fpx' || m === 'card' || m === 'grabpay' || m === 'shopeepay') hitpayMethods.push(m);
      });

      if (hitpayMethods.length === 0) {
        hitpayMethods.push('fpx', 'duitnow_qr', 'touchngo', 'card', 'grabpay');
      }

      const hostOrigin = req.headers.origin || req.headers.referer || 'https://ais-dev-ibciauzkghto525j7ma3h5-707200717362.asia-east1.run.app';
      const cleanOrigin = String(hostOrigin).replace(/\/$/, '');

      const redirectUrl = config?.redirectUrl || `${cleanOrigin}/?hitpay_status=completed&order_id=${encodeURIComponent(order.orderId)}`;
      const webhookUrl = config?.webhookUrl || `${cleanOrigin}/api/hitpay/webhook`;

      // HitPay accepts application/x-www-form-urlencoded or application/json
      const payload: Record<string, any> = {
        amount: Number(order.total).toFixed(2),
        currency: 'MYR',
        email: order.customer?.email || `${order.customer?.phone?.replace(/\D/g, '') || 'cust'}@freshayam.com.my`,
        name: order.customer?.fullName || 'Pelanggan Khairul Fresh Food',
        phone: order.customer?.phone || '',
        purpose: `Tempahan Ayam Segar Pasar Semenyih #${order.orderId}`,
        reference_number: String(order.orderId),
        redirect_url: redirectUrl,
        webhook: webhookUrl,
        send_email: false,
        send_sms: false,
        payment_methods: hitpayMethods,
      };

      const hitpayResponse = await fetch(`${baseUrl}/payment-requests`, {
        method: 'POST',
        headers: {
          'X-BUSINESS-API-KEY': apiKey,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      if (hitpayResponse.ok) {
        const data = await hitpayResponse.json();
        return res.json({
          success: true,
          isSimulated: false,
          id: data.id || `hp_${Date.now()}`,
          url: data.url,
          status: data.status || 'pending',
          reference_number: data.reference_number || order.orderId,
          amount: data.amount || payload.amount,
          currency: data.currency || 'MYR',
          payment_methods: data.payment_methods || hitpayMethods,
          created_at: data.created_at || new Date().toISOString(),
        });
      } else {
        const errText = await hitpayResponse.text().catch(() => '');
        let parsedErr: any = null;
        try {
          parsedErr = JSON.parse(errText);
        } catch {
          // ignore
        }

        const errorMessage = parsedErr?.message || parsedErr?.error || errText || `Ralat HitPay (${hitpayResponse.status})`;
        console.warn('[HitPay API create-payment error response]', hitpayResponse.status, errText);

        return res.status(hitpayResponse.status).json({
          success: false,
          message: `Gagal mencipta pautan bayaran HitPay: ${errorMessage}`,
          errorDetail: parsedErr || errText,
        });
      }
    } catch (err: any) {
      console.error('[HitPay Create Payment Error]', err);
      return res.status(500).json({
        success: false,
        message: `Ralat pelayan: ${err.message || 'Gagal memproses pautan bayaran HitPay.'}`,
      });
    }
  });

  // Check HitPay Payment Status by ID
  app.get('/api/hitpay/payment-status/:id', async (req, res) => {
    try {
      const paymentRequestId = req.params.id;
      const apiKey = (req.query.apiKey as string || process.env.HITPAY_API_KEY || '').trim();
      const isSandbox = req.query.isSandbox === 'true';

      if (!apiKey) {
        return res.status(400).json({
          success: false,
          message: 'API Key diperlukan untuk menyemak status bayaran.',
        });
      }

      const baseUrl = isSandbox 
        ? 'https://api.sandbox.hitpayapp.com/v1' 
        : 'https://api.hitpayapp.com/v1';

      const response = await fetch(`${baseUrl}/payment-requests/${encodeURIComponent(paymentRequestId)}`, {
        method: 'GET',
        headers: {
          'X-BUSINESS-API-KEY': apiKey,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return res.json({
          success: true,
          data,
          status: data.status, // 'completed', 'pending', 'failed', 'refunded'
          reference_number: data.reference_number,
          amount: data.amount,
        });
      } else {
        const errText = await response.text().catch(() => '');
        return res.status(response.status).json({
          success: false,
          message: `Ralat menyemak status (${response.status}): ${errText}`,
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: `Ralat pelayan: ${err.message}`,
      });
    }
  });

  // Webhook listener for HitPay
  app.post('/api/hitpay/webhook', (req, res) => {
    console.log('[HitPay Webhook Received]', req.body);
    // Return 200 OK immediately to acknowledge HitPay
    return res.status(200).send('Webhook Received');
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
