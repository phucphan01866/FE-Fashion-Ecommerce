'use client'

import { BaseUserPageLayout } from "@/app/ui/user/general/general";
import { AdminCategoryProvider } from "@/context/AdminContexts/AdminCategoryContext";
import { AdminSupplierProvider } from "@/context/AdminContexts/AdminSupplierContext";
import { PromotionForm } from "@/app/ui/user/admin/promotion/PromotionForm";
import { useEffect, useState } from "react";
import { PromotionFormData } from "@/service/promotion.service";
import BasicLoadingSkeleton from "@/app/ui/general/skeletons/LoadingSkeleton";
import { adminPromotionService } from "@/service/promotion.service";
import { useParams } from "next/navigation";


export default function Page() {
    const params = useParams();
    const promotionId = params.id as string;
    const [oldPromotionData, setOldPromotionData] = useState<PromotionFormData>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchOldPromotion() {
            const oldData: PromotionFormData = await adminPromotionService.getPromotion(promotionId);
            setOldPromotionData(oldData);
            console.log('real: ,', oldData);
        }
        fetchOldPromotion();
        setLoading(false);
    }, [])
    if (loading) return <BasicLoadingSkeleton />
    return (
        <AdminCategoryProvider>
            <AdminSupplierProvider>
                <BaseUserPageLayout>
                    <PromotionForm oldData={oldPromotionData} />
                </BaseUserPageLayout>
            </AdminSupplierProvider>
        </AdminCategoryProvider>
    );
}