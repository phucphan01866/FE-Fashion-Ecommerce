'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sectionCSS, SeeMoreButton } from "@/app/ui/user/general/general";
import { Divider } from "@/app/ui/user/general/general";
import OrderService, { OrderStatusLabel, OrderResponse, OrderItemResponse } from "@/service/order.service";
import { useParams } from "next/navigation";
import { ControllableInputSelect, InputField } from "@/app/ui/general/Input/Input";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import BasicLoadingSkeleton from "@/app/ui/general/skeletons/LoadingSkeleton";
import ReviewService from "@/service/review.service";
import { paymentService } from "@/service/payment.service";

const customer_reason_list = [
    { content: '', label: 'Chọn một lý do nhé' },
    { content: 'Thay đổi ý định', label: 'Thay đổi ý định' },
    { content: 'Tìm được giá tốt hơn', label: 'Tìm được giá tốt hơn' },
    { content: 'Giao hàng quá chậm', label: 'Giao hàng quá chậm' },
    { content: 'Khác', label: 'Lý do khác' },
]

export default function Page({ children }: { children?: React.ReactNode }) {
    return <PageContent />;
}

function PageContent() {
    const { setNotification } = useNotificateArea();
    const { id } = useParams();
    const [order, setOrder] = useState<OrderResponse>();
    const [isReviewed, setIsReviewed] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    async function fetchOrder() {
        if (!id) return;
        const orderId = Array.isArray(id) ? id[0] : id;
        const getOrder = await OrderService.getUserOrder(orderId);
        const order = getOrder.order;
        async function fetchIsReviewed(varId: string) {
            const res = await ReviewService.checkUserReviewed(varId);
            // console.log("ackjlj că ", res);
            return {
                is_reviewed: res.reviewed,
                review_id: res.reviewId || null,
            };
        }
        const newItems = await Promise.all(order.items.map(async (item) => {
            const review_data = await fetchIsReviewed(item.variant_id);
            return {
                ...item,
                review_data: review_data,
            }
        }))
        const newOrder = { ...order, items: newItems };
        setOrder(newOrder);
        setLoading(false);
    }

    useEffect(() => {
        fetchOrder();
    }, [id]);
    return (
        <div className="container px-4 py-8 flex flex-col gap-3 mx-auto">
            <div className={`addressInfoSection ${sectionCSS} flex flex-col gap-6`}>
                <div className="flex justify-between items-end-safe">
                    <h2 className="fontA1 font-semibold! text-gray-700">Chi tiết đơn hàng</h2>
                    {!loading && (order?.order_status === 'pending' || order?.order_status === 'confirmed') && (
                        <CancelOrderArea refresh={fetchOrder} order={order} />
                    )}
                </div>
                <Divider />
                {!loading ? (
                    <OrderDetail order={order!} loading={loading} fetchOrder={fetchOrder} isReviewed={isReviewed} />
                ) : (
                    <BasicLoadingSkeleton />
                )}
            </div>
        </div>
    );
}

function CancelOrderArea({ refresh, order }: { refresh: () => void, order: any }) {
    const [isCancelOrder, setIsCancelOrder] = useState(false);
    const [reason, setReason] = useState<string>('');
    const [selectReason, setSelectReason] = useState<string>('');
    const { setNotification } = useNotificateArea();
    const orderId = order?.id || null;
    async function performCancel() {
        if ((selectReason === '') || (selectReason === 'Khác' && reason.trim() === '')) {
            setNotification('Vui lòng chọn hoặc nhập lý do hủy đơn hàng');
            return;
        }
        if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?'))
            try {
                if (!orderId) {
                    throw new Error('Không tìm thấy ID đơn hàng');
                }
                const finalReason = selectReason === 'Khác' ? reason.trim() : selectReason;
                await OrderService.cancelUserOrder(orderId, finalReason);
                setNotification('Hủy đơn hàng thành công');
                refresh();
            } catch (error) {
                setNotification(error instanceof Error ? error.message : 'Hủy đơn hàng thất bại, vui lòng thử lại sau');
            }
    }
    return (
        <div className="flex gap-4">
            {isCancelOrder && (
                <>
                    {selectReason === 'Khác' && (
                        <InputField
                            wrapperBonusCSS="h-auto! w-auto! px-3! py-1!"
                            inputBonusCSS="fontA5"
                            id="cancel"
                            placeholder="Tại sao bạn hủy đơn thế?"
                            value={reason}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
                        />
                    )}
                    <ControllableInputSelect id="reason-select"
                        items={customer_reason_list}
                        currentValue={selectReason}
                        onClick={(value: string) => { setSelectReason(value); }}
                    />
                </>
            )}
            {!isCancelOrder ? (
                <SeeMoreButton onClick={() => setIsCancelOrder(true)}>Tôi muốn hủy đơn hàng này</SeeMoreButton>
            ) : (
                <>

                    <button
                        onClick={() => setIsCancelOrder(false)}
                        type="button"
                        className="cursor-pointer w-full max-w-[24px] block relative fontA4 text-orange-500 rounded-md hover:bg-gray-100 hover:shadow-sm p-1 hover:text-orange-700"
                    >
                        <Image src="/icon/arrow-back-up.svg" width={24} height={24} alt="Hủy xóa" />
                    </button>
                    <SeeMoreButton onClick={performCancel}>Xác nhận hủy đơn</SeeMoreButton>
                </>
            )}
        </div>
    );
}




