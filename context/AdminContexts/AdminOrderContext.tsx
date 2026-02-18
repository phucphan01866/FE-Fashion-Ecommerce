'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { useNotificateArea } from "../NotificateAreaContext";
import { OrderListItem, adminOrderService, OrderStatus, AdminGetOrdersQuery } from "@/service/order.service";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface OrderContextType {
    orderList: OrderListItem[];
    ordersCount: number;
    updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
    cancelOrderStatus: (id: string, status: OrderStatus, reason?: string) => Promise<void>;
    filter: AdminGetOrdersQuery;
    updateFilter: (input: Partial<AdminGetOrdersQuery>) => void;
    total: number;
}

const initFilter: AdminGetOrdersQuery = { page: 1, limit: 10 };
const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
    const { setNotification } = useNotificateArea();
    const [orderList, setOrderList] = useState<OrderListItem[]>([]);
    const [ordersCount, setOrdersCount] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [filter, setFilter] = useState<AdminGetOrdersQuery>(initFilter);

    const pathName = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    function updateFilter(input: Partial<AdminGetOrdersQuery>) {
        const query = new URLSearchParams(searchParams.toString());
        const newFilter = { ...filter, ...input };
        // Riêng page lấy theo input (nếu input 0 phải page -> reset page)
        if ('page' in input && input.page !== undefined) {
            query.set('page', String(newFilter.page));
        } else {
            query.delete('page');
        }
        // if ('limit' in newFilter && newFilter.limit !== undefined) {
        //     query.set('limit', String(newFilter.limit));
        // } else {
        //     query.delete('limit');
        // }
        if ('status' in newFilter && newFilter.status) {
            query.set('status', newFilter.status);
        } else {
            query.delete('status');
        }
        if ('from' in newFilter && newFilter.from && newFilter.from !== '') {
            query.set('from', encodeURI(newFilter.from));
        } else {
            query.delete('from');
        }
        if ('to' in newFilter && newFilter.to && newFilter.to !== '' && newFilter.to !== '') {
            query.set('to', newFilter.to);
        } else {
            query.delete('to');
        }
        // Còn from, to
        router.replace(`${pathName}?${query.toString()}`, { scroll: false });
    }

    async function fetchOrderData() {
        // const { page = 1, limit = 10, status, from, to} = req.query;
        const newFilter = {
            page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
            limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
            status: searchParams.get('status') as OrderStatus || undefined,
            from: searchParams.get('from') || undefined,
            to: searchParams.get('to') || undefined,
        };
        setFilter(newFilter);
        try {
            const response = await adminOrderService.getAllOrders(newFilter);
            setFilter(newFilter);
            setOrderList(response.orders);
            setTotal(response.total);
        } catch (error) {
            // setNotification((error instanceof Error) ? error.messsage : 'Đã có lỗi xảy ra khi lấy danh sách đơn hàng');/
        }
    }

    async function updateOrderStatus(id: string, status: OrderStatus) {
        try {
            await adminOrderService.updateOrderStatus(id, { status })
            setNotification('Cập nhật trạng thái đơn hàng thành công');
            // fetchOrderData();
        }
        catch (error) {
            setNotification(error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        }
    }

    async function cancelOrderStatus(id: string, status: OrderStatus, reason?: string) {
        try {
            await adminOrderService.updateOrderStatus(id, { status, cancel_reason: reason })
            setNotification('Hủy đơn hàng thành công');
            // fetchOrderData();
        }
        catch (error) {
            setNotification(error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi đang hủy đơn hàng');
        }
    }

    useEffect(() => {
        fetchOrderData();
    }, [searchParams]);

    return (
        <OrderContext.Provider value={{
            orderList,
            ordersCount,
            updateOrderStatus,
            cancelOrderStatus,
            filter,
            updateFilter,
            total,
        }}>
            {children}
        </OrderContext.Provider>
    );
}

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within OrderProvider');
    }
    return context;
};