const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import track from '@/utils/track';
import Cookies from 'js-cookie';

export type PaymentMethod = 'cod' | 'online' | 'paypal' | string;

export const PaymentMethod_viet: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  online: 'Thanh toán trực tuyến',
  paypal: 'Thanh toán qua PayPal',
}

// ENUMS
export enum OrderStatus {
  PENDING = 'pending', //calendar-time.svg
  CONFIRMED = 'confirmed', //checkbox.svg
  SHIPPED = 'shipped', //truck-delivery.svg
  DELIVERED = 'delivered', //check_orange_500.svg
  CANCELLED = 'cancelled', //clipboard-x.svg
}

export const OrderStatusLabel = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipped: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
} as const;


// PAYLOAD
export interface OrderItemPayload {
  variant_id: string;
  quantity: number; // >= 1
  size: string;
}

export interface ShippingAddressSnapshot {
  full_name: string;
  phone: string;
  address: string;
}

export interface CreateOrderPayload {
  shipping_address_snapshot: ShippingAddressSnapshot;
  payment_method: PaymentMethod;
  items: OrderItemPayload[];
  promotion_code?: string | null;
  shipping_fee?: number;
  // paypal-specific id (optional unless payment_method === 'paypal')
  paypal_order_id?: string;
}

// ORDER ITEM
export interface OrderItemResponse {
  variant_id: string;
  id?: string;
  name_snapshot?: string;
  sku?: string;
  color_name?: string;
  size_snapshot?: string;
  qty: number;
  unit_price: number;     // giá đã áp dụng sale tại thời điểm đặt
  discount_amount?: number; // tổng tiền giảm giá trên sản phẩm này
  final_price: number;     // qty * unit_price
  image?: string;         // thường lấy từ product images[0]
  review_data?: {
    is_reviewed: boolean;
    review_id: string | null;
  };
}

// Order details
export interface OrderResponse {
  id: string;
  order_code: string;               // ví dụ: ORD20251117001
  user_id: string;
  order_status: OrderStatus;
  payment_method: string;
  shipping_address_snapshot: ShippingAddressSnapshot;
  items: OrderItemResponse[];
  promotion?: {
    code: string;
    discount: number;
  } | null;
  subtotal?: number;                 // tổng tiền hàng (không tính phí ship, discount)
  shipping_fee: number;
  discount_amount: number;                  // tổng tiền giảm giá
  total_amount: number;              // tiền hàng gốc + ship
  final_amount: number;              // tổng phải trả = total_amount - discount
  cancel_reason?: string | null;
  tracking_number?: string | null;
  created_at: string;                // ISO string
  updated_at: string;
  payment_status: string;
}

export interface OrderListItem {
  id: string;
  order_code: string;
  order_status: OrderStatus;
  total_amount: number;
  final_amount: number;
  items_count: number;               // số sản phẩm trong đơn
  created_at: string;
  promotion_code?: string | null;
  payment_method: string;
  payment_status: string;
  name?: string | null;
  full_name?: string | null;
  user_email?: string | null;
}

export interface GetOrdersResponse {
  message: string;
  orders: { total: number, orders: OrderListItem[] };
  total: number;
  page: number;
  limit: number;
}

// Query params
export interface GetOrdersQuery {
  page: number;
  limit: number;
  status?: string;
  from?: string;   // YYYY-MM-DD
  to?: string;     // YYYY-MM-DD
}

export interface CancelOrderResponse {
  message: string;
  order: OrderResponse;
}

// //////////////////////////////// Admin interfaces

