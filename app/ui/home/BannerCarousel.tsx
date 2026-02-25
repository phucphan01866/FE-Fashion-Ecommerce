'use client'
import Banner from "./Banner";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useHome } from "@/context/HomeContext";
export default function BannerCarousel() {
    const { categoriesProducts } = useHome();
    const defaultBanner = {
        src: "/banner/main_banner.jpg",
        id: "/",
    }
    const bannerList = [
        defaultBanner,
        ...categoriesProducts
            .filter(cat => cat.image)
            .map(cat => ({ src: cat.image, id: cat.id }))
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const goToPrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + bannerList.length) % bannerList.length);
    }
    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerList.length);
    }

    const arrowCSS = "z-10 absolute top-1/2 -translate-y-1/2 text-4xl p-3 rounded-full bg-gray-100 transition-all duration-300 ease-in-out hover:scale-110 active:scale-110";
    const arrowOffset = "3.5rem"
    return (
        <div className="relative">
            <div className={`relative h-[520px] w-[100%] overflow-hidden`}>
                {bannerList.map((banner, index) => {
                    return (
                        <Banner
                            key={index}
                            data={banner}
                            currentIndex={currentIndex}
                            thisBannerIndex={index}
                        ></Banner>
                    );
                })}
            </div>
            <button className={`${arrowCSS} ${bannerList.length===1 && 'opacity-50'} left-[3.5rem] `} onClick={goToPrev}>
                <Image src="/icon/chevron_down.svg" alt="Arrow left" width={24} height={24} className={`rotate-90`} />
            </button>
            <button className={`${arrowCSS} ${bannerList.length===1 && 'opacity-50'} right-[3.5rem]`} onClick={goToNext}>
                <Image src="/icon/chevron_down.svg" alt="Arrow left" width={24} height={24} className="rotate-270" />
            </button>
        </div >
    )
}



//     const bannerData = [{
//         imageSrc: "/image/banner_1.png",
//         title: "Welcome to Our Store",
//         subtitle: "Find the best products here",
//         buttonText: "Shop Now"
//     }, {
//         imageSrc: "/image/banner_2.png",
//         title: "Welcome to Our Store 2",
//         subtitle: "Find the best products here",
//         buttonText: "Shop Now"
//     }, {
//         imageSrc: "/image/banner_1.png",
//         title: "Welcome to Our Store 3",
//         subtitle: "Find the best products here",
//         buttonText: "Shop Now"
//     }];
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const goToPrev = () => {
//         setCurrentIndex((prevIndex) => (prevIndex - 1 + bannerData.length) % bannerData.length);
//     }
//     const goToNext = () => {
//         setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerData.length);
//     }

//     const arrowCSS = "z-10 absolute top-1/2 -translate-y-1/2 text-4xl p-3 rounded-full bg-gray-100";
//     const arrowOffset = "3.5rem"
//     return (
//         <div className="relative">
//             <div className={`relative h-[520px] w-[100%] overflow-hidden`}>
//                 {bannerData.map((banner, index) => {
//                     return (
//                         <Banner
//                             key={index}
//                             data={banner}
//                             currentIndex={currentIndex}
//                             thisBannerIndex={index}
//                         ></Banner>
//                     );
//                 })}
//             </div>
//             <button className={`${arrowCSS} left-[3.5rem]`} onClick={goToPrev}>
//                 <Image src="/icon/chevron_down.svg" alt="Arrow left" width={24} height={24} className="rotate-90" />
//             </button>
//             <button className={`${arrowCSS} right-[3.5rem]`} onClick={goToNext}>
//                 <Image src="/icon/chevron_down.svg" alt="Arrow left" width={24} height={24} className="rotate-270" />
//             </button>
//         </div >
//     )
// }