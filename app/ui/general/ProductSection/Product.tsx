

import Image from "next/image";
import Link from "next/link";
import "./style.css";
import { useEffect, useState } from "react";
import { TypeProduct } from "@/service/product.service";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useCart } from "@/context/CartContext";
import { useFavorite } from "@/context/FavoriteContext";
import ImageSkeleton from "../skeletons/ImageSkeleton";
import TextSleleton from "../skeletons/TextSkeleton";

interface ProductProps {
    imageSrc: string;
    name: string;
    priceFrom: number;
    priceTo: number;
}

export default function Product({
    data,
    // itemOption = "medium",
    isCustomer = false,
    isFavored = false,
    customID,
    isLoading = false,
}: {
    data: any,
    // itemOption?: "small" | "medium" | "large" | 'fill',
    isCustomer?: boolean,
    isFavored?: boolean,
    customID?: string,
    isLoading?: boolean,
}) {
    // console.log("Data: ," ,data);
    const iconSize = 20;
    const url = !isLoading ? `/product/${customID || data.id}` : "#";
    let image: string = data?.image || data?.product_images[0] || "";
    const imgSize = { width: 260, height: 260 };
    const { addItem } = useCart();
    function handleClick(data: TypeProduct) {
        const stockAvailableProduct = data.variants.find(variant => variant.stock_qty > 0);
        if (!stockAvailableProduct) {
            return;
        }
        addItem(stockAvailableProduct.id, stockAvailableProduct.sizes[0], 1);
    }
    const { toggleFavoriteState } = useFavorite();
    return (
        <div className={`relative flex-shrink-0 grid p-2 bg-white shadow-sm hover:drop-shadow-lg rounded-xl my-3`}>
            <Link href={`${url}`} className="relative aspect-1/1 w-full h-auto object-cover [user-drag:none] [-webkit-user-drag:none] overflow-hidden rounded-md"
                style={{ minWidth: imgSize?.width + "px", minHeight: imgSize?.height + "px" }}>
                {!isLoading ? (
                    <Image src={image.length > 0 ? image : "/"}
                        fill
                        alt=""
                        className={`d-block object-cover rounded-md transition-transform duration-500 ease-out group-hover:scale-110 hover:!scale-110 `}></Image>

                ) : (<ImageSkeleton />)}
            </Link>
            <div className={`mt-1 p-1 truncate grid grid-cols-[1fr_auto] font-medium gap-y-2 ${isCustomer ? "gap-x-2" : ""}`}
                style={{ maxWidth: imgSize?.width + "px" }}>
                <Link href={`${url}`} className={`[user-drag:none] [-webkit-user-drag:none] truncate`}>
                    <h2 className={`col-start-1 truncate capitalize ${isCustomer ? "max-w-[22ch]" : ""}`}>
                        {!isLoading ? (
                            data.name
                        ) : (
                            <TextSleleton />
                        )}
                    </h2>
                </Link>
                {
                    !isLoading ? (
                        <p className={`col-start-1`}>
                            <span className={`${data.is_flash_sale ? 'fotnA4 !font-normal line-through' : 'fontA3 !font-semibold'}`}>
                                {Number(data.price).toLocaleString('vi-VN')}₫</span>
                            {data.is_flash_sale && (
                                <span className="fontA3 ml-3 !font-semibold">{data.final_price.toLocaleString('vi-VN')}₫</span>
                            )}
                        </p>
                    ) : (
                        <TextSleleton />
                    )
                }
                {isCustomer && (
                    <button onClick={() => handleClick(data)} className={`add-to-cart-btn flex flex-col gap-2 justify-center col-start-2 rounded-full bg-orange-400 hover:bg-orange-400 hover:outline-2 hover:outline-orange-50 hover:scale-105 transition-all duration-300 ease-in-out 
                text-2xl text-white leading-5 row-span-2 row-start-1 px-3 py-3`}>
                        <span className="">
                            <Image src="/icon/shopping-cart-plus-white.svg" width={iconSize} height={iconSize} alt="cart icon" className="relative"></Image>
                        </span>
                    </button>
                )}
                {isCustomer && (
                    <FavoriteButton onClick={() => { toggleFavoriteState && toggleFavoriteState(customID || data.id) }} isFavored={isFavored} />
                )}
            </div>
        </div>
    );
}

function FavoriteButton({ isFavored, onClick }: { isFavored: boolean, onClick: () => void }) {
    const [isFavoring, setIsFavoring] = useState(isFavored);
    function onBTNClick() {
        setIsFavoring(!isFavoring); // update UI trước
        onClick();
    }
    useEffect(() => {
        setIsFavoring(isFavored);
    }, [isFavored])
    return (
        <button
            onClick={onBTNClick}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all duration-200 ease-in-out opacity-50 hover:opacity-100 hover:scale-120 ">
            {(isFavored || isFavoring) ? (
                <Image src="/icon/heart_activated.svg" width={30} height={30} alt="favorite icon"
                    className="relative"></Image>
            ) : (
                <Image src="/icon/heart.svg" width={30} height={30} alt="favorite icon"
                    className="relative"></Image>
            )}
        </button>
    )
}