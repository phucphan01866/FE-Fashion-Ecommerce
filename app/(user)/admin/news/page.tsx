'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Title, BaseUserPageLayout, GeneralButton, SeeMoreButton } from "@/app/ui/user/general/general";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { newsService, NewsResponse } from "@/service/news.service";

interface NewsListData {
    success: boolean;
    items: NewsResponse[];
    page: number;
    perPage: number;
}

export default function AdminNewsPage() {
    const { setNotification } = useNotificateArea();
    const [newsListData, setNewsListData] = useState<NewsListData | null>(null);
    const [nextPageData, setNextPageData] = useState<NewsListData | null>(null);
    const [loading, setLoading] = useState(true);
    const loadMore = async () => {
        if (!nextPageData || nextPageData.items.length === 0) return;
        setNewsListData(prev => {
            return {
                ...prev!,
                items: [...prev!.items, ...nextPageData.items],
                page: nextPageData.page,
            };
        });
        try {
            setLoading(true);
            const data = await newsService.admin.getNewsList(nextPageData.page + 1);
            setNextPageData(data);
        } catch (error) {
            setNotification("Bổ sung danh sách tin tức thất bại");
        } finally {
            setLoading(false);
        }
    }

    async function fetchNewsList() {
        try {
            setLoading(true);
            const data = await newsService.admin.getNewsList();
            const nextData = await newsService.admin.getNewsList(2);
            setNewsListData(data);
            setNextPageData(nextData);
        } catch (error) {
            setNotification("Lấy danh sách tin tức thất bại");
        } finally {
            setLoading(false);
        }
    }

    async function deleteNews(newsId: string) {
        try {
            await newsService.admin.deleteNews(newsId);
            setNotification("Xóa tin tức thành công");
            fetchNewsList();
        } catch (error) {
            setNotification("Xóa tin tức thất bại");
        }
    }

    useEffect(() => {
        fetchNewsList();
    }, []);

    return (
        <BaseUserPageLayout>
            <Title>
                <p className="fontA2">Quản lý tin tức</p>
                <GeneralButton href="/admin/news/create">+ Thêm tin tức mới</GeneralButton>
            </Title>

            {/* Bảng tin tức */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-center fontA5 text-gray-700 uppercase tracking-wider">STT</th>
                                <th className="px-6 py-4 text-center fontA5 text-gray-700 uppercase tracking-wider">Tiêu đề</th>
                                <th className="px-6 py-4 text-center fontA5 text-gray-700 uppercase tracking-wider">Ảnh đại diện</th>
                                <th className="px-6 py-4 text-center fontA5 text-gray-700 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-4 text-center fontA5 text-gray-700 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : !newsListData || newsListData.items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Chưa có tin tức nào
                                    </td>
                                </tr>
                            ) : (
                                newsListData.items.map((news, index) => (
                                    <tr key={news.id} className="hover:bg-gray-50 transition">
                                        {/* STT */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                            {index + 1}
                                        </td>

                                        {/* Tiêu đề */}
                                        <td className="px-6 py-4 text-sm text-gray-900 text-center max-w-md">
                                            <div className="line-clamp-2 font-medium">{news.title}</div>
                                        </td>

                                        {/* Ảnh đại diện */}
                                        <td className="px-6 py-4">
                                            {news.image ? (
                                                <div className="relative w-24 h-16 rounded-lg overflow-hidden border mx-auto border-gray-200">
                                                    <Image
                                                        src={news.image}
                                                        alt={news.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center">
                                                    <span className="text-xs text-gray-400">No img</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Ngày tạo */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                                            {new Date(news.created_at).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>

                                        {/* Nút hành động */}
                                        <td className="px-6 py-4 text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link
                                                    href={`/admin/news/edit/${news.id}`}
                                                    className="text-gray-700 hover:text-orange-500 font-medium transition"
                                                >
                                                    Sửa
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Bạn có chắc muốn xóa tin tức này?")) {
                                                            deleteNews(news.id);
                                                        }
                                                    }}
                                                    className="text-gray-700 hover:text-orange-500 cursor-pointer font-medium transition"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {nextPageData && nextPageData.items.length > 0 && (
                        <div className="pb-4 flex justify-center">
                            <SeeMoreButton onClick={loadMore}>Xem thêm</SeeMoreButton>
                        </div>
                    )}
                </div>
            </div>
        </BaseUserPageLayout>
    );
}