'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import paymentService from '@/service/payment.service';
import { useNotificateArea } from '@/context/NotificateAreaContext';

export default function PaypalSuccessPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Hãy thanh toán Paypal để được duyệt đơn hàng nhé...');
  const { setNotification } = useNotificateArea();

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const orderId = qs.get('orderId'); // passed this in returnUrl when initialising PayPal
    const paypalOrderId = qs.get('token'); // PayPal "token" is the PayPal order id

    if (!orderId) {
      setMessage('Không có orderId. Vui lòng quay lại trang đơn hàng.');
      return;
    }
    if (!paypalOrderId) {
      setMessage('Không nhận được token từ PayPal. Vui lòng thử lại.');
      return;
    }
    setTimeout(() => {
      router.push(`/customer/order/${orderId}`);
    }, 3000)
  }, []);

  return <div style={{ padding: 24 }}>{message}</div>;
}