function OrderDetail({ order, loading, fetchOrder, isReviewed }: { order: OrderResponse, loading: boolean, fetchOrder?: () => void, isReviewed: boolean }) {


    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('vi-VN').format(Number(price)) + ' ₫';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const { setNotification } = useNotificateArea();
    async function handleDeleteReview(review_id: string) {
        if (confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
            try {
                await ReviewService.deleteReview(review_id);
                setNotification('Xóa đánh giá thành công');
                if (fetchOrder) { fetchOrder(); }
            } catch (error) {
                setNotification(error instanceof Error ? error.message : 'Xóa đánh giá thất bại, vui lòng thử lại sau');
            }
        }
    }

    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    async function handlePayment() {
        setIsPaymentLoading(true);
        const origin = window.location.origin || '';
        const returnUrl = `${origin}/paypal-success?orderId=${encodeURIComponent(order.id)}`;
        const cancelUrl = `${origin}/paypal-cancel?orderId=${encodeURIComponent(order.id)}`;
        // cancel hay return đều chuyển về trang chi tiết đơn hàng

        const payRes = await paymentService.createPaypalOrder({
            orderId: order.id,
            amount: order.total_amount || 0,
            currency: 'VND',
            returnUrl,
            cancelUrl
        });

        const approvalLink = (payRes?.links || []).find((l: any) => l.rel === 'approve')?.href;
        if (!approvalLink) {
            console.error('[CartContext] no app roval link in createPaypalOrder response', payRes);
            throw new Error('Không nhận được link thanh toán PayPal từ server.');
        }
        setIsPaymentLoading(false);
        window.location.href = approvalLink;
        return;
    }

    if (loading) {
        return <div className="text-center py-12 text-orange-600">Đang tải đơn hàng...</div>;
    } else {
        // const [ten, sdt, diaChi] = order.shipping_address_snapshot.split('/').map(s => s.trim());
        return (
            <div className="bg-white rounded-xl shadow-lg border border-orange-200 container">
                {/* Header */}
                <div className="bg-gradient-to-tl from-orange-300 to-orange-500 text-white p-5 rounded-t-xl">
                    <div className="flex gap-3 fontA5">
                        <div className={`flex items-center-safe gap-1.5 px-4 py-1.5 rounded-full font-medium bg-white text-orange-500`}>
                            {order.order_status === 'pending' ? <Image src="/icon/calendar-time.svg" alt="paid" width={16} height={16} className="inline" /> :
                                order.order_status === 'confirmed' ? <Image src="/icon/checkbox.svg" alt="paid" width={16} height={16} className="inline" /> :
                                    order.order_status === 'shipped' ? <Image src="/icon/truck-delivery.svg" alt="paid" width={16} height={16} className="inline" /> :
                                        order.order_status === 'delivered' ? <Image src="/icon/check_orange_500.svg" alt="paid" width={16} height={16} className="inline" /> :
                                            order.order_status === 'cancelled' ? <Image src="/icon/clipboard-x_orange.svg" alt="paid" width={16} height={16} className="inline" /> : null}
                            {OrderStatusLabel[order.order_status]}
                        </div>
                        <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-medium bg-white ${order.payment_status === 'unpaid' ? 'text-red-600' : ' text-orange-500'}`}>
                            {order.payment_method === 'paypal' && order.payment_status === 'unpaid' && order.order_status !== "cancelled" ? (
                                <button
                                    className={`cursor-pointer hover:scale-105 transition-transform duration-100 ease-in-out
                                    ${isPaymentLoading && 'text-gray-500 cursor-not-allowed'}`}
                                    type="button" onClick={handlePayment}>{isPaymentLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}</button>
                            ) : (
                                <>
                                    {order.payment_status === 'unpaid' ? (
                                        'Chưa thanh toán'
                                    ) : (
                                        <>
                                            <Image src="/icon/checks_orange_500.svg" alt="paid" width={16} height={16} className="inline" /> Đã thanh toán
                                        </>
                                    )}
                                    {` - `}
                                    <span>{order.payment_method ? order.payment_method.toUpperCase() : 'N/A'}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Thông tin nhận hàng */}
                    {order.shipping_address_snapshot && (
                        <div className="bg-orange-50 p-5 rounded-lg border border-orange-200 text-gray-700 flex flex-col gap-2">
                            <h4 className="fontA3 font-semibold! text-orange-600">Thông tin nhận hàng</h4>
                            <p className="flex gap-9 fontA4"><span><span className="font-semibold!">Người nhận:</span> {order.shipping_address_snapshot.full_name}</span> <span> <span className="font-semibold!">Số điện thoại: </span>{order?.shipping_address_snapshot.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3")}</span></p>
                            <p className="fontA4"><span className="font-semibold!">Địa chỉ chi tiết: </span>{order.shipping_address_snapshot.address}</p>
                        </div>
                    )}

                    {/* Danh sách sản phẩm */}
                    <div className="border border-orange-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-orange-400 text-white">
                                <tr>
                                    <th className="px-5 py-3 text-left fontA4 font-medium!">Sản phẩm</th>
                                    <th className="px-5 py-3 text-center fontA4 font-medium!">Đánh giá</th>
                                    <th className="px-5 py-3 text-center fontA4 font-medium!">Số lượng</th>
                                    <th className="px-5 py-3 text-right fontA4 font-medium!">Đơn giá</th>
                                    <th className="px-5 py-3 text-right fontA4 font-medium!">Thành tiền</th>

                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item: OrderItemResponse, idx: number) => {
                                    return (
                                        <tr key={idx} className="bg-white hover:bg-orange-50 transition">
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-medium">{item.name_snapshot}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.color_name && item.color_name + " • "} Size-{item.size_snapshot}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center font-semibold text-orange-600">
                                                {(order.order_status === 'delivered' && (item.review_data && item.review_data.is_reviewed === true)) ? (
                                                    <div className="flex gap-2 justify-center">
                                                        <Link href={`/customer/order/review/edit?orderId=${encodeURI(order.id)}&variantId=${encodeURI(item.variant_id)}&reviewID=${encodeURI(item.review_data.review_id || "")}`}
                                                            className="flex-2 block px-2.5 py-1.5 outline-1 bg-white outline-orange-600 rounded-md fontA5 text-orange-600 hover:shadow-lg transition-all duration-200 ease-in-out">
                                                            Cập nhật</Link>
                                                        <button type="button"
                                                            onClick={() => handleDeleteReview(item.review_data?.review_id || "")}
                                                            className="flex-1 block px-2.5 py-1.5 outline-1 bg-orange-500 cursor-pointer outline-orange-600 rounded-md fontA5 text-white hover:shadow-lg transition-all duration-200 ease-in-out" >
                                                            Xóa</button>
                                                    </div>
                                                ) : (order.order_status === 'delivered' && isReviewed === false) ? (
                                                    <Link href={`/customer/order/review/create?orderId=${encodeURI(order.id)}&variantId=${encodeURI(item.variant_id)}`} className="block px-3 py-2 rounded-md border-1 border-orange-500 whitespace-break-spaces fontA5 bg-white cursor-pointer hover:shadow-md hover:opacity-90 hover:text-orange-700 transition-all duration-200 ease-in-out">Đánh giá sản phẩm</Link>
                                                ) : (order.order_status !== 'delivered') ? (
                                                    <button className="px-3 py-2 rounded-md outline-1 outline-gray-300 text-gray-400 fontA5 cursor-not-allowed bg-white hover:shadow-sm hover:opacity-90">Chưa thể đánh giá</button>
                                                ) : null
                                                }

                                            </td>
                                            <td className="px-5 py-4 text-center font-medium">×{item.qty}</td>
                                            <td className="px-5 py-4 text-right font-semibold text-orange-600">
                                                {formatPrice(item.unit_price)}
                                            </td>
                                            {formatPrice(item.unit_price * item.qty) !== formatPrice(item.final_price) ? (
                                                <td className="px-5 py-4 text-right font-semibold text-orange-600">
                                                    <div className="flex justify-end-safe items-baseline-last gap-3">
                                                        <span className="fontA6 italic line-through">{Number(item.unit_price * item.qty).toLocaleString('vi-VN')}</span>
                                                        <span>{formatPrice(item.final_price)}</span>
                                                    </div>
                                                </td>
                                            ) : (
                                                <td className="px-5 py-4 text-right font-semibold text-orange-600">
                                                    {formatPrice(item.final_price)}
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Tổng tiền */}
                    <div className="border-t-2 border-orange-300 pt-5">
                        <div className="space-y-2 text-lg">
                            <div className="flex fontA4 justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>{formatPrice(order.total_amount)}</span>
                            </div>
                            {order.discount_amount && order.discount_amount > 0 && (
                                <div className="flex fontA4 justify-between text-gray-600">
                                    <span>Mã giảm giá</span>
                                    <span className="">- {formatPrice(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex fontA4 justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span>{formatPrice(order.shipping_fee)}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-orange-600 pt-3 border-t-2 border-orange-200">
                                <span>Tổng cộng</span>
                                <span>{formatPrice(order.final_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                        Đặt hàng lúc: {formatDate(order.created_at)}
                    </div>
                </div>
            </div>
        );
    }

}