'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { useNotificateArea } from "../NotificateAreaContext";
import dayjs from "dayjs";
import statisticsService, { PayloadStatistics, SaleStatistics, PayloadTopProducts, TopProductsResponse } from "@/service/stastitics.service";

interface StatiticContextType {
    // Doanh thu theo thời gian
    saleStatistics: SaleStatistics;
    statQuery: PayloadStatistics;
    currentStatQuery: PayloadStatistics;
    updateStatQuery: (content: Partial<PayloadStatistics>) => void;
    fetchSaleStatiticData: () => Promise<void>;

    // Top sản phẩm
    topProducts: TopProductsResponse;
    isLoadingProducts: boolean;
    productsPayload: PayloadTopProducts;
    currentProductsPayload: PayloadTopProducts;
    updateProductsPayload: (content: Partial<PayloadTopProducts>) => void;
    fetchProductStatiticData: () => Promise<void>;
    refetchTopProducts: () => Promise<void>;
}

const emptySaleStatistics: SaleStatistics = {
    success: false,
    unit: '',
    start: '',
    end: '',
    data: [],
}

const emptyStatiticPayload: PayloadStatistics = {
    unit: 'week',
    start: '',
    end: '',
}

const emptyTopProducts: TopProductsResponse = {
    data: [],
    limit: 10,
    success: false,
}

const today = dayjs();
const emptyTopProductsPayload: PayloadTopProducts = {
    start: '',
    end: '',
    limit: 10,
}
const defaultTopProductsPayload: PayloadTopProducts = {
    start: today.subtract(6, 'day').format('YYYY/MM/DD'),
    end: today.format('YYYY/MM/DD'),
    limit: 10,
}

const StatiticContext = createContext<StatiticContextType | undefined>(undefined);

export function StatiticProvider({ children }: { children: React.ReactNode }) {
    const { setNotification } = useNotificateArea();

    const [saleStatistics, setSaleStatistics] = useState<SaleStatistics>(emptySaleStatistics);
    const [currentStatQuery, setCurrentStatQuery] = useState<PayloadStatistics>({ unit: 'week' });
    const [statQuery, setStatQuery] = useState<PayloadStatistics>(emptyStatiticPayload);

    const [topProducts, setTopProducts] = useState<TopProductsResponse>(emptyTopProducts);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [productsPayload, setProductsPayload] = useState<PayloadTopProducts>(defaultTopProductsPayload);
    const [currentProductsPayload, setCurrentProductsPayload] = useState<PayloadTopProducts>(emptyTopProductsPayload);

    async function fetchSaleStatiticData() {
        try {
            const res = await statisticsService.getSaleStatitics(statQuery);
            setCurrentStatQuery(statQuery);
            setSaleStatistics(res);
            // console.log('get stats: ', statQuery, res);
        } catch (error) {
            setNotification('Lấy thống kê doanh thu thất bại' + (error instanceof Error ? error.message : ''));
        }
    }

    function updateStatQuery(content: Partial<PayloadStatistics>) {
        setStatQuery(prev => ({ ...prev, ...content }));
    }

    async function fetchProductStatiticData() {
        setIsLoadingProducts(true);
        try {
            const res = await statisticsService.getProductStatitics(productsPayload);
            setCurrentProductsPayload(productsPayload);
            setTopProducts(res);
        } catch (error) {
            setNotification('Lấy thống kê sản phẩm thất bại' + (error instanceof Error ? error.message : ''));
        } finally {
            setIsLoadingProducts(false);
        }
    }

    const updateProductsPayload = (content: Partial<PayloadTopProducts>) => {
        setProductsPayload(prev => ({ ...prev, ...content }));
    };

    const refetchTopProducts = async () => {
        await fetchProductStatiticData();
    };

    useEffect(() => {
        fetchSaleStatiticData();
        fetchProductStatiticData();
    }, []);

    return (
        <StatiticContext.Provider value={{
            // Doanh thu
            saleStatistics,
            statQuery,
            currentStatQuery,
            updateStatQuery,
            fetchSaleStatiticData,

            // Top sản phẩm
            topProducts,
            isLoadingProducts,
            productsPayload,
            currentProductsPayload,
            updateProductsPayload,
            fetchProductStatiticData,
            refetchTopProducts,
        }}>
            {children}
        </StatiticContext.Provider>
    );
}

export const useStatitic = () => {
    const context = useContext(StatiticContext);
    if (!context) {
        throw new Error('useStatitic must be used within StatiticProvider');
    }
    return context;
};