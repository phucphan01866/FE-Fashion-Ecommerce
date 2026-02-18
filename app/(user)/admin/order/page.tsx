'use client'

import Link from "next/link";
import Image from "next/image";
import { useContext, useState } from "react";
import { Title, BaseUserPageLayout, sectionCSS, sectionGridCSS, Divider, VoidGeneralButton, Pagination, formatIntoDDMMYYYY } from "@/app/ui/user/general/general";
import { adminOrderService, OrderListItem, OrderStatus, OrderStatusLabel } from "@/service/order.service";
import { OrderProvider, useOrder, } from "@/context/AdminContexts/AdminOrderContext";
import { ControllableInputSelect, InputField, InputSelect } from "@/app/ui/general/Input/Input";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useDebounce } from "@/hooks";
import { on } from "events";

export default function page({ }) {
    return (
        <BaseUserPageLayout>
            <Title>
                <p className="fontA2">Quản lý đơn hàng</p>
                <VoidGeneralButton />
            </Title>
            <OrderProvider>
                <OrderListSection />
            </OrderProvider>
        </BaseUserPageLayout>
    );
}

function OrderListSection() {
    const { orderList } = useOrder();
    return (
        <div className={`OrderListSection ${sectionCSS} grid gap-2`}>
            <Filters />
            {orderList && orderList.length > 0 ?
                <>
                    <Divider />
                    <OrderList />
                </> :
                <div className="px-6 py-12 fontA4 text-center text-gray-500">Bạn hiện chưa có đơn hàng nào.</div>}
        </div>
    );
}

function OrderList() {
    const { orderList, updateFilter, filter, total } = useOrder();
    return (
        <>
            <table className={`OrderList w-full`}>
                <thead><ListHead /></thead>
                <tbody className="pb-4">
                    {orderList.map(order => (
                        <Order key={order.id} data={order} />
                    ))}
                </tbody>
            </table>
            <Pagination current={filter.page} total={Math.ceil(total / filter.limit)} onPageChange={(page: number) => updateFilter({ page })} />
        </>
    );
}

const headItemCSS = "py-4 font-a4 font-semibold"
const bodyItemCSS = "py-4 font-a4 font-medium"

function ListHead() {
    return (
        <tr>
            <th className={`${headItemCSS}`}>Tài khoản</th>
            <th className={`${headItemCSS}`}>Thời gian tạo</th>
            <th className={`${headItemCSS}`}>Hình thức thanh toán</th>
            <th className={`${headItemCSS}`}>Tổng cộng</th>
            <th className={`${headItemCSS} w-[280px]`}>Trạng thái</th>
            <th className={`${headItemCSS}`}>Tùy chọn</th>
        </tr>
    )
}

const admin_reason_list = [
    { content: 'Hết hàng', label: 'Hết hàng' },
    { content: 'Địa chỉ giao có vấn đề', label: 'Địa chỉ giao có vấn đề' },
    { content: 'Vấn đề thanh toán', label: 'Vấn đề thanh toán' },
    { content: 'Đơn hàng bất thường', label: 'Đơn hàng bất thường' },
    { content: 'Khách hàng yêu cầu', label: 'Khách hàng yêu cầu' },
    { content: 'Khác', label: 'Khác' },
]

