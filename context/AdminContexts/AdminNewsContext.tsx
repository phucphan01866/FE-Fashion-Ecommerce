'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { useNotificateArea } from "../NotificateAreaContext";
import { newsService, NewsPreviewData } from "@/service/news.service";


interface NewsContextType {
    news: NewsPreviewData[] | undefined;
    setNews: (news: NewsPreviewData[]) => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: React.ReactNode }) {
    const { setNotification } = useNotificateArea();

    const [news, setNews] = useState<NewsPreviewData[]>();
    async function fetchNewsData() {
        try {
            const data = await newsService.user.getNewsList();
            console.log(data);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi tải danh sách tin tức.');
        }
    }

    useEffect(() => {
        fetchNewsData();
    }, []);

    return (
        <NewsContext.Provider value={{ news, setNews }}>
            {children}
        </NewsContext.Provider>
    );
}

export const useNews = () => {
    const context = useContext(NewsContext);
    if (!context) {
        throw new Error('useNews must be used within NewsProvider');
    }
    return context;
};