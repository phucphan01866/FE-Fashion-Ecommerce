'use client'

import Link from "next/link";
import { Title, BaseUserPageLayout } from "@/app/ui/user/general/general";
import { sectionCSS } from "@/app/ui/user/general/general";
import { InputField, InputSelect, TextArea } from "@/app/ui/general/Input/Input";
import NewsCreateForm from "@/app/ui/user/admin/news/NewsCreateForm";
import { NewsCreateProvider } from "@/context/AdminContexts/AdminCreateNewsContext";

export default function AdminProductPage() {

    return (
        <NewsCreateProvider>
            <BaseUserPageLayout>
                <Title additionalCSS="flex items-center justify-between">
                    <p>Tạo tin mới</p>
                </Title>
                <div className={`grid grid-cols-[1fr] gap-4  ${sectionCSS}`}>
                    <NewsCreateForm />
                </div>
            </BaseUserPageLayout>
        </NewsCreateProvider>
    );
}