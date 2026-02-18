'use client'
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/app/ui/general/Breadcrumb/Breadcrumb";
import Product from "@/app/ui/general/ProductSection/Product";
import { Title, BaseUserPageLayout, sectionCSS, sectionGridCSS, Divider, VoidGeneralButton } from "@/app/ui/user/general/general";
import { productDemo } from "@/app/demo";
import { FavoritePageProvider, useFavoritePage } from "@/context/UserFavoriteContext";
import { FavoriteProductsLists } from "@/service/favorite.service";
import { useFavorite } from "@/context/FavoriteContext";

export default function page() {
    return (
        <FavoritePageProvider>
            <BaseUserPageLayout>
                <ContentLayer />
            </BaseUserPageLayout>
        </FavoritePageProvider>
    );
}

function ContentLayer() {
    const { favoriteData, showMore, preFetchFavoriteData } = useFavoritePage();
    return (
        <>
            <Title additionalCSS="flex items-center justify-between">
                <p>Danh sách sản phẩm yêu thích</p>
                <VoidGeneralButton />
            </Title>
            <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl ">
                <ContentArea favoriteData={favoriteData} />
                {(favoriteData?.nextCursor !== null && preFetchFavoriteData?.nextCursor !== null) && (
                    <PaginateButton onClick={showMore} />
                )}
                {(!favoriteData || (favoriteData.items.length === 0)) && (
                    <div className="py-4 text-center text-gray-500">
                        Bạn chưa có sản phẩm yêu thích nào.
                    </div>
                )}
            </div>
        </>
    )
}

function PaginateButton({ onClick }: { onClick: () => void }) {
    return (
        <div className="w-full">
            <button type="button" onClick={onClick} className={`block w-fit transition all ease-in-out px-3 py-2 bg-gray-100 hover:bg-orange-400 hover:!text-white rounded-lg mx-auto  cursor-pointer }`}>Xem thêm</button>
        </div>
    );
}

function ContentArea({ favoriteData }: { favoriteData: FavoriteProductsLists | undefined }) {
    const { favoriteIdsList } = useFavorite();
    return (
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4">
            {favoriteData && favoriteData.items && favoriteData.items.length > 0 && favoriteData.items.map((item) => (
                <Product
                    key={item.product_id}
                    itemOption="fill"
                    data={item}
                    optionalImgUrl={item.images[0].url}
                    isCustomer={true}
                    isFavored={favoriteIdsList.includes(item.product_id) ? true : false}
                    customID={item.product_id}
                />
            ))}
        </div>
    )
}

