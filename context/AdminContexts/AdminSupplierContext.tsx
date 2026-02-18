'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { TypeSupplier, getSuppliers } from "@/service/supplier.service";

interface AdminSupplierContextType {
    supplierList: TypeSupplier[];
    fetchSuppliers: () => void;
    isEditing: boolean,
    setIsEditing: (input: boolean) => void,
    selectedSupplier: TypeSupplier | undefined,
    setSelectedSupplier: (supplier: TypeSupplier) => void;
}

const AdminSupplierContext = createContext<AdminSupplierContextType | undefined>(undefined);

export function AdminSupplierProvider({ children }: { children: React.ReactNode }) {
    const [supplierList, setSupplierList] = useState<TypeSupplier[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedSupplier, setSelectedSupplier] = useState<TypeSupplier>();
    async function fetchSuppliers() {
        try {
            const res = await getSuppliers();
            setSupplierList(res);
        } catch (error: any) {
            console.error(`Không thể fetch categories, lỗi : ${error.message}`);
        }
    }
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            await fetchSuppliers();
            setSelectedSupplier(supplierList[0]);
        })();
        return () => { mounted = false };
    }, [])

    return (<AdminSupplierContext.Provider value={{ supplierList, fetchSuppliers, isEditing, setIsEditing, selectedSupplier, setSelectedSupplier }}>
        {children}
    </AdminSupplierContext.Provider>);
}

export const useAdminSupplierContext = () => {
    const context = useContext(AdminSupplierContext);
    if (!context) {
        throw new Error('useAdminSupplierContext must be used within AdminSupplierProvider');
    }
    return context;
};