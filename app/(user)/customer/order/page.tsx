'use client'

import Link from "next/link";
import Image from "next/image";
import { useContext, useState } from "react";
import { Title, BaseUserPageLayout, sectionCSS, sectionGridCSS, Divider, VoidGeneralButton } from "@/app/ui/user/general/general";
import OrderService, { OrderListItem, OrderStatusLabel } from "@/service/order.service";
import { OrderProvider, useOrder } from "@/context/customer/OrderContext";
import { useSearchParams } from "next/navigation";
import { ControllableInputSelect } from "@/app/ui/general/Input/Input";

export default function page({ }) {
    return (
        <BaseUserPageLayout>
            <OrderProvider>
                <Title>
                    <p>Đơn hàng của tôi</p>
                    <VoidGeneralButton />
                </Title>
                {/* <SummarySection /> */}
                <OrderListSection />
            </OrderProvider>
        </BaseUserPageLayout>
    );
}

type SummaryType = 'month' | 'year' | 'all';
interface SummaryDataItem {
    type: SummaryType;
    orders: string;
    spent: number;
    content: string;
}

function OrderListSection() {
    const { ordersCount } = useOrder();
    return (
        <div className={`OrderListSection ${sectionCSS} grid gap-2`}>
            {/* <FilterSection /> */}
            {/* customer không có filter */}
            {/* <Divider /> */}
            {ordersCount && ordersCount > 0 ? <OrderList /> : <div className="font-a5 italic text-center mt-4">Bạn không còn đơn hàng nào khác</div>}
            <PaginationSection />
        </div>
    );
}

function FilterSection() {
    const { updateFilters, filters } = useOrder();

    return (
        <div className="FilterSection">
            <ControllableInputSelect
                id="status"
                label="Trạng thái đơn hàng"
                items={[
                    { content: '', label: 'Tất cả' },
                    { content: 'pending', label: OrderStatusLabel['pending'] },
                    { content: 'confirmed', label: OrderStatusLabel['confirmed'] },
                    { content: 'shipped', label: OrderStatusLabel['shipped'] },
                    { content: 'delivered', label: OrderStatusLabel['delivered'] },
                    { content: 'cancelled', label: OrderStatusLabel['cancelled'] },
                ]}
                currentValue={filters?.status || ''}
                onClick={(value) => { updateFilters({ status: value as string || undefined }) }}
                hiddenItems={['']}
            />
        </div>
    );
}

function OrderList() {
    const { orderList } = useOrder();
    return (
        <table className={`OrderList w-full`}>
            <thead><ListHead /></thead>
            <tbody className="pb-4">
                {orderList.map(order => (
                    <Order key={order.id} data={order} />
                ))}
            </tbody>
        </table>
    );
}

const headItemCSS = "py-4 font-a4 font-semibold"
const bodyItemCSS = "py-4 font-a4 font-medium"

function ListHead() {
    return (
        <tr>
            <th className={`${headItemCSS}`}>Thời gian tạo</th>
            <th className={`${headItemCSS}`}>Hình thức thanh toán</th>
            <th className={`${headItemCSS}`}>Giai đoạn</th>
            <th className={`${headItemCSS}`}>Tổng cộng</th>
            <th className={`${headItemCSS}`}>Tùy chọn</th>
        </tr>
    )
}

interface Order {
    id: number;
    status: "chưa thanh toán" | "đã thanh toán" | "đang chuẩn bị" | "đang vận chuyển" | "đã nhận hàng";
    timeCreated: Date;
    timeCompleted: Date;
    total: number;
}

function Order({ data }: { data: OrderListItem }) {
    const order = {
        created_at: data.created_at,
        method: "cod",
        payment_status: data.payment_status,
        order_status: data.order_status,
        final_amount: data.final_amount
    }
    return (
        <tr className={`Order hover:bg-gray-100 rounded-lg`}>
            <th className={`${bodyItemCSS}`}>
                {new Date(order.created_at).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </th>
            <th className={`${bodyItemCSS}`}>
                {order.method === "paypal" && order.payment_status === "unpaid" ? (
                    <Link href="#" className="fontA4 text-orange-400 hover:text-orange-500"><span className="uppercase">{order.method}</span>- Chưa thanh toán</Link>
                ) : (
                    <span><span className="uppercase">{order.method}</span> - {order.payment_status === 'unpaid' ? 'Chưa thanh toán' : 'Đã thanh toán'}</span>
                )}
            </th>
            {/* giai đoạn */}
            <th className={`${bodyItemCSS}`}>{OrderStatusLabel[order.order_status]}</th>
            <th className={`${bodyItemCSS}`}>{Math.floor(order.final_amount).toLocaleString('vi-VN')}đ</th>
            <th className={`${bodyItemCSS} flex gap-4 justify-center`}>
                <Link href={`/customer/order/${data.id}`} className="block relative fontA4 rounded-md hover:bg-gray-100 hover:shadow-sm p-1 text-orange-400 hover:text-orange-500">
                    <Image src={'/icon/list-details.svg'} width={24} height={24} alt="Xem thêm" />
                </Link>
            </th>
        </tr>
    );
}

function PaginationSection() {
    const { ordersCount } = useOrder();
    return (
        <div className="PaginationSection flex gap-2 justify-center">
            {Array.from({ length: Math.ceil(ordersCount / 10) }, (_, i) => (
                <PaginationButton key={i} page={i + 1} />
            ))}
        </div>
    )
}

function PaginationButton({ page }: { page: number }) {
    const { updateFilters, filters } = useOrder();
    return (
        <button
            onClick={() => updateFilters({ page: page })}
            className={`
            px-2 py-2 rounded-md bg-gray-100 cursor-pointer
        hover:bg-gray-200
        ${filters?.page === page ? 'font-bold underline' : ''}
        `}>
            <p className="min-w-[2ch]">{page}</p>
        </button>
    )
}