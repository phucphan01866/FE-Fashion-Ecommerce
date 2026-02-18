'use client'

import { NewsProvider, useNews } from '@/context/NewsContext';
import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BasicLoadingSkeleton, { TextLoadingSkeleton, ContentLoadingSkeleton } from '@/app/ui/general/skeletons/LoadingSkeleton';
import { NewsPreviewData, NewsResponse } from '@/service/news.service';
import { useNotificateArea } from '@/context/NotificateAreaContext';
import { newsService } from '@/service/news.service';
import { useParams } from 'next/navigation';
import { formatDate } from '@/helper/formatDateHelper';
import Breadcrumb from '@/app/ui/general/Breadcrumb/Breadcrumb';
import track from '@/utils/track';

export default function page() {
    const params = useParams();
    const newsId = params.id as string;
    const [isLoading, setIsLoading] = useState(true);
    const [newsData, setNewsData] = useState<NewsResponse>();
    useEffect(() => {
        async function fetchData() {
            if (isLoading) try {
                const data = await newsService.user.getNewsById(newsId);
                setNewsData(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching news data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className='bg-white'>
            {newsData && isLoading === false ? (
                <article className="flex flex-col gap-6 mx-auto px-4 py-8"
                    style={{ maxWidth: 960 + 'px' }}>
                    <div className='flex flex-col gap-3'>
                        {/* Breadcrum */}
                        <Breadcrumb breadcrumbItems={[
                            { link: "/", text: "Trang chủ" },
                            { link: "/news", text: "Tin tức" },
                            { link: `/news/${newsData?.id}`, text: newsData?.title || '' }
                        ]} />
                        {/* Tiêu đề */}
                        <h1 className="fontA1 md:text-4xl font-bold text-gray-900 leading-tight">
                            {newsData?.title}
                        </h1>

                        {/* Thời gian */}
                        <div className="fontA5 text-gray-500 mb-3">
                            Đăng lúc: {formatDate(newsData?.created_at || "")}
                        </div>
                    </div>

                    {/* Ảnh thumbnail chính */}
                    {newsData?.image && (
                        <div className="relative mb-3 rounded-xl overflow-hidden shadow-lg"
                            style={{ width: 'full', height: 496 + 'px' }}
                        >
                            <Image
                                src={newsData.image || ""}
                                alt={newsData?.title || "Ảnh bài viết"}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Nội dung động - text và hình ảnh xen kẽ */}
                    <div className="prose prose-lg max-w-none">
                        {newsData?.content_blocks.map((block, index) => {
                            if (block.type === 'text') {
                                return (
                                    <div
                                        key={index}
                                        className="mb-6 text-gray-800 leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: block.text.replace(/\n/g, '<br />') }}
                                    />
                                );
                            }
                            if (block.type === 'image') {
                                return (
                                    <div key={index} className="my-12 -mx-4 md:mx-0" >
                                        <div className="relative mx-auto rounded-lg overflow-hidden shadow-xl"
                                            style={{ width: '100%', height: '496px' }}>
                                            <Image
                                                src={block.urls[0].url}
                                                alt={`Hình ảnh bài viết ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 80vw"
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>

                    {/* Hashtags (nếu có trong text cuối) sẽ tự hiển thị đẹp nhờ prose */}
                </article>

            ) : (
                <BasicLoadingSkeleton />
            )}
        </div>
    )
}