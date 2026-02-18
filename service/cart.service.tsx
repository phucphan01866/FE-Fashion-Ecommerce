const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import Cookies from 'js-cookie';
import track from '@/utils/track';

export interface TypeCartItem {
    id: string;
    variant_id: string;
    sku: string;
    product_id: string;
    product_name: string;
    qty: number;
    unit_price: number;         // (snapshot)
    line_total: number;
    size: string;
    sale_percent: number;
    sale_price: number;
    is_flash_sale: boolean;
    image_url?: string;
    color_name: string;
    status: string;
    stock_qty: number;
}

export interface TypeCart {
    id: string | null;
    totalItems: TypeCartItem[];
    items: TypeCartItem[];
    removedItems: TypeCartItem[];
    totalQty: number;
    subtotal: number;
}

// router.get('/cart', requireUser, cartController.getCart);
// router.post('/cart/items', requireUser, cartController.addItem);
// router.patch('/cart/items/:id', requireUser, cartController.updateItem);
// router.delete('/cart/items/:id', requireUser, cartController.removeItem);
// router.delete('/cart/clear', requireUser, cartController.clearCart);

export const CartService = {
    async getCart() {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        if (!response.ok) {
            throw new Error('Lỗi khi lấy dữ liệu giỏ hàng');
        }
        const data: TypeCart = await response.json();
        console.log("Cart data:", data);
        return {
            message: "Lấy sản phẩm về thành công!",
            cart: data
        };
    },
    async addToCart(variantId: string, size: string, quantity: number = 1) {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify({
            variant_id: variantId,
            qty: quantity,
            size
        });
        console.log("Add to cart body:", body);
        track('add_to_cart', { variantId: variantId, size, quantity });
        const response = await fetch(`${API_URL}/user/cart/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body
        })
        if (!response.ok) {
            throw new Error('Lỗi khi thêm sản phẩm vào giỏ hàng');
        }
        const data = await response.json();
        console.log("data, ", data);
        return { cart: data, message: "Thêm sản phẩm thành công!" };
    },
    async updateQTY(cartItemID: string, newQuantity: number) {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify({
            qty: newQuantity,
        });
        const response = await fetch(`${API_URL}/user/cart/items/${encodeURIComponent(cartItemID)}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }, body
        })
        if (!response.ok) {
            throw new Error('Lỗi khi cập nhật giỏ hàng');
        }
        const data = await response.json();
        return { cart: data, message: "Cập nhật sản phẩm thành công!" };
    },
    async removeItem(cartItemID: string) {
        const token = Cookies.get('accessToken');

        const response = await fetch(`${API_URL}/user/cart/items/${encodeURIComponent(cartItemID)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        if (!response.ok) {
            throw new Error('Lỗi khi xóa sản phẩm');
        }
        track('remove_from_cart', { cartItemID });
        const data: TypeCart = await response.json();
        return { cart: data, message: "Xóa sản phẩm thành công!" };
    },
    async clearItem() {
        const token = Cookies.get('accessToken');

        const response = await fetch(`${API_URL}/user/cart/ `, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        if (!response.ok) {
            throw new Error('Lỗi khi xóa giỏ hàng');
        }
        const data = await response.json();
        return { cart: data, message: "Xóa giỏ hàng thành công!" };
    },
    async checkCartItems(ids: string[]) {
        const token = Cookies.get('accessToken');
        // /cart/stock/check
        const body = JSON.stringify({ variantIds: ids });
        const response = await fetch(`${API_URL}/user/cart/stock/check`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body
        })
        if (!response.ok) {
            throw new Error('Lỗi khi kiểm tra tồn kho giỏ hàng');
        }
        const data = await response.json();
        console.log(data);
        return data;
    },
    async batchRemoveItems(ids: string[]) {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify({ variantIds: ids });
        console.log(ids);
        // '/cart/remove-invalid
        const response = await fetch(`${API_URL}/user/cart/remove-invalid`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body
        })
        if (!response.ok) {
            throw new Error('Lỗi khi xóa nhiều sản phẩm');
        }
        const data = await response.json();
        console.log(data);
        return { cart: data.data.cart, message: "Xóa sản phẩm thành công!" };
    }
}

export default CartService;