function Order({ data }: { data: OrderListItem }) {
    const [isCancelOrder, setIsCancelOrder] = useState<boolean>(false);
    const [cancelReason, setCancelReason] = useState<string>(admin_reason_list[0].content);
    const [otherReason, setOtherReason] = useState<string>('');
    const { updateOrderStatus, cancelOrderStatus } = useOrder();
    const setNoti = useNotificateArea().setNotification;
    const [currentStatus, setCurrentStatus] = useState<OrderStatus>(data.order_status);
    const [currentPaymentStatus, setCurrentPaymentStatus] = useState<string>(data.payment_status);
    const [isCancellable, setIsCancellable] = useState<boolean>(data.order_status !== OrderStatus.CANCELLED && data.order_status !== OrderStatus.DELIVERED && data.order_status !== OrderStatus.SHIPPED);

    function handleUpdateStatus(stringStatus: string) {
        const status: OrderStatus = stringStatus as OrderStatus;
        if (!Object.values(OrderStatus).includes(status)) {
            setNoti("Trạng thái đơn hàng không hợp lệ");
            return;
        }
        if (status === currentStatus) {
            return;
        }
        try {
            const newStatus = status === OrderStatus.SHIPPED ? OrderStatus.DELIVERED : status;
            updateOrderStatus(data.id, newStatus); //tạm thời tự động chuyển từ đang giao hàng -> đã giao hàng
            setCurrentStatus(newStatus);
            setCurrentPaymentStatus(newStatus === OrderStatus.DELIVERED ? 'paid' : currentPaymentStatus);
        } catch (error) {
            setNoti("Cập nhật trạng thái đơn hàng thất bại");
        }
    }
    const perFormCancelOrder = () => {

        let reason = cancelReason;
        if (cancelReason === 'Khác') {
            reason = otherReason.trim();
        }
        if (!reason) {
            setNoti("Vui lòng điền lý do hủy đơn hàng");
            return;
        }
        const confirm: boolean = window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng?`);
        if (!confirm) {
            return;
        }
        cancelOrderStatus(data.id, OrderStatus.CANCELLED, reason);
        setCurrentStatus(OrderStatus.CANCELLED);
        setNoti(`Đã hủy đơn hàng với lý do: ${reason}`);
        setIsCancelOrder(false);
        setIsCancellable(false);
    }
    return (
        <tr className={`Order hover:bg-gray-100 rounded-lg`}>
            <th className={`${bodyItemCSS}`}>
                {data?.full_name! || data?.name! || data?.user_email!}
            </th>
            <th className={`${bodyItemCSS}`}>
                {new Date(data.created_at).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </th>
            {/* hình thức thanh toán */}
            <th className={`${bodyItemCSS}`}>
                <span>
                    <span className="uppercase">{data.payment_method}</span>
                    <br />
                    {currentPaymentStatus === 'unpaid' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                </span>
                {/* Chờ xử lý hoặc đã xác nhận -> đang giao hàng (bỏ qua) -> đã giao hàng -> dừng */}
            </th>
            {/* giá */}
            <th className={`${bodyItemCSS}`}>{Math.floor(data.final_amount).toLocaleString('vi-VN')}đ</th>
            {/* trạng thái */}
            <th className={`${bodyItemCSS}`}>
                {!isCancelOrder ? (
                    <ControllableInputSelect
                        disabled={!(currentStatus === OrderStatus.PENDING || data.order_status === OrderStatus.CONFIRMED)}
                        bonusMainBTNCSS=""
                        maxWidth="max-w-[192px] mx-auto"
                        id="order_status"
                        items={[
                            { content: 'pending', label: 'Chờ xử lý' },
                            { content: 'confirmed', label: 'Đã xác nhận' },
                            { content: 'shipped', label: 'Đang giao hàng' },
                            { content: 'delivered', label: 'Đã giao hàng' },
                            { content: 'cancelled', label: 'Đã hủy' },
                        ]}
                        hiddenItems={['cancelled']}
                        currentValue={currentStatus}
                        onClick={(newValue) => { handleUpdateStatus(newValue) }}
                    />
                ) : (
                    <div className="flex flex-col gap-2">
                        <ControllableInputSelect
                            maxWidth="w-full max-w-[192px] mx-auto"
                            id={`cancel_reason-${data.id}`}
                            items={admin_reason_list}
                            currentValue={cancelReason}
                            onClick={(value) => { setCancelReason(value) }}
                        />
                        {cancelReason === 'Khác' && (
                            <InputField
                                value={otherReason}
                                onChange={(e) => { setOtherReason(e.target.value) }}
                                id={`other_cancel_reason-${data.id}`}
                                type="text"
                                placeholder="Nhập lý do hủy đơn"
                                bonusCSS="max-w-[192px] mx-auto"
                            />
                        )}
                    </div>
                    // <InputField 
                    // value={cancelReason}
                    // onChange={(e)=>{setCancelReason(e.target.value)}}
                    // id={`cancel_reason-${data.id}`} 
                    // type="text" 
                    // placeholder="Nhập lý do hủy đơn..." 
                    // bonusCSS="max-w-[192px] mx-auto" />
                )}
            </th>
            {/* mớ nút */}
            <th className={`${bodyItemCSS}`}>
                <div className="flex gap-4 justify-center">
                    {!isCancelOrder ? (
                        <>
                            <Link href={`/admin/order/${data.id}`} className="block relative fontA4 rounded-md hover:bg-gray-100 hover:shadow-sm p-1 text-orange-400 hover:text-orange-500">
                                <Image src={'/icon/list-details.svg'} width={24} height={24} alt="Xem thêm" />
                            </Link>
                            <button
                                disabled={!isCancellable}
                                onClick={() => {
                                    if (!isCancellable) {
                                        return;
                                    }
                                    setIsCancelOrder(true)
                                }}
                                type="button"
                                className={`
                                ${(!isCancellable) && 'cursor-not-allowed opacity-50'}
                                block relative fontA4 text-red-500  rounded-md hover:bg-gray-100 hover:shadow-sm p-1 hover:text-red-700 ${currentStatus === OrderStatus.SHIPPED || currentStatus === OrderStatus.DELIVERED ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Image src={'/icon/trash-x.svg'} width={24} height={24} alt="Xóa" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => perFormCancelOrder()} type="button" className="block relative fontA4 text-orange-500  rounded-md hover:bg-gray-100 hover:shadow-sm p-1 hover:text-orange-700">
                                <Image src={'/icon/trash-x-filled.svg'} width={24} height={24} alt="Xác nhận" />
                            </button>
                            <button onClick={() => setIsCancelOrder(false)} type="button" className="block relative fontA4 text-orange-500  rounded-md hover:bg-gray-100 hover:shadow-sm p-1 hover:text-orange-700">
                                <Image src={'/icon/arrow-back-up.svg'} width={24} height={24} alt="Hủy xóa" />
                            </button>
                        </>
                    )}
                </div>
            </th>
        </tr >
    );
}

