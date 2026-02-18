'use client'

import Link from "next/link";
import { Title, BaseUserPageLayout } from "@/app/ui/user/general/general";
import { sectionCSS } from "@/app/ui/user/general/general";
import { InputField, InputSelect, TextArea } from "@/app/ui/general/Input/Input";
import NewsEditForm from "@/app/ui/user/admin/news/NewsEditForm";
import { NewsEditProvider } from "@/context/AdminContexts/AdminEditNewsContext";

export default function AdminProductPage() {

    return (
        <NewsEditProvider>
            <BaseUserPageLayout>
                <Title additionalCSS="flex items-center justify-between">
                    <p>Cập nhật tin tức</p>
                </Title>
                <div className={`grid grid-cols-[1fr] gap-4  ${sectionCSS}`}>
                    <NewsEditForm />
                </div>
            </BaseUserPageLayout>
        </NewsEditProvider>
    );
}