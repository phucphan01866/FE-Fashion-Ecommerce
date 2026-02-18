import Cookies from 'js-cookie';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const paymentService = {
  // async createPaypalOrder(params: { orderId: string; amount: number; currency?: string; returnUrl: string; cancelUrl: string }) {
  //   const token = Cookies.get('accessToken');
  //   const candidates = [
  //     `${API_URL}/user/paypal/create`,
  //     `${API_URL}/payment/paypal/create`,
  //     `${API_URL}/payments/paypal/create`,
  //     `${API_URL}/paypal/create`
  //   ];

  //   let lastErr: any = null;
  //   for (const url of candidates) {
  //     try {
  //       console.log('[paymentService.createPaypalOrder] POST', url, params);
  //       const res = await fetch(url, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(params),
  //       });
  //       const text = await res.text();
  //       let data: any;
  //       try { data = JSON.parse(text); } catch { data = { raw: text }; }
  //       console.log('[paymentService.createPaypalOrder] resp', { url, status: res.status, body: data });
  //       if (res.ok) return data;
  //       // if 404 try next candidate, otherwise throw
  //       if (res.status !== 404) {
  //         throw new Error(data?.error || data?.message || `createPaypalOrder failed (status ${res.status})`);
  //       }
  //       lastErr = { url, status: res.status, body: data };
  //     } catch (err) {
  //       console.warn('[paymentService.createPaypalOrder] attempt failed', err);
  //       lastErr = err;
  //     }
  //   }
  //   console.error('[paymentService.createPaypalOrder] all attempts failed', lastErr);
  //   throw new Error(`createPaypalOrder failed for all candidate URLs. Last error: ${JSON.stringify(lastErr)}`);
  // },

  async createPaypalOrder(params: { orderId: string; amount: number; currency?: string; returnUrl: string; cancelUrl: string }) {
    const token = Cookies.get('accessToken');

    let lastErr: any = null;
    const url = `${API_URL}/payment/paypal/create`;
    // console.log('[paymentService.createPaypalOrder] POST', url, params);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    console.log('[paymentService.createPaypalOrder] resp', { url, status: res.status, body: data });
    if (res.ok) return data;
    if (res.status !== 404) {
      throw new Error(data?.error || data?.message || `createPaypalOrder failed (status ${res.status})`);
    }
  },


  async capturePaypalOrder(params: { orderId: string; paypalOrderId: string }) {
    // alert('capturePaypalOrder called');
    const token = Cookies.get('accessToken');
    const candidates = [
      `${API_URL}/user/paypal/capture`,
      `${API_URL}/payment/paypal/capture`,
      `${API_URL}/payments/paypal/capture`,
      `${API_URL}/paypal/capture`
    ];
    let lastErr: any = null;
    for (const url of candidates) {
      try {
        console.log('[paymentService.capturePaypalOrder] POST', url, params);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(params),
        });
        const text = await res.text();
        let data: any;
        try { data = JSON.parse(text); } catch { data = { raw: text }; }
        console.log('[paymentService.capturePaypalOrder] resp', { url, status: res.status, body: data });
        if (res.ok) return data;
        if (res.status !== 404) {
          throw new Error(data?.error || data?.message || `capturePaypalOrder failed (status ${res.status})`);
        }
        lastErr = { url, status: res.status, body: data };
      } catch (err) {
        console.warn('[paymentService.capturePaypalOrder] attempt failed', err);
        lastErr = err;
      }
    }
    console.error('[paymentService.capturePaypalOrder] all attempts failed', lastErr);
    throw new Error(`capturePaypalOrder failed for all candidate URLs. Last error: ${JSON.stringify(lastErr)}`);
  }
}

export default paymentService;