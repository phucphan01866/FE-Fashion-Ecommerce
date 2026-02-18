'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { adminPromotionService, Promotion, PromotionFormData } from "@/service/promotion.service";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CloudHail } from "lucide-react";

interface AdminPromotionContextType {
    promotionList: Promotion[];
    fetchPromotions: () => void;
    pagination: PaginationProps;
    loadPage: (page: number) => void;
}

interface PaginationProps {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
}

const AdminPromotionContext = createContext<AdminPromotionContextType | undefined>(undefined);

export function AdminPromotionProvider({ children }: { children: React.ReactNode }) {

    const [promotionList, setPromotionList] = useState<Promotion[]>([]);
    const [pagination, setPagination] = useState<PaginationProps>({
        limit: 10,
        page: 1,
        total: 0,
        totalPages: 0,
    });

    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams.toString());


    async function fetchPromotions() {
        const page = Number(params.get('page')) || 1;
        const data = await adminPromotionService.getPromotions(page);
        setPromotionList(data.promotions);
        setPagination(data.pagination);
        // console.log("Fetched promotions:", newPromotionList);
    }

    function loadPage(page: number) {
        if (page < 1 || page > pagination.totalPages) return;
        params.set('page', page.toString());
        if (page === 1) {
            params.delete('page');
        }
        router.replace(`${pathName}?${params.toString()}`);
    }

    useEffect(() => {
        console.log(params);
        fetchPromotions();
    }, [searchParams]);

    // useEffect(() => {
    //     fetchPromotions();
    // }, []);

    return (
        <AdminPromotionContext.Provider
            value={{
                promotionList,
                fetchPromotions,
                pagination,
                loadPage,
            }}>
            {children}
        </AdminPromotionContext.Provider>
    );
}

export const useAdminPromotion = () => {
    const context = useContext(AdminPromotionContext);
    if (!context) {
        throw new Error('useAdminPromotion must be used within PromotionProvider');
    }
    return context;
};