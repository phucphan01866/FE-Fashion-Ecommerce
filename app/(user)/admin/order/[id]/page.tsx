'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sectionCSS } from "@/app/ui/user/general/general";
import { Divider } from "@/app/ui/user/general/general";
import OrderService, { OrderStatusLabel, OrderResponse, adminOrderService } from "@/service/order.service";
import { useParams } from "next/navigation";
import { InputField } from "@/app/ui/general/Input/Input";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import BasicLoadingSkeleton from "@/app/ui/general/skeletons/LoadingSkeleton";
import ReviewService from "@/service/review.service";

export default function Page({ children }: { children?: React.ReactNode }) {
    return <PageContent />;
}

function PageContent() {
    const { setNotification } = useNotificateArea();
    const { id } = useParams();
    const [order, setOrder] = useState<OrderResponse>();
    const [isReviewed, setIsReviewed] = useState<boolean>(false);
    const [reviewId, setReviewId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    async function fetchOrder() {
        if (!id) return;
        const orderId = Array.isArray(id) ? id[0] : id;
        const getOrder = await adminOrderService.getOrderById(orderId);
        setOrder(getOrder);
        setLoading(false);
    }

    async function checkReviewed() {
        if (!order) return;
        try {
            const data = await ReviewService.checkUserReviewed(order && order.items[0].variant_id || "");
            setIsReviewed(data.reviewed);
            if (data.productId) {
                setReviewId(data.reviewId);
            }
        } catch (error) {
            setNotification(error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi kiểm tra đánh giá');
        }
    }

    useEffect(() => {
        fetchOrder();
    }, [id]);
    useEffect(() => {
        checkReviewed();
    }, [order]);
    return (
        <div className="container px-4 py-8 flex flex-col gap-6 mx-auto">
            <div className={`addressInfoSection ${sectionCSS} flex flex-col gap-6`}>
                <div className="flex justify-between items-center">
                    <Title>Chi tiết đơn hàng</Title>
                    {!loading && (order?.order_status === 'pending' || order?.order_status === 'confirmed') && (
                        <CancelOrderArea order={order} />
                    )}
                </div>
                <Divider />
                {!loading ? (
                    <OrderDetail order={order!} loading={loading} fetchOrder={fetchOrder} isReviewed={isReviewed} reviewId={reviewId} />
                ) : (
                    <BasicLoadingSkeleton />
                )}
            </div>
        </div>
    );
}

// 
// const userId = req.user?.id;
// const role = req.user?.role;
// const orderId = req.params.id;
// const { reason } = req.body;



function CancelOrderArea({ order }: { order: any }) {
    const [isCancelOrder, setIsCancelOrder] = useState(false);
    const [reason, setReason] = useState<string>('');
    const { setNotification } = useNotificateArea();
    const orderId = order?.id || null;
    async function confirmCancel() {
        setNotification('Nhấn chuột hai lần để hủy đơn hàng');
    }
    async function performCancel() {
        try {
            if (!orderId) {
                throw new Error('Không tìm thấy ID đơn hàng');
            }
            await OrderService.cancelUserOrder(orderId, reason.trim());
            setNotification('Hủy đơn hàng thành công');
            // window.location.reload();
        } catch (error) {
            setNotification(error instanceof Error ? error.message : 'Hủy đơn hàng thất bại, vui lòng thử lại sau');
        }
    }
    return (
        <div className="flex gap-4">
            {isCancelOrder && (
                <InputField
                    id="cancel"
                    placeholder="Tại sao bạn hủy đơn thế?"
                    value={reason}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
                />
            )}
            {!isCancelOrder ? (
                <button
                    onClick={() => setIsCancelOrder(true)}
                    type="button"
                    className="block relative fontA4 text-orange-600 rounded-md hover:bg-gray-100 hover:shadow-sm p-1 hover:text-orange-700"
                >
                    Tôi muốn hủy đơn hàng này
                </button>
            ) : (
                <>

                    <button
                        onClick={() => setIsCancelOrder(false)}
                        type="button"
                        className="w-full max-w-[24px] block relative fontA4 text-orange-500 rounded-md hover:bg-gray-100 hover:shadow-sm p-1 hover:text-orange-700"
                    >
                        <Image src="/icon/arrow-back-up.svg" width={24} height={24} alt="Hủy xóa" />
                    </button>
                    <button
                        onClick={confirmCancel}
                        onDoubleClick={performCancel}
                        type="button"
                        className="px-2 w-full block relative fontA5 bg-orange-500 text-white rounded-md hover:opacity-90 hover:shadow-sm p-1"
                    >
                        Xác nhận hủy đơn
                    </button>
                </>
            )}
        </div>
    );
}

function OrderDetail({ order, loading, fetchOrder, isReviewed, reviewId }: { order: OrderResponse, loading: boolean, fetchOrder?: () => void, isReviewed: boolean, reviewId: string }) {


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

    if (loading) {
        return <div className="text-center py-12 text-orange-600">Đang tải đơn hàng...</div>;
    } else {
        // const [ten, sdt, diaChi] = order.shipping_address_snapshot.split('/').map(s => s.trim());
        return (
            <div className="bg-white rounded-xl shadow-lg border border-orange-200 container">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-5 rounded-t-xl">
                    <div className="flex gap-3 text-sm">
                        <span className={`px-4 py-1.5 rounded-full font-medium ${order.order_status === 'pending' ? 'bg-orange-600' : 'bg-white text-orange-500'}`}>
                            Tình trạng: {OrderStatusLabel[order.order_status]}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full font-medium ${order.payment_status === 'unpaid' ? 'bg-red-600' : 'bg-white text-orange-500'}`}>
                            Thanh toán: {order.payment_status === 'unpaid' ? 'Chưa thanh toán' : 'Đã thanh toán'} - {order.payment_method ? order.payment_method.toUpperCase() : 'N/A'}
                        </span>
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
                    <div>
                        <h4 className="font-semibold text-orange-700 mb-4">Sản phẩm</h4>
                        <div className="border border-orange-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-orange-400 text-white">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-sm font-medium">Sản phẩm</th>
                                        <th className="px-5 py-3 text-center text-sm font-medium">Số lượng</th>
                                        <th className="px-5 py-3 text-right text-sm font-medium">Đơn giá</th>
                                        <th className="px-5 py-3 text-right text-sm font-medium">Thành tiền</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item: any, idx: number) => (
                                        <tr key={idx} className="bg-orange-50 hover:bg-orange-100 transition">
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-medium">{item.name_snapshot}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {item.color_snapshot} • Size {item.size_snapshot}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center font-medium">×{item.qty}</td>
                                            <td className="px-5 py-4 text-right font-semibold text-orange-600">
                                                {formatPrice(item.unit_price)}
                                            </td>
                                            <td className="px-5 py-4 text-right font-semibold text-orange-600">
                                                {item.promo_applied && (<span className="fontA5 line-through mr-3">{formatPrice(item.unit_price * item.qty)}</span>)} {formatPrice(item.final_price || item.unit_price * item.qty)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                    <span>- {formatPrice(order.discount_amount)}</span>
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

function Title({ children }: { children: string }) {
    return <h2 className="text-2xl font-bold text-orange-600">{children}</h2>;
}