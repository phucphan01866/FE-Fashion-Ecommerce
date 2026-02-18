'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { useNotificateArea } from "./NotificateAreaContext";
import { favoriteService } from "@/service/favorite.service";
import { useAuth } from "./AuthContext";

interface FavoriteContextType {
    favoriteIdsList: string[];
    isLoadFavorite?: boolean;
    toggleFavoriteState?: (prodId: string) => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
    const [favoriteIdsList, setFavoriteIdsList] = useState<string[]>([]);
    const { setNotification } = useNotificateArea();
    const [isLoadFavorite, setIsLoadFavorite] = useState<boolean>(true);
    const { user } = useAuth();

    async function fetchFavoriteData() {
        if (!user || user?.role === 'admin') return;
        try {
            const ids = await favoriteService.getListIdsFavorite();
            // console.log('Fetched favorite IDs:', ids);
            setFavoriteIdsList(ids);
        } catch (error) {
            setNotification(error instanceof Error ? error.message : 'Lỗi khi tải dữ liệu yêu thích');
        } finally {
            setIsLoadFavorite(false);
        }
    }

    async function toggleFavoriteState(prodId: string) {
        try {
            console.log("Toggling favorite state for product ID:", prodId);
            // setIsLoadFavorite(true);
            if (favoriteIdsList.includes(prodId)) {
                await favoriteService.removeFavorite(prodId);
            } else {
                await favoriteService.addFavorite(prodId);
            }
            fetchFavoriteData();
            setNotification("Cập nhật trạng thái yêu thích thành công");
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : "Cập nhật trạng thái yêu thích thất bại");
        } 
    }

    useEffect(() => {
        fetchFavoriteData();
    }, [user]);

    return (
        <FavoriteContext.Provider value={{
            favoriteIdsList,
            isLoadFavorite,
            toggleFavoriteState,
        }}>
            {children}
        </FavoriteContext.Provider>
    );
}

export const useFavorite = () => {
    const context = useContext(FavoriteContext);
    if (!context) {
        throw new Error('useFavorite must be used within FavoriteProvider');
    }
    return context;
};