export interface AdminGetOrdersQuery extends GetOrdersQuery {
  status?: OrderStatus;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface AdminOrderListResponse {
  orders: OrderListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  cancel_reason?: string | null;
}

export interface UpdateOrderStatusResponse {
  message: string;
  order: OrderResponse;
}

// router.post('/orders', requireUser, orderController.createOrder);
// router.get('/orders', requireUser, orderController.getOrders);
// router.get('/orders/:id', requireUser, orderController.getOrderById);
// router.post('/orders/:id/cancel', requireUser, orderController.cancelOrder);

const create = async (payload: CreateOrderPayload) => {
  const token = Cookies.get('accessToken');
  if (!API_URL) {
    console.error('[orderService.create] ERROR: NEXT_PUBLIC_API_URL is empty.');
    throw new Error('API base URL (NEXT_PUBLIC_API_URL) chưa được cấu hình.');
  }
  const url = `${API_URL}/user/orders`;
  console.log('[orderService.create] API_URL:', API_URL, 'fetch URL:', url, 'payload:', payload);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const locationHeader = res.headers.get('location') || res.headers.get('Location') || null;

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

    // console.log('[orderService.create] response status:', res.status, 'body:', data);
    // console.log('[orderService.create] location header:', locationHeader);

    if (!res.ok) {
      console.error('[orderService.create] failed', { url, status: res.status, body: data });
      throw new Error(data?.message || data?.error || `Tạo đơn hàng thất bại (status ${res.status})`);
    }

    // normalise response: try to extract order id / amount from common shapes
    const orderId =
      data?.order?.id ||
      data?.data?.order?.id ||
      data?.data?.id ||
      data?.id ||
      data?.orderId ||
      data?.order_id ||
      null;

    // fallback: try parse id from location header like "/user/orders/<id>"
    const locationId = locationHeader ? locationHeader.split('/').filter(Boolean).pop() : null;
    const finalOrderId = orderId || locationId || null;
    const amount =
      data?.order?.final_amount ??
      data?.data?.order?.final_amount ??
      data?.final_amount ??
      data?.total_amount ??
      data?.data?.total_amount ??
      null;
    track('create_order', { orderId: finalOrderId, amount, paymentMethod: payload.payment_method });
    return { raw: data, orderId: finalOrderId, amount, message: data?.message || null };
  } catch (err: any) {
    console.error('[orderService.create] error', err);
    throw err;
  }
}

// user order service
export const orderService = {
  create,
  createOrder: create,

  // from=2025-10-14?to=2025-12-14?page=1?limit=10
  async getUserOrders(filters: GetOrdersQuery) {
    const token = Cookies.get('accessToken');
    const params = new URLSearchParams();
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.status) params.append('status', filters.status);
    const url = `${API_URL}/user/orders?${params.toString()}`;
    console.log(url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Lỗi khi lấy danh sách đơn hàng');
    }
    const data: GetOrdersResponse = await response.json();
    console.log("response data: ", data);
    return { data, message: "Lấy danh sách đơn hàng thành công!" };
  },
  async getUserOrder(orderID: string) {
    const token = Cookies.get('accessToken');
    const response = await fetch(`${API_URL}/user/orders/${encodeURI(orderID)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      throw new Error('Lỗi khi mở xem đơn hàng');
    }
    const data = await response.json();
    console.log("response orders: ", data);
    const order: OrderResponse = data.order;
    return { order, message: "Mở đơn hàng thành công!" };
  },
  async cancelUserOrder(orderID: string, reason?: string) {
    const token = Cookies.get('accessToken');
    const body = JSON.stringify({ reason: reason || '' });
    const response = await fetch(`${API_URL}/user/orders/${encodeURI(orderID)}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body
    })

    if (!response.ok) {
      throw new Error('Lỗi khi hủy đơn hàng');
    }
    const data: CancelOrderResponse = await response.json();
    return { data, message: "Hủy đơn hàng thành công!" };
  },
}

function convertToISODate(dateStr: string): string {
  const [d, m, y] = dateStr.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

// const { page = 1, limit = 10, status, from, to} = req.query;
export const adminOrderService = {
  async getAllOrders(query: AdminGetOrdersQuery = { page: 1, limit: 10 }): Promise<AdminOrderListResponse> {
    const token = Cookies.get('accessToken');
    if (!API_URL) throw new Error('API base URL chưa được cấu hình');

    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.status) params.append('status', query.status);
    if (query.from) params.append('from', convertToISODate(query.from));
    if (query.to) params.append('to', convertToISODate(query.to));

    const url = `${API_URL}/admin/orders${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Lấy danh sách đơn hàng thất bại: ${response.status} ${error}`);
    }

    const data = await response.json();

    // Backend trả về dạng: { orders: { orders: [...], total: n }, total: n, page, limit }
    const result: AdminOrderListResponse = {
      orders: data.orders?.orders || data.orders || [],
      total: data.total || data.orders?.total || 0,
      page: Number(data.page) || 1,
      limit: Number(data.limit) || 20,
    };
    return result;
  },

  async getOrderById(orderId: string): Promise<OrderResponse> {
    const token = Cookies.get('accessToken');

    const response = await fetch(`${API_URL}/admin/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Không tìm thấy đơn hàng: ${response.status} ${error}`);
    }

    const data = await response.json();
    console.log("order response: ", data);
    return data.order as OrderResponse;
  },

  async updateOrderStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload
  ): Promise<UpdateOrderStatusResponse> {
    const token = Cookies.get('accessToken');
    if (!API_URL) throw new Error('API base URL chưa được cấu hình');

    const response = await fetch(`${API_URL}/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Cập nhật trạng thái thất bại (${response.status})`);
    }

    const data = await response.json();
    return {
      message: data.message || 'Cập nhật trạng thái thành công',
      order: data.order as OrderResponse,
    };
  },
};

export default orderService;