'use client'

import { Title, BaseUserPageLayout, Divider, GeneralButton, Pagination } from "@/app/ui/user/general/general";
import { sectionCSS } from "@/app/ui/user/general/general";
import { AdminPromotionProvider, useAdminPromotion } from "@/context/AdminContexts/AdminPromotionContext";
import Voucher from "@/app/ui/promotion/voucher";

export default function Page() {
    return (
        <AdminPromotionProvider>
            <BaseUserPageLayout>
                <Title additionalCSS="flex items-center justify-between">
                    <p>Quản lý mã giảm giá</p>
                    <GeneralButton href="promotion/create">+ Thêm mã giảm giá mới</GeneralButton>
                    {/* <Link className="cursor-pointer px-3 py-3 rounded-md bg-orange-500 hover:bg-orange-400 fontA4 text-white" href={`promotion/create`}>Thêm mã giảm giá mới</Link> */}
                </Title>
                <div className={`AdminProductPage grid grid-cols-[1fr] gap-4`}>
                    <PromotionList />
                </div>
            </BaseUserPageLayout>
        </AdminPromotionProvider>
    );
}

export function PromotionList() {
    return (
        <div className={`CategoryTable ${sectionCSS} flex-1 flex flex-col gap-4`}>
            <TableArea />
        </div>
    )
}
function FilterArea() {
    return (
        <div className={`FilterArea`}>
            Filter Area
        </div>
    )
}
function TableArea() {
    const { promotionList , pagination, loadPage} = useAdminPromotion();
    return (
        <div className={`TableArea flex flex-col gap-4`}>
            {promotionList.length > 0 ? promotionList.map((promotion, index) => (
                <Voucher key={promotion.id} data={promotion} />
            ))
                : <div className="px-6 py-12 text-center text-gray-500 fontA4">Hiện chưa có mã giảm giá nào</div>
            }
            <Pagination current={pagination.page} total={pagination.totalPages} onPageChange={(page) => { loadPage(page) }} /> 
        </div>
    )
}
