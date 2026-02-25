'use client';

import { useHome } from "@/context/HomeContext";
import { ProductSection_MultiTab, ProductSection_SingleTab } from "../general/ProductSection/ProductSection";
import { TopBrandsSection as ProductSection_TopBrands } from "./TopBrandsSection";
import { usePublic } from "@/context/PublicContext";

export default function ProductSections() {
    return (
        <div>
            <ProductSection_Discounting />
            {/* <HomePromotion /> */}
            {/* <ProductSection_TopBrands /> */}
            <ProductSection_NewProduct />
            <ProductSection_Categories />
        </div>
    )

}

function ProductSection_Discounting() {
    const { flashSaleProducts, isProductsLoading } = useHome();
    return (
        <ProductSection_SingleTab listProduct={flashSaleProducts.items || []} isLoading={isProductsLoading} title="Sản phẩm đang giảm giá" link="/product?flash_sale=true" mode="highlight" />
    )
}

export function ProductSection_NewProduct() {
    const { newsestProducts, isProductsLoading } = useHome();
    console.log("news: ", newsestProducts);
    return (
        <ProductSection_SingleTab listProduct={newsestProducts.items || []} isLoading={isProductsLoading} title="Sản phẩm mới ra mắt" />
    );
}

export function ProductSection_Categories() {
    const { categoriesProducts, isProductsLoading } = useHome();
    const { publicData } = usePublic();
    if (isProductsLoading) {
        return (
            <ProductSection_SingleTab listProduct={[]} isLoading={true} title="Danh mục" />
        )
    } else return (
        <>
            {categoriesProducts.map((category) => {
                if (category.children?.length === 0) return null;
                const catData = publicData?.categories.find(cat => (cat.id === category.id));
                const bannerSrc = catData?.image || '';
                return (
                    (
                        <div key={category.id}>
                            <ProductSection_MultiTab
                                listTab={category.children?.map(children => ({
                                    id: children.id,
                                    label: children.name,
                                    products: children.products || []
                                })) || []}
                                title={category.name}
                                bannerSrc={bannerSrc}
                                link={`/product?category_id=${encodeURI(category.id)}`}
                            />
                        </div>
                    )
                )
            })
            }
        </>
    );
}
