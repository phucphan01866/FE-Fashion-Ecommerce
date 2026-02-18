'use client';

import { useEffect, useState } from "react";
import ProductListHorizontal from "@/app/ui/general/ProductSection/ProductListHorizontal";
import { useHome } from "@/context/HomeContext";
import { productImage, TypeProduct } from "@/service/product.service";
import BasicLoadingSkeleton from "../skeletons/LoadingSkeleton";
import Image from "next/image";
import { usePublic } from "@/context/PublicContext";
import Link from "next/link";

export function ProductSection({ listProduct, listTab, title, bannerSrc, link, mode }: { listProduct?: TypeProduct[], listTab?: { label: string, products: TypeProduct[], id: string }[], title: string, bannerSrc?: string, link?: string, mode?: string }) {
    if (listTab && listTab.length > 0) return (
        <ProductSection_MultiTab
            listTab={[...(listTab || [])].sort((a, b) => (b.products?.length || 0) - (a.products?.length || 0))}
            title={title}
            bannerSrc={bannerSrc}
            link={link || undefined}
            mode={mode}
        />
    );

    if (listProduct && listProduct.length > 0) return (
        <ProductSection_OneTab
            listProduct={listProduct}
            title={title}
            bannerSrc={bannerSrc}
            link={link || undefined}
            mode={mode}
        />
    );

}

const h1CSS = "after:content-[''] after:block after:w-1/2 hover:after:w-[100%] after:h-[3px] after:bg-[rgb(53,64,82)] after:mx-auto after:mt-2 after:transition-all after:duration-1000 font-bold text-3xl text-center w-fit m-auto relative uppercase";

export
    function ProductSection_OneTab({ listProduct, title, bannerSrc, link, mode }: { listProduct: TypeProduct[], title: string, bannerSrc?: string, link?: string, mode?: string }) {
    return (
        <div className={`${mode === "highlight" ? "bg-gradient-to-b from-orange-400 to-orange-500 shadow-md" : "container"} `}>
            <div className={`
            ${mode === "highlight" ? "container " : "bg-white rounded-md shadow-md"} 
            my-12 p-6  flex flex-col gap-6
        `}>
                {bannerSrc && <ProductSection_Banner bannerSrc={bannerSrc} />}
                <h1
                    className={`${h1CSS} ${mode === "highlight" ? "text-white after:bg-white" : ""}`}
                >{title}</h1>
                <ProductListHorizontal products={listProduct} />
                {link && (
                    <Link
                        className={`mx-auto flex gap-1 hover:gap-3 px-3 py-2 rounded-full border-2 
                        
                            ${mode === "highlight" ? "border-3 bg-white text-orange-500 hover:bg-orange-500 hover:text-white hover:border-white"
                                : "border-orange-500 text-orange-500 fontA4 font-medium! hover:bg-orange-500 hover:text-white "}    
                            transition-all duration-300 group
                        `}
                        href={link}>Xem tất cả {title.toLocaleLowerCase()}
                        <Image
                            className="group-hover:invert group-hover:brightness-0 transition-all duration-300"
                            src="/icon/arrow-narrow-right_orange_500.svg" width={16} height={16} alt="arrow_right" />
                    </Link>
                )}
            </div>
        </div>
    );
}

