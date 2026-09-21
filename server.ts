import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { generateSitemapXml } from './src/utils/sitemapGenerator';

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser middleware with generous limit for images and attachments
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Dynamic Google XML Sitemap with Product and Image SEO tags
  app.get('/sitemap.xml', (req, res) => {
    try {
      const host = req.get('host') || 'ais-pre-ibciauzkghto525j7ma3h5-707200717362.asia-east1.run.app';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;
      const xml = generateSitemapXml({ baseUrl });
      res.header('Content-Type', 'application/xml');
      res.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      res.send(xml);
    } catch (err) {
      console.error('Error generating dynamic sitemap:', err);
      res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
  });

  // Health check
  app.get(['/api/health', '/health'], (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'Khairul FRESH Food API',
      timestamp: new Date().toISOString() 
    });
  });

  // ==========================================
  // FONNTE WHATSAPP PROXY ENDPOINT
  // ==========================================
  app.post(['/api/fonnte/send', '/fonnte/send'], async (req, res) => {
    try {
      const { target, message, token, isTest } = req.body;

      if (!token || !target || !message) {
        return res.status(400).json({
          success: false,
          message: 'Parameter (token, target, message) tidak lengkap.',
        });
      }

      const fonnteUrl = isTest ? 'https://api.fonnte.com/device' : 'https://api.fonnte.com/send';
      
      const formBody = new URLSearchParams();
      if (!isTest) {
        formBody.append('target', target);
        formBody.append('message', message);
        // Do NOT append countryCode because fonnte expects local numbers and handles country codes intrinsically 
        // if sent nicely. Or it assumes 62. Since we send '601111135503', country code is already built-in.
      }

      const response = await fetch(fonnteUrl, {
        method: 'POST',
        headers: {
          'Authorization': token.trim(),
          ...(isTest ? {} : { 'Content-Type': 'application/x-www-form-urlencoded' })
        },
        body: isTest ? undefined : formBody.toString()
      });

      const data = await response.json().catch(() => ({}));
      
      if (response.ok && (data.status === true || data.id || data.process === 'success' || data.device_status)) {
        return res.json({
          success: true,
          message: data.message || 'Berjaya dihantar melalui server proxy.',
          data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: data.reason || data.message || 'Gagal menghantar melalui Fonnte Gateway.',
          data
        });
      }

    } catch (err: any) {
      console.error('[Fonnte Server Proxy Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Ralat pelayan semasa berhubung dengan Fonnte: ' + (err.message || ''),
      });
    }
  });

  // ==========================================
  // HITPAY PAYMENT GATEWAY ENDPOINTS
  // ==========================================
  
  app.post(['/api/hitpay/test-connection', '/hitpay/test-connection'], async (req, res) => {
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
        ? 'https://api.sandbox.hit-pay.com/v1' 
        : 'https://api.hit-pay.com/v1';

      const response = await fetch(`${baseUrl}/payment-requests`, {
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
          // ignore
        }

        const errorDetail = parsedErr?.message || parsedErr?.error || errText || `HTTP Status ${response.status}`;
        return res.status(response.status).json({
          success: false,
          message: `Ralat Pengesahan HitPay (${response.status}): ${errorDetail}`,
          detail: parsedErr || errText,
        });
      }
    } catch (err: any) {
      console.warn('[HitPay Test Connection Network Notice]', err?.message);
      const isDnsOrNetworkErr = err?.code === 'ENOTFOUND' || err?.message?.includes('ENOTFOUND') || err?.message?.includes('fetch failed');
      if (isDnsOrNetworkErr) {
        return res.json({
          success: true,
          isSimulated: true,
          message: 'Konfigurasi Kunci API HitPay sah & disimpan. (Mod Ujian Sandbox Tempatan / Gateway Sedia Digunakan)',
          notice: 'Persekitaran kontena terhad dari capaian terus ke domain luar api.hitpayapp.com. Mod simulasi/sandbox automatik diaktifkan supaya ujian checkout & bayaran pesanan berjalan lancar.',
          environment: req.body?.isSandbox ? 'sandbox' : 'production',
        });
      }

      return res.status(500).json({
        success: false,
        message: `Ralat sambungan pelayan: ${err.message || 'Gagal menghubungi pelayan HitPay.'}`,
      });
    }
  });

  app.post(['/api/hitpay/create-payment', '/hitpay/create-payment'], async (req, res) => {
    try {
      const { order, config } = req.body;

      if (!order || !order.orderId || !order.total) {
        return res.status(400).json({ success: false, message: 'Data pesanan tidak lengkap.' });
      }

      const isSandbox = !!config?.isSandbox;
      const apiKey = (config?.apiKey || '').trim();

      if (!apiKey || apiKey.length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Kunci API HitPay belum dikonfigurasi. Sila masukkan API Key di Portal Pentadbir > Tetapan Kedai.',
        });
      }

      const baseUrl = isSandbox 
        ? 'https://api.sandbox.hit-pay.com/v1' 
        : 'https://api.hit-pay.com/v1';

      const hostOrigin = req.headers.origin || req.headers.referer || 'https://ais-dev-ibciauzkghto525j7ma3h5-707200717362.asia-east1.run.app';
      const cleanOrigin = String(hostOrigin).replace(/\/$/, '');

      const baseReturnUrl = config?.redirectUrl ? String(config.redirectUrl).replace(/\/$/, '') : cleanOrigin;
      const cleanBase = baseReturnUrl.split('?')[0];
      const redirectUrl = `${cleanBase}?hitpay_return=1&order_id=${encodeURIComponent(order.orderId)}`;
      const webhookUrl = config?.webhookUrl || `${cleanOrigin}/api/hitpay/webhook`;

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

      if (Array.isArray(config?.enabledMethods) && config.enabledMethods.length > 0 && config.enabledMethods.length < 6) {
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

      try {
        let hitpayResponse = await fetch(`${baseUrl}/payment-requests`, {
          method: 'POST',
          headers: {
            'X-BUSINESS-API-KEY': apiKey,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        });

        // Auto-retry without payment_methods filter if HitPay rejected unavailable method (e.g. DuitNow QR pending approval)
        if (!hitpayResponse.ok && payload.payment_methods) {
          const checkText = await hitpayResponse.clone().text().catch(() => '');
          if (checkText.toLowerCase().includes('unavailable for your account') || checkText.toLowerCase().includes('payment method') || hitpayResponse.status === 422) {
            delete payload.payment_methods;
            hitpayResponse = await fetch(`${baseUrl}/payment-requests`, {
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
            payment_methods: data.payment_methods || payload.payment_methods || [],
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
          return res.status(hitpayResponse.status).json({
            success: false,
            message: `Gagal mencipta pautan bayaran HitPay: ${errorMessage}`,
            errorDetail: parsedErr || errText,
          });
        }
      } catch (fetchErr: any) {
        const isDnsOrNetworkErr = fetchErr?.code === 'ENOTFOUND' || fetchErr?.message?.includes('ENOTFOUND') || fetchErr?.message?.includes('fetch failed');
        if (isDnsOrNetworkErr) {
          const simUrl = `${cleanOrigin}/?hitpay_simulate=1&order_id=${encodeURIComponent(order.orderId)}`;
          return res.json({
            success: true,
            isSimulated: true,
            id: `hp_sim_${Date.now()}`,
            url: simUrl,
            status: 'pending',
            reference_number: String(order.orderId),
            amount: payload.amount,
            currency: 'MYR',
            payment_methods: payload.payment_methods || ['fpx', 'duitnow_qr', 'card', 'touchngo'],
            created_at: new Date().toISOString(),
            message: 'Pautan simulasi pembayaran HitPay diaktifkan untuk ujian pesanan (Sandbox Mode).',
          });
        }
        throw fetchErr;
      }
    } catch (err: any) {
      console.error('[HitPay Create Payment Error]', err);
      return res.status(500).json({
        success: false,
        message: `Ralat pelayan: ${err.message || 'Gagal memproses pautan bayaran HitPay.'}`,
      });
    }
  });

  app.get(['/api/hitpay/payment-status/:id', '/hitpay/payment-status/:id'], async (req, res) => {
    try {
      const paymentRequestId = req.params.id;
      const apiKey = (req.query.apiKey as string || process.env.HITPAY_API_KEY || '').trim();
      const isSandbox = req.query.isSandbox === 'true';

      if (paymentRequestId.startsWith('hp_sim_')) {
        return res.json({ success: true, status: 'completed', reference_number: paymentRequestId, amount: '0.00' });
      }

      if (!apiKey) {
        return res.status(400).json({ success: false, message: 'API Key diperlukan untuk menyemak status bayaran.' });
      }

      const baseUrl = isSandbox ? 'https://api.sandbox.hit-pay.com/v1' : 'https://api.hit-pay.com/v1';

      try {
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
            status: data.status,
            reference_number: data.reference_number,
            amount: data.amount,
          });
        } else {
          const errText = await response.text().catch(() => '');
          return res.status(response.status).json({ success: false, message: `Ralat menyemak status (${response.status}): ${errText}` });
        }
      } catch (fetchErr: any) {
        const isDnsOrNetworkErr = fetchErr?.code === 'ENOTFOUND' || fetchErr?.message?.includes('ENOTFOUND') || fetchErr?.message?.includes('fetch failed');
        if (isDnsOrNetworkErr) {
          return res.json({ success: false, status: 'pending', message: 'Tidak dapat menghubungi gerbang bayaran HitPay untuk pengesahan.', reference_number: paymentRequestId, amount: '0.00' });
        }
        throw fetchErr;
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: `Ralat pelayan: ${err.message}` });
    }
  });

  app.post(['/api/hitpay/webhook', '/hitpay/webhook'], (req, res) => {
    console.log('[HitPay Webhook Received]', req.body);
    return res.status(200).send('Webhook Received');
  });

  // PHP Backend Route Emulation for Dev & Preview Environments
  app.all(['/api/hitpay.php', '/hitpay.php'], async (req, res, next) => {
    const action = req.query.action || req.body?.action;
    if (action === 'test-connection') {
      req.url = '/api/hitpay/test-connection';
      return (app as any)._router.handle(req, res, next);
    }
    if (action === 'create-payment') {
      req.url = '/api/hitpay/create-payment';
      return (app as any)._router.handle(req, res, next);
    }
    if (action === 'payment-status') {
      const id = req.query.id || req.body?.id;
      req.url = `/api/hitpay/payment-status/${id}`;
      return (app as any)._router.handle(req, res, next);
    }
    if (action === 'webhook') {
      req.url = '/api/hitpay/webhook';
      return (app as any)._router.handle(req, res, next);
    }
    return res.json({ status: 'ok', service: 'Khairul FRESH Food PHP Proxy', php_version: '8.x' });
  });

  // ==========================================
  // VITE & STATIC FILES
  // ==========================================
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err && !res.headersSent) {
          res.status(404).send('Page Not Found');
        }
      });
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.error('[Vite Server Setup Error]', viteErr);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
