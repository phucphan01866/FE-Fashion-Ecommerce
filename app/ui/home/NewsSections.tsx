'use client';

import { useDragScroll } from "@/hooks";
import { NewsPreviewData } from "@/service/news.service";
import { useNews, NewsProvider } from "@/context/NewsContext";
import Link from "next/link";
import Image from "next/image";

export default function NewsSection() {
    return (
        <NewsProvider>
            <PreviewNewsSection />
        </NewsProvider>
    )
}

function PreviewNewsSection() {
    const dragScrollRef = useDragScroll();
    const { newsList } = useNews();
    if (!newsList || newsList.length === 0) {
        return null
    } else return (
        <div className="container my-12 bg-white p-6 rounded-md shadow-md flex flex-col gap-6">
            <h1 className="font-bold text-3xl text-center w-fit m-auto relative uppercase
            after:content-[''] after:block after:w-1/2 after:h-[3px] after:bg-[rgb(53,64,82)] after:mx-auto after:mt-2 hover:after:w-full after:transition-all after:duration-400">Tin tức mới nhất</h1>
            <div
                className={`gap-3 overflow-x-hidden flex select-none backdrop-opacity-50`}
                ref={dragScrollRef}
            >
                {newsList && newsList.length > 0 && newsList.map((newsData, index) => (
                    <NewsBlock key={newsData.id} news={newsData} />
                ))}
            </div>
            <Link href={'news?page=1'} className="w-fit mx-auto cursor-pointer px-2.5 py-1 rounded-md bg-white hover:bg-orange-500 border-2 border-orange-500 text-orange-500 hover:text-white hover:scale-105 transition-all duration-300">Xem tất cả tin tức</Link>
        </div>
    )
}

export function NewsBlock({ news }: { news: NewsPreviewData }) {
    const iconSize = 20;
    const imgSize = {
        width: 280,
        height: 160,
    }
    const url = `/news/${news.id}`;
    return (
        <div className={`mb-3 relative flex-shrink-0 grid gap-2 px-2 py-6 shadow-md hover:shadow-lg transition-shadow rounded-md`}>
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
            <div className={`grid grid-cols-[1fr_auto] p-1 font-medium 
               gap-2`}>
                <Link href={`${url}`} className={`[user-drag:none] [-webkit-user-drag:none]}`} >
                    <h2 className={`text-center col-start-1 capitalize line-clamp-2 max-w-[25ch]`}>
                        {news.title}
                    </h2>
                </Link>
            </div>
        </div>
    );
}
