'use client'

import { createContext, useContext, useState, useEffect, use } from "react";
import { TypeCart, TypeCartItem, CartService } from "@/service/cart.service";
import { useAuth } from "./AuthContext";
import { useNotificateArea } from "./NotificateAreaContext";
import { TypeAddress, addressService, emptyAdress } from "@/service/address.service";
import OrderService from "@/service/order.service";
import { CreateOrderPayload, OrderItemPayload, ShippingAddressSnapshot } from "@/service/order.service";
import { useRouter } from "next/navigation";
import { userPromotionService, Promotion, emptyPromotion, PreviewPromotionPayload, emptyPreviewPromotion, PreviewPromotionSuccessResponse, PreviewLineItem, DiscountBreakdownItem } from "@/service/promotion.service";
import paymentService from "@/service/payment.service";
import orderService from "@/service/order.service";

interface CartPageContextType {
    addItem: (variantId: string, size: string, quantity?: number) => Promise<void>;
    cart: TypeCart | null;
    updateQuantity: (cartItemID: string, newQuantity: number) => Promise<number>;
    clearCart: () => Promise<void>;
    removeItem: (deleteId: string) => void;
    // addressList: TypeAddress[];
    // fetchUserAddresses: () => Promise<void>;
    // selectedAddress: TypeAddress;
    // setSelectedAddress: (newAddress: TypeAddress) => void;
    currentPaymentMethod: string;
    setCurrentPaymentMethod: (method: string) => void;
    createOrder: (selectedAddress: TypeAddress) => void;
    selectedPromotionCode: Promotion | null,
    setSelectedPromotionCode: (promotion: Promotion) => void;
    setPreviewItemList: (promotion: Promotion) => Promise<void>;
    previewPromotion: PreviewPromotionSuccessResponse;
    setPreviewPromotion: (preview: PreviewPromotionSuccessResponse) => void;
    paymentMethodList: { name: string, label: string, imgSrc: string }[];
    isCreateOrder: boolean; setIsCreateOrder: (value: boolean) => void;
    loadingAddress: boolean; setLoadingAddress: (value: boolean) => void;
    checkStock: (items: TypeCartItem[], cartItemID: string, newQuantity: number) => void;
    batchRemove: () => Promise<void>;
}

export const paymentMethodList = [
    { name: "paypal", label: 'Paypal', imgSrc: "/logo/paypal.png" },
    { name: "cod", label: 'Tiền mặt', imgSrc: "/icon/cash.svg" },
]

const CartContext = createContext<CartPageContextType | undefined>(undefined);

