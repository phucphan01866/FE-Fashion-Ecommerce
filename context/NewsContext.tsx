'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { useNotificateArea } from "./NotificateAreaContext";
import { newsService, NewsPreviewData } from "@/service/news.service";


interface NewsContextType {
    newsList: NewsPreviewData[] | undefined;
    setNewsList: (news: NewsPreviewData[]) => void;
    isLoading: boolean;
    isMaxListReached: boolean;
    currentPage: number;
    fetchMoreNewsData: (page: number) => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: React.ReactNode }) {
    const { setNotification } = useNotificateArea();

    const [newsList, setNewsList] = useState<NewsPreviewData[]>();
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isMaxListReached, setIsMaxListReached] = useState(false);

    const perFetch = 20;
    async function fetchNewsData() {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const data = await newsService.user.getNewsList(currentPage, perFetch); //page = 1, limit = 20
            setNewsList(data.items);
            if (data.items.length <= data.perPage) {
                setIsMaxListReached(true);
            }
            setIsLoading(false);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi tải danh sách tin tức.');
        }
    }

    async function fetchMoreNewsData(page: number) {
        setIsLoading(true);
        try {
            if (isMaxListReached) {
                setNotification('Đã tải hết tin tức.');
                return;
            }
            const data = await newsService.user.getNewsList(page, perFetch); //input = page + 1, limit = 20
            if (data.items.length < perFetch) {
                setIsMaxListReached(true);
            }
            setCurrentPage(page);
            setNewsList(prevNews => prevNews ? [...prevNews, ...data.items] : data.items);
            setIsLoading(false);
            console.log('fetch more: ', data);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi tải thêm tin tức.');
        }
    }

    useEffect(() => {
        fetchNewsData();
    }, []);

    return (
        <NewsContext.Provider value={{
            newsList,
            setNewsList,
            isLoading,
            isMaxListReached,
            currentPage,
            fetchMoreNewsData,
        }}>
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