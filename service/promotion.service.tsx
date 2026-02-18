const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import track from '@/utils/track';
import Cookies from 'js-cookie';

interface CreatePromotionResponse {
    message: string;
    promotion: Promotion;
}

interface PromotionResponse {
    message: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const errorData = await res.json().catch(() => { message: "Lỗi trong lúc làm việc với voucher" });
        console.log(errorData);
        if (errorData?.message && errorData.message === "Promotion code already exists") {
        throw new Error("Mã giảm giá đã tồn tại");
        };
        throw new Error(errorData?.message || errorData?.error || "Có lỗi xảy ra!");
    }
    return res.json();
}


// Interface cho Promotion từ API (response)
export interface Promotion {
    id: string;                    // UUID
    code: string;                  // WINTER2025, SALE20,...
    name: string;
    description: string | null;
    type: 'percentage' | 'amount';
    value: number;                 // 20 (%) hoặc 50000 (VND)
    min_order_value?: number | null;
    max_discount_value?: number | null;
    start_date: string;
    end_date: string;
    usage_limit?: number | null;
    used_count?: number;
    status: 'active' | 'inactive';
    applies_to: 'all_products' | 'specific';
    product_ids?: string[] | null;
    created_at: string;
    updated_at: string;
}

export const emptyPromotion: Promotion = {
    id: '',
    code: '',
    name: '',
    description: null,
    type: 'amount',
    value: 0,
    min_order_value: null,
    max_discount_value: null,
    start_date: '',
    end_date: '',
    usage_limit: null,
    used_count: 0,
    status: 'inactive',
    applies_to: 'all_products',
    product_ids: null,
    created_at: '',
    updated_at: ''
};

export interface PromotionFormData {
    code: string;
    name: string;
    description: string;
    type: string;//'percentage' | 'amount'; 
    value: number;
    min_order_value: number | null;
    max_discount_value: number | null;
    start_date: string;
    end_date: string;
    usage_limit: number;
    status: string; //'active' | 'inactive';
    product_ids: string[] | null;
}

export interface PromotionHomeItem {
    id: string;
    code: string;
    type: string;
    value: number;
    min_order_value: number;
    max_discount_value: number | null;
    start_date: string;
    end_date: string;
    usage_limit: number;
    used_count: number;
    status: string;
    applies_to: string;
    product_count: number;
    collected: boolean;
    user_action: string | null;
    collected_at: string | null;
}

export interface PreviewPromotionPayload {
    items: Array<{
        variant_id: string;
        quantity: number;
        unit_price: number;
    }>;
    shipping_fee?: number;
    promotion_code?: string;
}

// Chi tiết từng dòng sau khi tính giảm giá
export interface PreviewLineItem {
    variant_id: string;
    qty: number;
    unit_price: number;
    line_base: number;        // tiền gốc của dòng này (unit_price × qty)
    discount: number;         // số tiền giảm của dòng này
    final_line: number;       // tiền cuối cùng của dòng này
    size: string;
}

export interface DiscountBreakdownItem {
    variant_id: string;
    qty: number;
    line_base: number;
    discount: number;
}

export interface PreviewPromotionSuccessResponse {
    valid: true;
    promotion: {
        id: string;
        code: string;
        type: 'percentage' | 'amount';
        value: number;
        max_discount_value?: number | null;
    };
    subtotal: Array<{
        variant_id: string;
        qty: number;
        unit_price: number;
        line_base: number;
    }>;
    shipping_fee: number;
    discount: number;
    discount_breakdown: DiscountBreakdownItem[];
    items: PreviewLineItem[];
    final_total: number;
}

export const emptyPreviewPromotion: PreviewPromotionSuccessResponse = {
    valid: true,
    promotion: {
        id: '',
        code: '',
        type: 'amount',
        value: 0,
        max_discount_value: null
    },
    subtotal: [],
    shipping_fee: 0,
    discount: 0,
    discount_breakdown: [],
    items: [],
    final_total: 0
};

export interface PreviewPromotionErrorResponse {
    valid: false;
    message: string;
    promotion?: any;
}

export type PreviewPromotionResponse =
    | PreviewPromotionSuccessResponse
    | PreviewPromotionErrorResponse;

