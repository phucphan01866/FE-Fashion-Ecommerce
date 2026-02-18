'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { useNotificateArea } from "../NotificateAreaContext";
import OrderService, { OrderListItem, GetOrdersResponse, GetOrdersQuery } from "@/service/order.service";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

interface OrderContextType {
    orderList: OrderListItem[];
    ordersCount: number;
    updateFilters: (partialFilter: Partial<GetOrdersQuery>) => void;
    // currentPage: number;
    filters?: GetOrdersQuery;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
    const pageSize = 10;
    const { setNotification } = useNotificateArea();
    const [orderList, setOrderList] = useState<OrderListItem[]>([]);
    const [ordersCount, setOrdersCount] = useState<number>(0);
    // const [currentPage, setCurrentPage] = useState<number>(1);

    const searchParams = useSearchParams();
    const path = usePathname();
    const router = useRouter();
    function getFilterFromSearchParams(): GetOrdersQuery {
        return {
            page: searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : pageSize,
            status: searchParams.get('status') || undefined,
            from: searchParams.get('from') || undefined,   // YYYY-MM-DD
            to: searchParams.get('to') || undefined,       // YYYY-MM-DD
        }
    }

    const filters = getFilterFromSearchParams();
    

    async function fetchOrderData() {
        try {
            // console.log(filters);
            const response = await OrderService.getUserOrders(filters);
            setOrderList(response.data.orders.orders);
            setOrdersCount(response.data.total);
            // setCurrentPage(filters.page || 1);
            // console.log("Orders: ");
            // console.log(response.data.orders.orders);
        } catch (error) {
            // setNotification((error instanceof Error) ? error.messsage : 'Đã có lỗi xảy ra khi lấy danh sách đơn hàng');
            setOrderList([]);
            setOrdersCount(0);
        }
    }

    useEffect(() => {
        fetchOrderData();
    }, [searchParams]);

    function updateFilters(partialFilter: Partial<GetOrdersQuery>) {
        const params = new URLSearchParams();
        Object.entries(partialFilter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            } else {
                params.delete(key);
            }
        });
        if (!(Object.keys(partialFilter).includes('page'))) {
            params.delete('page');
        }
        router.replace(`${path}?${params.toString()}`);
    }

    return (
        <OrderContext.Provider value={{ orderList, ordersCount, updateFilters, filters }}>
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