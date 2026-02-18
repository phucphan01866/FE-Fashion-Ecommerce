'use client'

import TextContent from "@/app/ui/product/TextContent";
import ImageContent from "@/app/ui/product/ImageContent";
import CommentSection from "@/app/ui/product/CommentSection";
import { useProductPage } from "@/context/ProductContext";
import BasicLoadingSkeleton from "../general/skeletons/LoadingSkeleton";
import { Divider } from "../user/general/general";
import RelativeProductSection from "@/app/ui/product/RelativeProductSection";
import Breadcrumb from "../general/Breadcrumb/Breadcrumb";
import { usePublic } from "@/context/PublicContext";



export default function ProductPage() {
    const { isLoading, product, relativeList } = useProductPage();
    const categories = usePublic().publicData?.categories;
    const parentCategoryId = categories?.find(cat => cat.name === product?.category_name)?.parent_id;

    if (isLoading) return (<BasicLoadingSkeleton />);
    else return (
        <div className="container ">
            <div className="w-full bg-white rounded-2xl px-16 py-8">
                <div className=" max-w-[1080px] flex flex-col justify-center gap-y-8 mx-auto">
                    <div className="flex flex-col gap-6">
                        <Breadcrumb breadcrumbItems={[
                            { link: '/', text: 'Trang chủ' },
                            { link: '/product', text: 'Sản phẩm' },
                            { link: `/product?category_id=${parentCategoryId}`, text: categories?.find(cat => cat.id === parentCategoryId)?.name || '' },
                            { link: `/product?category_id=${categories?.find(cat => cat.name === product?.category_name)?.id}`, text: product?.category_name || '' },
                            { link: ``, text: product?.name || '' }
                        ]} />
                        <div className="flex gap-x-16 justify-center-safe">
                            <div className="">
                                <ImageContent />
                            </div>
                            <div className="py-1">
                                <TextContent />
                            </div>
                        </div>
                    </div>
                    <div className="mx-auto w-[100%] flex flex-col gap-8">
                        <div className="w-full px-8 py-8 rounded-xl flex flex-col gap-3 border-2 border-gray-100">
                            <p className="fontA2">Mô tả sản phẩm</p>
                            <Divider />
                            <p className="whitespace-pre-wrap">{product?.description}</p>
                        </div>
                        <CommentSection />
                    </div>
                    <RelativeProductSection relativeList={relativeList} />
                </div>
            </div>
        </div>
    );
}