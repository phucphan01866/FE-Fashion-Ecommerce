'use client'

import { NewsProvider, useNews } from '@/context/NewsContext';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BasicLoadingSkeleton, { TextLoadingSkeleton, ContentLoadingSkeleton } from '@/app/ui/general/skeletons/LoadingSkeleton';
import { NewsPreviewData } from '@/service/news.service';
import { useNotificateArea } from '@/context/NotificateAreaContext';
import Breadcrumb from '@/app/ui/general/Breadcrumb/Breadcrumb';

export default function page() {
    return (
        <NewsProvider>
            <Layout />
        </NewsProvider>
    );
}

function Layout() {
    const { setNotification } = useNotificateArea();
    const { newsList, isLoading, fetchMoreNewsData, isMaxListReached, currentPage } = useNews();
    async function handleLoadMore() {
        if (isMaxListReached) {
            setNotification('Đã tải hết tin tức.');
            return;
        };
        await fetchMoreNewsData(currentPage + 1);
    }
    if ((!newsList || newsList.length === 0) && isLoading) return <TextLoadingSkeleton />;
    else return (
        <div className='bg-white py-6'>
            <div className='container'>
                <div className='p-4'>
                    <Breadcrumb breadcrumbItems={[
                        { link: "/", text: "Trang chủ" },
                        { link: "/news", text: "Tin tức" }
                    ]} />
                </div>

                <h1 className='fontA1 font-bold! text-center m-auto relative uppercase w-[80%]! my-3'>Tin tức mới nhất</h1>
                <div className='flex flex-col gap-4 bg-white p-4 rounded-xl w-[80%]!'>
                    {newsList && newsList.length > 0 ? newsList.map((newsData, index) => (
                        <NewsItem key={newsData.id} news={newsData} />
                    )) : <p className='text-center'>Chưa có tin tức nào.</p>}
                </div>
                {
                    !isMaxListReached ? (
                        <button type='button' onClick={handleLoadMore} className='block cursor-pointer py-2 mx-auto px-3 fontA4 font-light text-white opacity-25 hover:opacity-95 rounded-md bg-orange-400'>{isLoading ? <ContentLoadingSkeleton /> : "Xem thêm"}</button>
                    ) : (
                        // <p className='fontA4 italic block mx-auto text-center text-gray-700 cursor-not-allowed'>Đã tải hết tin tức</p>
                        <></>
                    )
                }
            </div>
        </div>


    );
}

export function NewsItem({ news }: { news: NewsPreviewData }) {
    const iconSize = 20;
    const imgSize = {
        width: 280,
        height: 180,
    }
    const url = `/news/${news.id}`;
    return (
        <div className={`rounded-xl hover:bg-gray-100 transition-all relative grid grid-cols-[auto_1fr] gap-4 p-2 overflow-ellipsis`}>
            <Link href={`${url}`} className="relative object-cover [user-drag:none] [-webkit-user-drag:none]"
                style={{
                    width: imgSize?.width + "px",
                    height: imgSize?.height + "px"
                }}
            >
                <Image src={news.preview_image}
                    fill
                    alt=""
                    className={`d-block object-cover rounded-md`}></Image>
            </Link>
            <div className={`grid gap-2 p-1 content-start font-medium`}>
                <Link href={`${url}`} className={`[user-drag:none] [-webkit-user-drag:none]} fontA1 capitalize line-clamp-2 leading-normal!`} >
                    {news.title}
                </Link>
                <p className='fontA5 font-light text-gray-500'>Xuất bản vào {new Date(news.created_at).toLocaleDateString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })}
                </p>
                <p className='fontA4 font-light line-clamp-3'>
                    {news.preview_text}...
                </p>
            </div>
        </div>
    );
}