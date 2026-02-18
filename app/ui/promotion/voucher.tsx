'use client'

import { useState, useEffect } from "react"
import { Promotion } from "@/service/promotion.service"
import Image from "next/image"
import { adminPromotionService } from "@/service/promotion.service"
import { useNotificateArea } from "@/context/NotificateAreaContext"
import { useAdminPromotion } from "@/context/AdminContexts/AdminPromotionContext"
import Link from "next/link"
import { InputToggle } from "../general/Input/Input"

export default function Voucher({ data }: { data: Promotion }) {
    const { setNotification } = useNotificateArea();
    const [isActive, setIsActive] = useState<boolean>(data.status === "active");

    async function toggleVoucherStatus() {
        try {
            const result = await adminPromotionService.updatePromotionStatus(data.id, isActive ? "inactive" : "active");
            setNotification(result);
            setIsActive(!isActive);
        } catch (err) {
            setNotification((err instanceof Error ? err.message : "Lỗi"));
        }
    }


    return <div className="grid grid-cols-[55%_1fr] gap-4">
        <Voucher1 data={data} isActive={isActive} toggleActive={() => toggleVoucherStatus()} />
        <Voucher2 data={data} isActive={isActive} />
    </div>
}

export function Voucher1({ data, isActive, toggleActive }: { data: Promotion, isActive: boolean, toggleActive: () => void }) {
    const iconSize = 16;
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
    const value = (data.type === "amount" ? formattedValue(data.value) : `${parseFloat(Number(data.value).toFixed(1))}%`)
    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    }
    const { setNotification } = useNotificateArea();

    const { fetchPromotions } = useAdminPromotion();
    async function removPromotion() {
        try {
            if (confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) {
                setNotification(await adminPromotionService.removePromotion(data.id));
                await fetchPromotions();
            }
        } catch (err) {
            setNotification(err instanceof Error ? err.message : "");
        }
    }

    return <div className={`rounded-md border-3 grid grid-cols-[25%_1fr] ${isActive ? "border-orange-200" : "border-gray-200"}`}>
        <div className={`flex flex-col border-r-2 ${isActive ? "border-orange-200" : "border-gray-200"}`}>
            <div className="flex-1 flex justify-center items-center px-6 py-4 ">
                <p className="text-4xl font-semibold">{value}</p>
            </div>
            <div className={`p-1 rounded-bl-sm text-white ${isActive ? "bg-orange-400" : "bg-gray-300"}`}>
                <p className="fontA5 text-center">{data.code}</p>
            </div>
        </div>
        <div className="px-4 py-2 flex flex-col gap-2 justify-center">
            <div><p className="fontA2">{data.name}</p></div>
            <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                    <p className="fontA5">{formatDate(data.start_date)} - {formatDate(data.end_date)}</p>
                    <p className="fontA5">Số lượng còn : {Number(data.usage_limit) - Number(data.used_count)} / {data.usage_limit} lượt sử dụng</p>
                </div>
                <div className="flex items-end gap-2">
                    <button onClick={removPromotion} className="p-0.75 hover:bg-gray-200 rounded-md cursor-pointer"><Image src="/icon/trash-x-filled.svg" width={iconSize} height={iconSize} alt="delete" /></button>
                    <Link href={`promotion/edit/${data.id}`} className="p-0.75 hover:bg-gray-200 rounded-md cursor-pointer"><Image src="/icon/edit.svg" width={iconSize} height={iconSize} alt="edit" /></Link>
                    {/* <ToggleButton isActive={isActive} toggleActive={toggleActive} /> */}
                    <InputToggle value={isActive} onChange={toggleActive} toggleOnly={true} />
                </div>
            </div>
        </div>
    </div>
}
export function Voucher2({ data, isActive }: { data: Promotion, isActive: boolean }) {
    return (
        <div className={`rounded-sm border-3 px-4 py-2 flex flex-col justify-center gap-2 overflow-hidden ${isActive ? "border-orange-200" : "border-gray-200"}`}>
            <p className="line-clamp-2 fontA3 text-ellipsis">
                {data.description}
            </p>
            <p className="fontA5">Tối thiểu cần đặt: {data.min_order_value ? `${Number(data.min_order_value).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}đ` : "Không có"} </p>
            <p className="fontA5">Tối đa giảm: {data.max_discount_value ? `${Number(data.max_discount_value).toLocaleString('vi-VN')}đ` : "Không có"} </p>
        </div>)
}