export function ProductSection_MultiTab({ listTab, title, bannerSrc, link, mode }: { listTab: { label: string, products: TypeProduct[], id: string }[], title: string, bannerSrc?: string, link?: string, mode?: string }) {
    const [selectedTab, setSelectedTab] = useState<string>(listTab && listTab.length > 0 ? listTab.find(tab => tab.products.length > 0)?.label || listTab[0].label : '');
    function handleSelectTab(tabName: string) {
        setSelectedTab(tabName);
    }
    const [selectedID, setSelectedID] = useState<string>("");
    useEffect(() => {
        const foundTab = listTab.find(tab =>
            tab.label.trim() === selectedTab.trim()
        );
        setSelectedID(foundTab ? foundTab.id : selectedTab);
    }, [selectedTab]);
    return (
        <div className="container my-12 bg-white p-6 rounded-md shadow-md flex flex-col gap-3">
            {bannerSrc && <ProductSection_Banner bannerSrc={bannerSrc} />}
            <Link href={link || ""} className={h1CSS}>
                {title}
            </Link>
            <TabList listTab={listTab.filter(tab => tab.products.length > 0).map(tab => tab.label)} selectedTab={selectedTab} onTabSelect={(tabName) => handleSelectTab(tabName)} />
            {listTab.map((tab, index) => {
                if (tab.label !== selectedTab) return null;
                return (
                    <ProductListHorizontal
                        key={index}
                        products={tab.products} />
                );
            })}
            {selectedID && (
                <Link
                    className={`mx-auto flex gap-1 hover:gap-3 px-3 py-2 rounded-full border-2 
                        border-orange-500 text-orange-500 fontA4 font-medium! hover:bg-orange-500 hover:text-white 
                        transition-all duration-300 group
                        `}
                    href={`/product?category_id=${encodeURI(selectedID)}`}>Xem tất cả {selectedTab.toLocaleLowerCase()}
                    <Image
                        className="group-hover:invert group-hover:brightness-0 transition-all duration-300"
                        src="/icon/arrow-narrow-right_orange_500.svg" width={16} height={16} alt="arrow_right" />
                </Link>
            )}

        </div>
    );
}

function TabList({ listTab, selectedTab, onTabSelect }: { listTab: string[], selectedTab: string, onTabSelect: (tabName: string) => void }) {
    // const active = "font-semibold border-b-2 border-orange-500";
    return (
        <div className="flex gap-3 mx-auto mt-3 m-1 w-fit ">
            {listTab.map((tab, index) => {
                return (
                    <button key={index} onClick={() => onTabSelect(tab)}
                        // hover:border-b-2 hover:border-orange-500 
                        className={` 
                            fontA4 hover:text-orange-500
                            after:content-[''] after:block after:w-1/2 hover:after:w-[100%] after:h-[0px] hover:after:h-[1px] after:bg-orange-400 after:mx-auto after:mt-1 after:transition-all after:duration-1000 transition-all duration-750
                            ${tab == selectedTab ? `fontA3! font-semibold! after:h-[1px] after:w-full text-orange-500` : `font-medium!`} 
                            uppercase hover:font-semibold transition-all duration-50 ease-in-out`}
                    >
                        {tab}
                    </button>
                )
            })}
        </div>
    );
}

export function ProductSection_Discounting() {
    const { flashSaleProducts, isProductsLoading } = useHome();
    if (isProductsLoading) {
        return <BasicLoadingSkeleton />;
    }
    if (flashSaleProducts.items.length === 0) {
        return null;
    }
    return (
        <ProductSection listProduct={flashSaleProducts.items} title="Sản phẩm đang Flashsale" link="/product?is_flash_sale=true" mode="highlight" />
    );
}

export function ProductSection_NewProduct() {
    const { newsestProducts, isProductsLoading } = useHome();
    if (isProductsLoading) {
        return <BasicLoadingSkeleton />;
    }
    if (newsestProducts.items.length === 0) {
        return null;
    }
    return (
        <ProductSection listProduct={newsestProducts.items} title="Sản phẩm mới ra mắt" />
    );
}

export function ProductSection_Categories() {
    const { categoriesProducts, isProductsLoading } = useHome();
    const { publicData } = usePublic();
    if (isProductsLoading) {
        return <BasicLoadingSkeleton />;
    } else return (
        <>
            {categoriesProducts.map((category) => {
                if (category.children?.length === 0) return null;
                const catData = publicData?.categories.find(cat => (cat.id === category.id));
                const bannerSrc = catData?.image || '';
                return (
                    (
                        <div key={category.id}>
                            <ProductSection
                                listTab={category.children?.map(children => ({
                                    id: children.id,
                                    label: children.name,
                                    products: children.products || []
                                }))}
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

function ProductSection_Banner({ bannerSrc }: { bannerSrc: string }) {
    return (
        <div className="container relative block w-full h-[460px] mb-6">
            <div className="container relative w-full h-full rounded-2xl overflow-hidden">
                <Image src={bannerSrc} alt="category_banner" fill className="object-cover" />
            </div>
        </div>
    )
}
