'use client'

import { Title, BaseUserPageLayout, VoidGeneralButton } from "@/app/ui/user/general/general";
import { AdminSupplierProvider } from "@/context/AdminContexts/AdminSupplierContext";
import SupplierList from "@/app/ui/user/admin/supplier/SupplierList/SupplierList";
import SupplierForms from "@/app/ui/user/admin/supplier/SupplierForms/SupplierForms";

export default function AdminSupplierPage() {
    return (
        <AdminSupplierProvider>
            <BaseUserPageLayout>
                <Title>
                    <p>Quản lý nhà cung cấp</p>
                    <VoidGeneralButton />
                </Title>
                <div className={`AdminSupplierPage grid grid-cols-[67%_1fr] gap-4`}>
                    <SupplierList />
                    <SupplierForms />
                </div>
            </BaseUserPageLayout>
        </AdminSupplierProvider>
    );
}

