'use client';

import Product from "@/app/ui/general/ProductSection/Product";
import { useState, useRef, useEffect } from "react";
import { ProductSection_Discounting, ProductSection_NewProduct, ProductSection_Categories } from "../general/ProductSection/ProductSection";
import { useHome } from "@/context/HomeContext";
import { productList } from "@/app/demo";
import BasicLoadingSkeleton from "../general/skeletons/LoadingSkeleton";
import { HomePromotion } from "./HomeAuthOnlySections";
import { TopBrandsSection } from "./TopBrandsSection";

export default function ProductSections() {
    return (
        <div>
            <ProductSection_Discounting />
            <HomePromotion />
            <TopBrandsSection />
            <ProductSection_NewProduct />
            <ProductSection_Categories />
        </div>
    )

}