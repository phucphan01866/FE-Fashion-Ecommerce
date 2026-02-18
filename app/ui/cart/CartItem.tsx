'use client'

import Image from "next/image";
import { CartItemType } from "@/app/demo";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import "@/app/ui/general/Input/Input.css";
import { TypeCartItem } from "@/service/cart.service";
import { useDebounce } from "@/hooks";
import { usePublic } from "@/context/PublicContext";
import { ParsedSku, parseSku } from "@/service/variant.service";
import Link from "next/link";
import { PreviewLineItem } from "@/service/promotion.service";

export default function CartItem({ item, previewData, isRemovedItem = false }: { item: TypeCartItem, previewData?: PreviewLineItem, isRemovedItem?: boolean }) {
    const parsedSku: ParsedSku = parseSku(item.sku);
    // console.log("Rendered CartItem:", item);
    return (
        <div className={`grid gap-4 ${isRemovedItem ? "my-2 opacity-75" : "my-4"}`}>
            <div className="flex gap-4">
                <ProductImageArea imgSrc={item.image_url || "/"} name={item.product_name} prod_id={item.product_id} isSmall={isRemovedItem} />
                <div className="flex-1 flex flex-col gap-2 justify-center">
                    <Link href={`/product/${encodeURI(item.product_id)}`} className="flex gap-4">
                        <TitleArea>{item.product_name}</TitleArea>
                    </Link>
                    <InfoArea category={parsedSku.category} size={item.size} color={parsedSku.color} salePercent={item.is_flash_sale ? item?.sale_percent : undefined} />
                </div>
                {!isRemovedItem && (
                    <div className="flex-1 grid gap-2 content-center">
                        <div className="flex gap-4 items-center justify-end-safe">
                            <RemoveButton id={item.id} />
                        </div>
                        <div className="flex gap-6">
                            <QuantityArea id={item.id} currentQuantity={item.qty}/>
                            <PriceArea
                                previewData={previewData || undefined}
                                unitPrice={item.unit_price}
                                finalPrice={item.unit_price}
                                quantity={item.qty} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductImageArea({ imgSrc, name, prod_id, isSmall = false }: { imgSrc: string, name: string, prod_id: string, isSmall?: boolean }) {
    const imgRoundedSize = isSmall ? 64 : 90;
    return (
        <Link href={`/product/${encodeURI(prod_id)}`}
            className="row-span-3 relative overflow-hidden rounded-md aspect-square"
            style={{ width: imgRoundedSize, height: imgRoundedSize }}
        >
            <Image src={imgSrc} width={imgRoundedSize} height={imgRoundedSize} alt={name} className={`object-cover rounded-md w-full h-full ${isSmall && "border-2 border-white"}`} />
        </Link>
    );
}

function TitleArea({ children }: { children: string }) {
    return (
        <h3 className="font-semibold text-xl">{children}</h3>
    );
}

function RemoveButton({ id }: { id: string }) {
    const { removeItem } = useCart();
    const btnSize = 24;
    return (
        <button
            // onClick={() => removeItem(id)}
            onClick={() => removeItem(id)}
            type="button" className="px-1 py-0.5 hover:!text-orange-400 rounded-md">
            <p className="fontA6 italic">Xóa bỏ</p>
            {/* <Image
                className=""
                src={"/icon/circle-minus.svg"} width={btnSize} height={btnSize} alt="button remove" /> */}
        </button>
    )
}

function InfoArea({ category, size, color, salePercent }: { category: string, size: string, color: string, salePercent?: number }) {
    return (
        <div className="flex gap-2 text-sm italic">
            <ItemInfo><p>{category}</p></ItemInfo>
            <ItemInfo><p>Size <span>{size}</span></p></ItemInfo>
            <ItemInfo><p>{color}</p></ItemInfo>
            {salePercent && salePercent > 0 && (
                <ItemInfo><p>KM {salePercent}%</p></ItemInfo>
            )}
        </div>
    );
}

function ItemInfo({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-2 py-0.5 rounded-lg bg-orange-400 opacity-90 text-white fontA6 italic">{children}</div>
    );
}

function QuantityArea({ id, currentQuantity }: { id: string, currentQuantity: number }) {
    const { updateQuantity } = useCart();
    const [areaValue, setAreaValue] = useState(currentQuantity);

    const debouncedUpdate = useDebounce(async (qty: number) => {
        if (qty > 0) {
            const newQty = await updateQuantity(id, qty);
            setAreaValue(newQty !== -1 ? newQty : currentQuantity);
        } else {

        }
    }, 500);

    useEffect(() => {
        setAreaValue(currentQuantity);
    }, [currentQuantity]);

    function onChange(newQty: number) {
        if (newQty === areaValue) return;
        setAreaValue(newQty);
        debouncedUpdate(newQty);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "") {
            setAreaValue(1);
            return;
        }
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0) {
            onChange(num);
        }
    };

    const handleBlur = () => {
        if (areaValue < 1) {
            onChange(1);
        }
    };

    return (
        <div className="flex items-center gap-2 rounded-md border border-gray-300">
            <button
                type="button"
                onClick={() => onChange(areaValue - 1)}
                className="px-3 py-1.5 hover:bg-gray-100 transition"
            >
                −
            </button>

            <input
                type="text"
                inputMode="numeric"
                value={areaValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-16 text-center outline-none font-medium"
                style={{ appearance: "textfield" }}
            />

            <button
                type="button"
                onClick={() => onChange(areaValue + 1)}
                className="px-3 py-1.5 hover:bg-gray-100 transition"
            >
                +
            </button>
        </div>
    );
}

function PriceArea({ quantity, unitPrice, finalPrice, previewData }: { quantity: number, unitPrice: number, finalPrice: number, previewData?: PreviewLineItem }) {
    return (
        <div className="flex gap-4 ml-auto items-end-safe">
            {/* {isFlashSale && (
                <p className="text-sm"><span className="line-through italic">{(unitPrice * quantity).toLocaleString("vi-VN")}</span></p>
            )} */}
            {previewData && previewData.discount > 0 ? (
                <p className={`fontA5 line-through italic`}>{(unitPrice * quantity).toLocaleString("vi-VN")}</p>
            ) : null}
            <p className={`fontA3 ${previewData && previewData.discount > 0 && "!text-orange-500"}`}>{(Math.round(previewData ? previewData.final_line : finalPrice * quantity)).toLocaleString("vi-VN")} đ</p>
        </div>
    );
}