export const adminPromotionService = {
    async getPromotions(page: number = 1) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/promotions?page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        const data = await response.json();
        // console.log('data, ', data);
        return data;
    },
    async getPromotion(id: string) {
        const token = Cookies.get('accessToken');
        const endPoint = `${API_URL}/admin/promotions/${encodeURI(id)}`;
        const response = await fetch(endPoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        const data = await response.json();
        return data.promotion;
    },
    async createPromotion(data: PromotionFormData) {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify({
            code: data.code,
            name: data.name,
            description: data.description,
            type: data.type,
            value: data.value,
            min_order_value: data.min_order_value,
            max_discount_value: data.max_discount_value,
            start_date: data.start_date,
            end_date: data.end_date,
            usage_limit: data.usage_limit,
            status: data.status,
            product_ids: data.product_ids,
        })
        // console.table(body);
        const response = await fetch(`${API_URL}/admin/promotions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body,
        })
        const resText = await handleResponse<CreatePromotionResponse>(response);
        return "Thêm mã giảm giá thành công";
    },
    async removePromotion(id: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(
            `${API_URL}/admin/promotions/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        }
        )

        const result = (await handleResponse<PromotionResponse>(response));
        return result.message;
    },
    async updatePromotion(id: string, data: PromotionFormData) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/promotions/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                code: data.code,
                name: data.name,
                description: data.description,
                type: data.type,
                value: data.value,
                min_order_value: data.min_order_value,
                max_discount_value: data.max_discount_value,
                start_date: data.start_date,
                end_date: data.end_date,
                usage_limit: data.usage_limit,
                status: data.status,
                product_ids: data.product_ids,
            }),
        })
        const resText = await handleResponse<CreatePromotionResponse>(response);
        return "Cập nhật mã giảm giá thành công";
    },
    async updatePromotionStatus(id: string, status: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(
            `${API_URL}/admin/promotions/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                status
            }),
        }
        )
        const result = (await handleResponse<PromotionResponse>(response));
        return "Cập nhật trạng thái mã giảm giá thành công";
    },
}

// router.post('/promotions/check-code', requireUser, promotionController.checkCode);
export const userPromotionService = {
    async fetchHomePromotions(page?: number, limit?: number) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/promotions/home?page=${page || 1}&limit=${limit || 10}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
        if (!response.ok) {
            throw new Error('Lỗi khi tải voucher');
        }
        const data = await response.json();
        // console.log(data);
        return data.promotions as PromotionHomeItem[];
    },
    async collectPromotion(promotionId: string, promotionCode: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/promotions/${encodeURIComponent(promotionId)}/collect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ code: promotionCode }),
        })
        if (!response.ok) {
            throw new Error('Lỗi khi thu thập voucher');
        }
        track('collect_promotion', { promotionId, promotionCode });
        // const data = await response.json();
        // console.log(data);
        return { message: "Thu thập voucher thành công!" };
    },
    async getUserPromotion(page: number = 1, limit: number = 20): Promise<Promotion[]> {
        //Có thể thêm body = số trang, số item mỗi trang
        const token = Cookies.get('accessToken');
        const url = new URL(`${API_URL}/user/user-promotions`);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('limit', limit.toString());
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
        if (!response.ok) {
            throw new Error('Lấy danh sách mã giảm giá trong tài khoản người dùng thất bại');
        }
        const data = await response.json();
        console.log("user promo lsist: ", data);
        return data.promotions;
    },
    async checkPromotionCode(eligibleSubtotal: number): Promise<Promotion[]> {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify({ eligibleSubtotal });

        const response = await fetch(`${API_URL}/user/promotions/check-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`,
            },
            body
        })
        const data = await response.json();
        // console.log("check promo")
        // console.log(data);
        if (!response.ok) {
            throw new Error(data.message || 'Kiểm tra mã giảm giá thất bại');
        }
        // console.log(data.promotions);
        return data.promotions;
    },
    async checkPromotionCodeAndSave(manualCode: string, eligibleSubtotal: number) {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify({ code: manualCode, eligibleSubtotal, save: true });

        try {
            const response = await fetch(`${API_URL}/user/promotions/check-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`,
                },
                body
            })
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Kiểm tra mã giảm giá thất bại');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof Error && error.message === "Invalid promotion code") {
                return {
                    valid: false,
                    message: "Mã giảm giá không tồn tại"
                }
            } else if (error instanceof Error && error.message === "Promotion code is not active") {
                return {
                    valid: false,
                    message: "Mã giảm giá không khả dụng"
                }
            } else {
                return {
                    valid: false,
                    message: "Lỗi không xác định"
                }
            }
        }
    },
    async previewPromotion(payload: PreviewPromotionPayload) {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify(payload);
        const response = await fetch(`${API_URL}/user/promotions/preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`,
            },
            body
        })
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Xem trước mã giảm giá thất bại');
        }
        console.log('previewPromotion data:', data);
        return data;

    },

}