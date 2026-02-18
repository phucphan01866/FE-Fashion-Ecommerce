'use client';

import ProductPageProvider from "@/context/ProductContext";
import ProductPage from "@/app/ui/product/ProductPage";
import { useParams } from "next/navigation";

export default function Page() {
    // const relativeList = productList[0];

    return (
        <ProductPageProvider id={String(useParams().id)}>
            <ProductPage />
        </ProductPageProvider>
    )
}