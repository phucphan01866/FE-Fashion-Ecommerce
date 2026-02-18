const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import Cookies from 'js-cookie';

interface SaleStatisticItem {
    period_start: string;
    revenue: number;
    orders_count: number;
    payments_count?: number;
    payment_count?: number; //có s hay không tùy unit    
}

export interface SaleStatistics {
    success: boolean;
    unit: string;
    start: string;
    end: string;
    data: SaleStatisticItem[];
}

export interface PayloadStatistics {
    unit: 'week' | 'month' | 'year';
    start?: string;
    end?: string;
}

export interface TopProductsResponse {
    data: any[],
    limit: number,
    success: boolean,
}

export interface PayloadTopProducts {
    start: string;
    end: string;
    limit?: number;
}

const dateFormatRegex = /^\d{4}\/\d{2}\/\d{2}$/;
function formatDataToYYYYMMDD(dateStr: string): string {
    let result = dateStr;
    if (!dateFormatRegex.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        result = `${year}/${month}/${day}`;
    }
    return result;
}

export const statisticsService = {
    async getSaleStatitics(payload: PayloadStatistics): Promise<SaleStatistics> {
        const token = Cookies.get('accessToken');
        const params = new URLSearchParams();
        if (payload.unit) params.append('unit', payload.unit);
        if (payload.start && payload.start.length > 0) params.append('start', formatDataToYYYYMMDD(payload.start));
        if (payload.end && payload.end.length > 0) params.append('end', formatDataToYYYYMMDD(payload.end));
        const url = `${API_URL}/admin/stats/revenue?${params}`
        console.log(url);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Lấy thống kê doanh thu thất bại');
        }
        const data = await response.json();
        console.log('Sales statistics data:', data);
        return data;
    },

    async getProductStatitics(payload: PayloadTopProducts) {
        const token = Cookies.get('accessToken');
        const { start, end, limit } = payload;
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (start && start.length > 0) params.append('start', start);
        if (end && end.length > 0) params.append('end', end);
        const url = `${API_URL}/admin/stats/top-products?${params}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Lấy thống kê sản phẩm thất bại');
        }
        const data = await response.json();
        console.log('Product statistics data:', url);
        return data;
    }
}

export default statisticsService;