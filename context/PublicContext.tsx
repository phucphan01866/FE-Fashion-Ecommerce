'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { useNotificateArea } from "./NotificateAreaContext";
import HomeService from "@/service/public.service";


interface PublicData {
    categories: any[];
    brands: any[];
}

interface PublicContextType {
    publicData: PublicData | undefined;
}

const PublicContext = createContext<PublicContextType | undefined>(undefined);

export function PublicProvider({ children }: { children: React.ReactNode }) {
    const { setNotification } = useNotificateArea();
    const [publicData, setPublicData] = useState<PublicData>();

    async function fetchPublicData() {
        try {
            const response = await HomeService.fetchMetaData();
            setPublicData(response);
            // console.log('Fetched public data: ', response);
        } catch (error) {
            setNotification('Lỗi khi tải dữ liệu công khai');
        }
    }

    useEffect(() => {
        fetchPublicData();
    }, []);

    return (
        <PublicContext.Provider value={{ publicData }}>
            {children}
        </PublicContext.Provider>
    );
}

export const usePublic = () => {
    const context = useContext(PublicContext);
    if (!context) {
        throw new Error('usePublic must be used within PublicProvider');
    }
    return context;
};