function Filters() {
    const { updateFilter, filter } = useOrder();
    const debouncedUpdateFilter = useDebounce(updateFilter, 1);
    const [from, setFrom] = useState<string>(filter.from || '');
    const [to, setTo] = useState<string>(filter.to || '');
    function onInput(value: string = '1', type: 'from' | 'to') {
        if (value.length > 10) return;
        if (type === 'from') {
            setFrom(value);
            if (value.length >= 10 || value.length === 0) {
                debouncedUpdateFilter({ from: value });
            }
        } else if (type === 'to') {
            setTo(value);
            if (value.length >= 10 || value.length === 0)
                debouncedUpdateFilter({ to: value || "" });
        }
    }
    return (
        <div className="grid grid-cols-3 gap-6">
            <ControllableInputSelect id="status"
                label="Trạng thái"
                items={[
                    { content: '', label: 'Tất cả' },
                    { content: 'pending', label: 'Chờ xử lý' },
                    { content: 'confirmed', label: 'Đã xác nhận' },
                    { content: 'shipped', label: 'Đang giao hàng' },
                    { content: 'delivered', label: 'Đã giao hàng' },
                    { content: 'cancelled', label: 'Đã hủy' },
                ]}
                currentValue={filter.status || ''}
                onClick={(value) => { updateFilter({ status: value as OrderStatus }) }}
            />
            <InputField id="from"
                label="Từ ngày"
                placeholder="01/01/2015"
                value={from || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const formattedValue = formatIntoDDMMYYYY(e.target.value);
                    if (formattedValue !== undefined) {
                        onInput(formattedValue, 'from');
                    }
                }}
            />
            <InputField id="to"
                label="Đến ngày"
                value={to || ''}
                placeholder="31/12/2030"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const formattedValue = formatIntoDDMMYYYY(e.target.value);
                    if (formattedValue !== undefined) {
                        onInput(formattedValue, 'to');
                    }
                }}
            />
        </div>
    )
}