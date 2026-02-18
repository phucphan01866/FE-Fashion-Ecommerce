'use client'

import Link from "next/link";
import { Title, BaseUserPageLayout, Divider, VoidGeneralButton, GeneralButton } from "@/app/ui/user/general/general";
import { sectionCSS } from "@/app/ui/user/general/general";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { UserPromotionProvider, useUserPromotion } from "@/context/customer/PromotionContext";
import VoucherUser from "@/app/ui/promotion/voucherUser";
import { InputField } from "@/app/ui/general/Input/Input";
import { useState } from "react";
import { userPromotionService } from "@/service/promotion.service";

export default function Page() {
    return (
        <UserPromotionProvider>
            <BaseUserPageLayout>
                <Title additionalCSS="flex items-center justify-between">
                    <p>Quản lý mã giảm giá</p>
                    <VoidGeneralButton />
                </Title>
                <div className={`AdminProductPage grid grid-cols-[1fr] gap-4`}>
                    <PromotionList />
                </div>
            </BaseUserPageLayout>
        </UserPromotionProvider>
    );
}

export function PromotionList() {
    return (
        <div className={`CategoryTable ${sectionCSS} flex-1 flex flex-col gap-4`}>
            <InputPromotionArea />
            <Divider />
            <TableArea />
        </div>
    )
}
function InputPromotionArea() {
    const [inputPromoCode, setInputPromoCode] = useState<string>("");
    const [inputError, setInputError] = useState<string>("");
    const setNoti = useNotificateArea().setNotification;
    const { fetchUserPromotions } = useUserPromotion();

    async function validateAndSavePromocode() {
        if (inputPromoCode.trim().length === 0) {
            setInputError("Mã giảm giá không được để trống");
            return;
        } else if (inputPromoCode.length < 3 || inputPromoCode.length > 20) {
            setInputError("Mã giảm giá phải có từ 3 đến 20 ký tự");
            return;
        }
        try {
            const result = await userPromotionService.checkPromotionCodeAndSave(inputPromoCode.trim(), 99999999);
            if (result.valid !== true) {
                throw new Error(result.message || "Mã giảm giá không hợp lệ");
            }
            setInputPromoCode("");
            setInputError(result);
            setNoti("Lưu mã giảm giá thành công");
            await fetchUserPromotions();
        } catch (error) {
            setInputError(error instanceof Error ? error.message : "Lỗi không xác định");
        }
    }


    return (
        <div className={`flex gap-3 items-center`}>
            <InputField
                id="promoCode"
                placeholder="Nhập mã giảm giá"
                bonusCSS="!w-auto"
                inputBonusCSS=""
                value={inputPromoCode}
                onChange={(e) => {
                    setInputPromoCode(e.target.value);
                    setInputError("");
                }}
            />
            <button type="button" onClick={validateAndSavePromocode} className="h-full cursor-pointer px-4 flex items-center rounded-md bg-orange-500 fontA4 text-white !font-normal hover:bg-orange-600 transition-all duration-100 ease-in-out">Lưu</button>
            {inputError.length > 0 && <p className="text-red-500 fontA4 italic">{inputError}</p>}
        </div>
    )
}
function TableArea() {
    const { promotionList, hasMore, nextPage } = useUserPromotion();
    return (
        <div className={`TableArea flex flex-col gap-4`}>
            {
                promotionList.map((promotion, index) => (
                    <VoucherUser key={promotion.id} data={promotion} />
                ))
            }
            {
                promotionList.length === 0 && (
                    <div className="w-full py-10 flex flex-col items-center justify-center gap-4">
                        <p className="fontA4 text-gray-500">Tài khoản chưa lưu mã giảm giá nào</p>
                    </div>
                )
            }
            {hasMore && (
                <div className="w-full flex justify-center">
                    <button type="button" onClick={nextPage} className="cursor-pointer px-3 py-2 rounded-md bg-gray-200 fontA4 text-gray-700 hover:bg-orange-400 hover:text-white transition-all duration-100 ease-in-out">Xem thêm</button>
                </div>
            )}
        </div>
    )
}
