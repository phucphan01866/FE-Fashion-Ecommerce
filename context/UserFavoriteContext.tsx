'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { useNotificateArea } from "./NotificateAreaContext";
import { favoriteService, FavoriteProductsLists } from "@/service/favorite.service";

interface FavoritePageContextType {
    favoriteData: FavoriteProductsLists | undefined;
    preFetchFavoriteData: FavoriteProductsLists | undefined;
    showMore: () => Promise<void>;
}

const FavoritePageContext = createContext<FavoritePageContextType | undefined>(undefined);

export function FavoritePageProvider({ children }: { children: React.ReactNode }) {
    const [favoriteData, setFavoriteData] = useState<FavoriteProductsLists>();
    const [preFetchFavoriteData, setPreFetchFavoriteData] = useState<FavoriteProductsLists>();
    const { setNotification } = useNotificateArea();
    async function fetchFavoritePageData() {
        try {
            const result = await favoriteService.getListFavorite();
            setFavoriteData(result);
            await preFetch(result.nextCursor || 0);
            console.log("Favorite page data fetched:", result);
        } catch (error) {
            setNotification(error instanceof Error ? error.message : 'Lỗi khi tải dữ liệu yêu thích');
        }
    }

    // async function showMore() {
    //     try {
    //         const result = await favoriteService.getListFavorite(favoriteData?.nextCursor || 0);
    //         setFavoriteData(prev => ([...prev?.items || [], ...result.items].length > 0 ? {
    //             items: [...prev?.items || [], ...result.items],
    //             nextCursor: result.nextCursor
    //         } : prev) as FavoriteProductsLists);
    //         console.log("Favorite page data fetched:", result);
    //     } catch (error) {
    //         setNotification(error instanceof Error ? error.message : 'Lỗi khi tải dữ liệu yêu thích');
    //     }
    // }

    async function preFetch(cursor: number) {
        try {
            const result = await favoriteService.getListFavorite(cursor);
            setPreFetchFavoriteData(result);
            console.log("Favorite page data prefetched:", result);
        } catch (error) {
            setNotification(error instanceof Error ? error.message : 'Lỗi khi tải trước dữ liệu yêu thích');
        }
    }

    async function showMore() {
        if (!preFetchFavoriteData) return;
        setFavoriteData(prev => ({
            items: [...(prev?.items ?? []), ...preFetchFavoriteData.items],
            nextCursor: preFetchFavoriteData.nextCursor,
            success: preFetchFavoriteData.success
        }));
        await preFetch(preFetchFavoriteData.nextCursor || 0);
    }
    useEffect(() => {
        fetchFavoritePageData();
    }, []);

    return (
        <FavoritePageContext.Provider value={{
            favoriteData,
            preFetchFavoriteData,
            showMore
        }}>
            {children}
        </FavoritePageContext.Provider>
    );
}



export const useFavoritePage = () => {
    const context = useContext(FavoritePageContext);
    if (!context) {
        throw new Error('useFavoritePage must be used within FavoritePageProvider');
    }
    return context;
};