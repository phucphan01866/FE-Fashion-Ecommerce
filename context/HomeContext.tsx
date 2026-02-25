'use client'

import { useContext, createContext, useState, useEffect } from "react";
import HomeService from "@/service/public.service";
import { useNotificateArea } from "./NotificateAreaContext";
import { TypeProduct } from "@/service/product.service";
import { newsService } from "@/service/news.service";

export interface HomeCategory {
    id: string;
    image: string;
    name: string;
    children?: HomeCategory[];
    products?: TypeProduct[];
}

export interface HomeContextType {
    newsestProducts: { items: TypeProduct[], total: number };
    flashSaleProducts: { items: TypeProduct[], total: number };
    categoriesProducts: HomeCategory[];
    isProductsLoading: boolean;
    topBrands: TopBrand[];
}

export interface TopBrand {
    quarter: string;
    brand_id: string;
    brand_name: string;
    brand_logo?: string;
    revenue: number;
    total_sold: number;
    orders_count: number;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children, data }: { children: React.ReactNode, data: any }) {
    const { setNotification } = useNotificateArea();
    // const [newsestProducts, setNewestProducts] = useState<{ items: TypeProduct[], total: number }>({ items: [], total: 0 });
    // const [flashSaleProducts, setFlashSaleProducts] = useState<{ items: TypeProduct[], total: number }>({ items: [], total: 0 });
    // const [categoriesProducts, setCategoriesProducts] = useState<HomeCategory[]>([]);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    // const [topBrands, setTopBrands] = useState<TopBrand[]>([]);

    const newsestProducts = {
        items: data?.newest?.items || [],
        total: data?.newest?.total || 0
    };
    const flashSaleProducts = {
        items: data?.flashSales?.items || [],
        total: data?.flashSales?.total || 0,
    };
    const categoriesProducts = data?.categories || [];
    const topBrands = data?.topBrands || [];
    // console.log('HomeContext data:', { newsestProducts, flashSaleProducts, categoriesProducts, topBrands });

    // async function fetchHomeData() {
    //     // try {
    //     //     const data = await HomeService.fetchHomeProducts();
    //     //     const topBrandsData = await HomeService.fetchTopBrands();
    //     //     setTopBrands(topBrandsData.data);
    //     //     setNewestProducts(data.newest);
    //     //     setFlashSaleProducts(data.flashSales);
    //     //     setCategoriesProducts(data.categories);
    //     //     setIsProductsLoading(false);
    //     // } catch (error) {
    //     //     setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi tải dữ liệu trang chủ.');
    //     // }
    // }
    // useEffect(() => {
    //     fetchHomeData();
    //     // fetchNewsData();
    // }, []);

    return (
        <HomeContext.Provider value={{ newsestProducts, flashSaleProducts, categoriesProducts, isProductsLoading, topBrands }}>
            {children}
        </HomeContext.Provider>
    );
}

export const useHome = () => {
    const context = useContext(HomeContext);
    if (!context) {
        throw new Error('useHome must be used within HomeProvider');
    }
    return context;
};