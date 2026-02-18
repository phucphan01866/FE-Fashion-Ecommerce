'use client'

import { useHome } from "@/context/HomeContext"
import { useState, useEffect } from "react"
import { TopBrand } from "@/context/HomeContext"
import Image from "next/image";
import { Divider } from "../cart/General";
import Link from "next/link";


export function TopBrandsSection() {
    const brandList = useHome().topBrands;
    const [hoverOn, setHoverOn] = useState<number>(1);
    return (
        <div className="py-8 bg-gray-100">
            <h2 className="fontA1 text-center">THƯƠNG HIỆU NỔI BẬT</h2>
            {brandList.length > 0 && brandList.length <= 3 && (
                <div className="mx-auto flex gap-12 justify-center-safe pt-8">
                    <BrandCard brand={brandList[0]} place={3} isHoverOn={hoverOn === 3} onHover={() => setHoverOn(3)} onUnHover={() => setHoverOn(1)} />
                    <DividerLine />
                    <BrandCard brand={brandList[2]} place={1} isHoverOn={hoverOn === 1} onHover={() => setHoverOn(1)} onUnHover={() => setHoverOn(1)} />
                    <DividerLine />
                    <BrandCard brand={brandList[1]} place={2} isHoverOn={hoverOn === 2} onHover={() => setHoverOn(2)} onUnHover={() => setHoverOn(1)} />
                </div>
            )}
        </div>
    )
}

function BrandCard({ brand, place, isHoverOn, onHover, onUnHover }: { brand: TopBrand, place: number, isHoverOn: boolean, onHover: () => void, onUnHover: () => void }) {
    // const imgSize = isHoverOn ? 200 : 160;
    const imgSize = 160;
    return (
        <Link
            href={`/product?supplier_id=${encodeURI(brand.brand_id)}`}
            onMouseEnter={onHover}
            onMouseLeave={onUnHover}
            className={`p-6 flex flex-col ${isHoverOn ? "gap-1" : "gap-1"} justify-end-safe items-center-safe w-fit shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out rounded-md
            ${isHoverOn ? "scale-105" : ""}`}>
            <Image
                className={`rounded-md transition-transform duration-500 ease-in-out ${isHoverOn ? "scale-110 rounded-2xl" : ""}`}
                src={brand.brand_logo || '/images/brand-placeholder.png'} alt={brand.brand_name} width={imgSize} height={imgSize} />
            <p className={`transition-all duration-300 ease-in-out leading-tight! mt-3 ${isHoverOn ? "fontA2 font-bold!" : "fontA3"}`}>{brand.brand_name}</p>
            <p className={`transition-all duration-300 ease-in-out leading-tight! ${isHoverOn ? "fontA5 font-medium!" : "fontA5"}`}>Đã hoàn thành {brand.orders_count} đơn hàng</p>
            <p className={`transition-all duration-300 ease-in-out leading-tight! ${isHoverOn ? "fontA5 font-medium!" : "fontA5"}`}>Bán được {brand.total_sold} sản phẩm</p>
        </Link>
    )
}
function DividerLine() {
    return (
        <div className="Divider block relative w-0 h-auto border-1 border-gray-300 my-6">
        </div>
    )
}