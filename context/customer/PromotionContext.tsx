'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { Promotion, userPromotionService } from "@/service/promotion.service";
import { useNotificateArea } from "../NotificateAreaContext";


interface UserPromotionContextType {
    promotionList: Promotion[];
    fetchUserPromotions: () => void;
    nextPage: () => Promise<void>;
    hasMore: boolean;
}

const UserPromotionContext = createContext<UserPromotionContextType | undefined>(undefined);

// Có thể phân trang / đang phân trang
export function UserPromotionProvider({ children }: { children: React.ReactNode }) {
    const perPage = 20;
    const [promotionList, setPromotionList] = useState<Promotion[]>([]);
    const [nextPageList, setNextPageList] = useState<Promotion[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const nextPage = async () => {
        await fetchUserPromotions(currentPage + 1);
        setCurrentPage((prev) => prev + 1)
    };

    const { setNotification } = useNotificateArea();

    // 10 - 10 -> có next
    // 10 - < 10 -> có next
    // 10 - 0 -> không next
    // <10 - 0 -> không next
    async function fetchUserPromotions(page: number = 1) {
        try {
            if (page === 1) {
                const newUserPromotionList = await userPromotionService.getUserPromotion(page, perPage);
                setPromotionList(newUserPromotionList);
            } else {
                setPromotionList(prev => [...prev, ...nextPageList]);
            }
            const nextPromotionList = await userPromotionService.getUserPromotion(page + 1, perPage);
            setNextPageList(nextPromotionList);
            setHasMore(nextPromotionList.length > 0);
        } catch (error) {
            setNotification(error instanceof Error ? error.message : 'Lỗi không lấy được mã giảm giá');
        }
    }

    useEffect(() => {
        fetchUserPromotions();
    }, []);

    return (
        <UserPromotionContext.Provider
            value={{
                promotionList,
                fetchUserPromotions,
                nextPage,
                hasMore
            }}>
            {children}
        </UserPromotionContext.Provider>
    );
}

export const useUserPromotion = () => {
    const context = useContext(UserPromotionContext);
    if (!context) {
        throw new Error('useUserPromotion must be used within UserPromotionProvider');
    }
    return context;
};