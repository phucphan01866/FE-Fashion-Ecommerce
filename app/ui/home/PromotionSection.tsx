'use client'

import { useState, useEffect } from "react"
import { Promotion } from "@/service/promotion.service"
import Image from "next/image"
import { PromotionHomeItem } from "@/service/promotion.service"
import { useNotificateArea } from "@/context/NotificateAreaContext"
import { userPromotionService } from "@/service/promotion.service"

export default function PromotionSection() {
    const { setNotification } = useNotificateArea();
    const [promotions, setPromotions] = useState<PromotionHomeItem[] | null>(null);
    const [slideNumber, setSlideNumber] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const numberPerSlide = 3;

    async function fetchPromotions() {
        try {
            const response = await userPromotionService.fetchHomePromotions();
            // console.table(response);
            setPromotions(response);
            setSlideNumber(Math.ceil(response.length / numberPerSlide));
        } catch (error) {
            setNotification(error instanceof Error ? error.message : 'Lỗi không lấy được mã giảm giá');
        }
    }
    useEffect(() => {
        fetchPromotions();
    }, []);

    function handleChangeSlide(direction: 'next' | 'prev') {
        if (direction === 'next') {
            setCurrentSlide((prev) => (prev + 1) % slideNumber);
        } else {
            setCurrentSlide((prev) => (prev - 1 + slideNumber) % slideNumber);
        }
    }
    if (!promotions || promotions.length === 0) {
        return null;
    } else
    return <div className="container my-12 flex flex-col gap-3">
        <h2 className="fontA1 text-center">MÃ GIẢM GIÁ MỚI NHẤT</h2>
        <div className="flex gap-2">
            <button onClick={() => handleChangeSlide('prev')} className="p-2 bg-white border-2 border-orange-200 rounded-full group hover:bg-orange-500 transition-all duration-200 ease-in-out">
                <Image src="/icon/chevron_down.svg" alt="Previous" width={24} height={24} className="rotate-90 group-hover:brightness-[200] transition-all duration-75 ease-in-out" />
            </button>
            <div className="flex-1 grid grid-cols-3 gap-4">
                {promotions && promotions.length > 0 && promotions.map((promotion, index) =>
                    (numberPerSlide * currentSlide <= index && index < numberPerSlide * (currentSlide + 1)) ? (
                        <Voucher key={promotion.id} data={promotion} onCollectDone={fetchPromotions} />
                    ) : null
                )}
            </div>
            <button onClick={() => handleChangeSlide('prev')} className="p-2 bg-white border-2 border-orange-200 rounded-full group hover:bg-orange-500 transition-all duration-200 ease-in-out">
                <Image src="/icon/chevron_down.svg" alt="Previous" width={24} height={24} className="rotate-270 group-hover:brightness-[200] transition-all duration-75 ease-in-out" />
            </button>
        </div   >
    </div>
}

export function Voucher({ data, onCollectDone }: { data: PromotionHomeItem, onCollectDone: () => void }) {
    const { setNotification } = useNotificateArea();
    const isActive = true;
    const iconSize = 24;
    const [isTooltipHovered, setIsTooltipHovered] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    function formattedValue(value: number) {
        if (value === null || value === undefined) return 'Error';
        if (value >= 1000000000) {
            const billions = value / 1000000000;
            return billions % 1 === 0 ? `${billions}tỉ` : `${billions}.${billions.toFixed(1)}tỉ`
        }
        if (value >= 1000000) {
            const millions = value / 1000000;
            return millions % 1 === 0 ? `${millions}tr` : `${millions}.${millions.toFixed(1)}tr`
        }
        if (value >= 1000) {
            const thousands = value / 1000;
            return thousands % 1 === 0 ? `${thousands}k` : `${thousands}.${thousands.toFixed(1)}k`
        }
        return `${Number(value).toLocaleString('vi-VN')}đ`;
    }
    const value = (data.type === "amount" ? formattedValue(Number(data.value)) : `${parseFloat(Number(data.value).toFixed(1))}%`)
    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    }

    async function handleCollectPromotion(promotionId: string) {
        try {
            if (data.collected) {
                throw new Error('Bạn đã nhận mã giảm giá này rồi');
            } else if (data.used_count === data.usage_limit) {
                throw new Error('Mã giảm giá đã hết lượt nhận');
            }
            const response = await userPromotionService.collectPromotion(promotionId, data.code);
            setNotification(response.message);
            onCollectDone();
        } catch (error) {
            setNotification(error instanceof Error ? error.message : 'Lỗi không thể nhận mã giảm giá');
        }
    }
    const colectedPercent = data.usage_limit && data.usage_limit > 0 ? Math.min(100, (data.used_count / data.usage_limit) * 100) : 0;

    return <div className={`flex-1 rounded-2xl border-3 grid grid-cols-[25%_1fr_15%] border-orange-200 bg-white`}>
        <div className={`flex flex-col border-r-2 bg-orange-400 rounded-l-xl ${isActive ? "border-orange-200" : "border-gray-200"}`}>
            <p className="flex items-center justify-center fontA1 !text-white px-6 py-4 w-full h-full">{value}</p>
        </div>
        <div className="px-4 py-2 flex flex-col gap-2">
            <div><p className="fontA2">{data.code}</p></div>
            <div className="flex justify-between">
                <div className="flex flex-col gap-2  w-full">
                    <p className="fontA5">{formatDate(data.start_date)} - {formatDate(data.end_date)}</p>
                    <div className="relative h-4 bg-gray-200 rounded-full"
                        style={{ width: '100%' }}
                        onMouseEnter={() => setIsTooltipHovered(true)}
                        onMouseLeave={() => setIsTooltipHovered(false)}>
                        <div className="h-4 bg-orange-400 rounded-full"
                            style={{ width: (100 - colectedPercent) + '%' }}>
                        </div>

                        {isTooltipHovered && <ToolTip><p>Còn lại {data.usage_limit - data.used_count} / {data.usage_limit}</p></ToolTip>}
                    </div>
                </div>
            </div>
        </div>

        <button onClick={() => handleCollectPromotion(data.id)} className="flex items-center justify-center m-1 hover:bg-stone-100 rounded-xl transition-all duration-75 ease-in-out">
            {data.collected ? (
                <Image src="/icon/checks.svg" alt="Collected" width={iconSize} height={iconSize} />
            ) : (
                <Image src="/icon/arrow-bar-to-down.svg" alt="Collect" width={iconSize} height={iconSize} />
            )}
        </button>

    </div>
}

function ToolTip({ children }: { children: React.ReactNode }) {
    return (
        <div className="
        absolute top-full mt-2 left-1/2 -translate-x-1/2 fontA6 bg-stone-800 text-white px-1.5 py-1 opacity-75 rounded-md pointer-events-none">{children}</div>
    )
}