const emptyCart: TypeCart = {
    id: null,
    totalItems: [],
    items: [],
    removedItems: [],
    totalQty: 0,
    subtotal: 0,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { setNotification } = useNotificateArea();
    const { user } = useAuth();
    const router = useRouter();

    const [cart, setCart] = useState<TypeCart | null>(null);
    // address
    // const [addressList, setAddressList] = useState<TypeAddress[]>([]);
    // const [selectedAddress, setSelectedAddress] = useState<TypeAddress>(emptyAdress);
    const [selectedPromotionCode, setSelectedPromotionCode] = useState<Promotion | null>(emptyPromotion);
    const [previewPromotion, setPreviewPromotion] = useState<PreviewPromotionSuccessResponse>(emptyPreviewPromotion);
    const [isCreateOrder, setIsCreateOrder] = useState(false);
    const [loadingAddress, setLoadingAddress] = useState(false);

    // Cart & list items
    function processCart(cartData: TypeCart): TypeCart {
        const data: TypeCart = {
            ...cartData,
            totalItems: cartData.items,
            items: cartData.items.filter(item => (item.status !== 'inactive' && item.stock_qty > 0)),
            removedItems: cartData.items.filter(item => (item.status === 'inactive' || item.stock_qty === 0)),
        }
        return data;
    }

    async function getCart() {
        try {
            const cartData = await CartService.getCart();
            return processCart(cartData.cart);
            // console.log("Current cart data:", cartData.cart);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi tải dữ liệu giỏ hàng.');
        }
    }

    async function fetchCart() {
        try {
            const cartData = await CartService.getCart();
            setCart(processCart(cartData.cart));
            return processCart(cartData.cart);
            // console.log("Current cart data:", cartData.cart);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi lấy dữ liệu giỏ hàng.');
        }
    }
    async function addItem(variantId: string, size: string, quantity: number = 1) {
        try {
            const result = await CartService.addToCart(variantId, size, quantity);
            setCart(processCart(result.cart));
            // console.log(result.cart);
            setNotification(result.message);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
        }
    }
    // cartItemID: string, newQuantity: number
    async function updateQuantity(cartItemID: string, newQuantity: number) {
        try {
            if (newQuantity === cart?.items.find(item => item.id === cartItemID)?.qty) {
                throw new Error("");
            }
            const newCart = await fetchCart();
            checkStock(newCart?.items || [], cartItemID, newQuantity);
            const result = await CartService.updateQTY(cartItemID, newQuantity);
            setCart(processCart(result.cart));
            setNotification(result.message);
            return (newQuantity);
        } catch (error) {
            if (error instanceof Error && error.message !== "") {
                setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi cập nhật số lượng sản phẩm.');
            }
            return (-1);
        }
    }

    interface stockCheckItem {
        variant_id: string;
        stock_qty: number;
        qty: number;
    }

    function checkStock(items: TypeCartItem[], cartItemID?: string, newQuantity?: number) {
        let checkItems: Map<string, stockCheckItem> = new Map();
        console.log("checking");
        items.forEach(item => {
            // Đã tồn tại variant_id -> cộng dồn
            if (checkItems.has(item.variant_id)) {
                checkItems.set(item.variant_id, {
                    variant_id: item.variant_id,
                    stock_qty: item.stock_qty,
                    qty: checkItems.get(item.variant_id)!.qty + ((cartItemID && newQuantity !== undefined && item.id === cartItemID) ? newQuantity : item.qty),
                });
            } else {
                // Chưa tồn tại variant_id -> thêm mới
                checkItems.set(item.variant_id, {
                    variant_id: item.variant_id,
                    stock_qty: item.stock_qty,
                    qty: (cartItemID && item.id === cartItemID && newQuantity !== undefined) ? newQuantity : item.qty,
                });
            }
        })
        const overStockItem = cart?.items.find(item => item.variant_id === Array.from(checkItems.values()).find(item => item.qty > item.stock_qty)?.variant_id);
        if (overStockItem !== undefined) {
            throw new Error(`Sản phẩm ${overStockItem.product_name + ` (` + overStockItem.color_name.toLocaleLowerCase() + `)`} hiện chỉ có thể đặt tổng cộng ${overStockItem.stock_qty} đơn vị đối với tất cả các kích cỡ`);
        }
        console.log(cart);
        console.log(checkItems);
    }

    // note
    async function removeItem(cartItemID: string) {
        try {
            const result = await CartService.removeItem(cartItemID);
            console.log("Remove item result:", result);
            const newCart: TypeCart = {
                id: cart?.id || null,
                totalItems: result.cart.items,
                items: result.cart.items.filter(item => item.status !== 'inactive'),
                removedItems: result.cart.items.filter(item => item.status === 'inactive'),
                totalQty: result.cart.totalQty,
                subtotal: result.cart.subtotal,
            }
            setCart(newCart);
            // setCart(prev => prev ? { ...prev, items: [...prev.items] } : null);
            setNotification("Xóa sản phẩm khỏi giỏ hàng thành công");
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.');
        }
    }
    async function batchRemove() {
        const ids = cart?.removedItems.map(item => item.variant_id) || [];
        if (ids.length !== 0)
            try {
                const result = await CartService.batchRemoveItems(ids);
                console.log("Batch remove result:", result);
                // const newCart: TypeCart
                setCart(processCart(result.cart));
            } catch (error) {
                setNotification((error instanceof Error) ? error.message : 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.');
            }
    }
    async function clearCart() {
        try {
            const result = await CartService.clearItem();
            const newCart: TypeCart = {
                id: cart?.id || null,
                totalItems: [],
                items: [],
                removedItems: [],
                totalQty: 0,
                subtotal: 0,
            }
            setCart(newCart);
            setNotification(result.message);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Có lỗi xảy ra khi xóa giỏ hàng.');
        }
    }

    // payment method
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState<string>(paymentMethodList[0].name);


    async function createOrder(selectedAddress: TypeAddress) {
        try {
            setIsCreateOrder(true);
            if (!cart || cart.items.length === 0) {
                throw new Error('Giỏ hàng trống. Không thể tạo đơn hàng');
            }
            const newCart = await fetchCart();
            checkStock(newCart?.items || []);
            const items: OrderItemPayload[] = newCart?.items.map((item) => ({
                variant_id: item.variant_id,
                quantity: item.qty, // >= 1
                size: item.size,
                color_snapshot: item.color_name,
            })) || [];
            const shipping_address_snapshot: ShippingAddressSnapshot = {
                full_name: selectedAddress.receive_name,
                address: selectedAddress.address,
                phone: selectedAddress.phone
            }
            const shipping_fee = 30000;
            const payload: any = {
                shipping_address_snapshot: shipping_address_snapshot,
                payment_method: currentPaymentMethod,
                items,
                promotion_code: selectedPromotionCode?.code || null,
                shipping_fee,
            };

            const createRes = await orderService.create(payload);
            console.log('[CartContext.createOrder] order created response raw:', JSON.stringify(createRes, null, 2));

            const orderId = createRes?.orderId || createRes?.raw?.order?.id || null;
            const amount = createRes?.amount || createRes?.raw?.order?.final_amount || null;

            if (!orderId) {
                console.error('[CartContext.createOrder] missing orderId in createRes', createRes);
                setNotification('Server response khi tạo đơn: ' + (JSON.stringify(createRes.raw || createRes) || 'empty'));
                throw new Error('Không lấy được orderId sau khi tạo đơn. Kiểm tra console & response từ server.');
            }

            setCart(null);
            if (currentPaymentMethod === 'paypal') {
                const origin = window.location.origin || '';
                const returnUrl = `${origin}/paypal-success?orderId=${encodeURIComponent(orderId)}`;
                const cancelUrl = `${origin}/paypal-cancel?orderId=${encodeURIComponent(orderId)}`;
                // cancel hay return đều chuyển về trang chi tiết đơn hàng

                const payRes = await paymentService.createPaypalOrder({
                    orderId,
                    amount: amount || 0,
                    currency: 'VND',
                    returnUrl,
                    cancelUrl
                });

                const approvalLink = (payRes?.links || []).find((l: any) => l.rel === 'approve')?.href;
                if (!approvalLink) {
                    console.error('[CartContext] no app roval link in createPaypalOrder response', payRes);
                    throw new Error('Không nhận được link thanh toán PayPal từ server.');
                }
                window.location.href = approvalLink;
                return;
            }

            // Nếu không phải Paypal, chuyển thẳng đến trang chi tiết đơn hàng
            setNotification('Đặt hàng thành công');
            router.replace(`/customer/order/${orderId}`);
        } catch (error: any) {
            // console.error('[CartContext.createOrder] error:', error);
            if (error.message.includes('Insufficient stock')) {
                const varID = error.message.split(' ');
                setNotification(varID);
            } else {
                setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi tạo đơn hàng.');
            }
        } finally {
            setIsCreateOrder(false);
        }
    }

    /////////////////////////////// Promotions && preview
    async function setPreviewItemList(promotion: Promotion) {
        if (promotion === emptyPromotion) {
            return;
        }
        if (!cart || cart.items.length === 0) {
            return;
        }
        const payload: PreviewPromotionPayload = {
            items: cart?.items.map((item) => ({
                variant_id: item.variant_id,
                quantity: item.qty,
                unit_price: item.is_flash_sale ? item.sale_price : item.unit_price,
                size: item.size,
            }),
            ),
            shipping_fee: 30000,
            promotion_code: promotion.code
        }
        // console.log('Preview promotion with payload: ', payload);
        try {
            const data = await userPromotionService.previewPromotion(payload);
            // console.log('Preview promotion result: ', data.items);
            // console.log(cart.items);
            if (data.valid !== true) {
                throw new Error(data.reason);
            }
            setPreviewPromotion(data);
            setSelectedPromotionCode(promotion);
        } catch (error) {
            if (error instanceof Error && error.message === 'Promotion not applicable to selected items') {
                setNotification('Mã khuyến mãi không áp dụng được cho các sản phẩm trong giỏ hàng.');
                // setSelectedPromotionCode(emptyPromotion);
                // setPreviewPromotion(emptyPreviewPromotion);
                return;
            }
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi xem trước khuyến mãi.');
        }
    }

    // 
    useEffect(() => {
        if (user) {
            fetchCart();
            // fetchUserAddresses();
        }
    }, [user]);

    // Đặt lại mã giảm giá khi cập nhật giỏ
    useEffect(() => {
        setPreviewPromotion(emptyPreviewPromotion);
        setSelectedPromotionCode(emptyPromotion);
    }, [cart]);

    return (<CartContext.Provider value={{
        addItem,
        cart,
        removeItem,
        updateQuantity,
        clearCart,
        // addressList,
        // fetchUserAddresses,
        // selectedAddress,
        // setSelectedAddress,
        currentPaymentMethod,
        setCurrentPaymentMethod,
        createOrder,
        selectedPromotionCode,
        setSelectedPromotionCode,
        setPreviewItemList,
        previewPromotion,
        setPreviewPromotion,
        paymentMethodList,
        isCreateOrder, setIsCreateOrder,
        loadingAddress, setLoadingAddress,
        checkStock,
        batchRemove,
    }}>
        {children}
    </CartContext.Provider>);
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};