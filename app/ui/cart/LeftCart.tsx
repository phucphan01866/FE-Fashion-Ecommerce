'use client'

import { useEffect, useState } from "react";
import CartItem from "./CartItem";
import { blockContainerCSS, Title, Divider } from "./General";
import { useCart } from "@/context/CartContext";
import { PreviewLineItem } from "@/service/promotion.service";
import { SpinLoadingSkeleton } from "../general/skeletons/LoadingSkeleton";
import Image from "next/image";

export default function LeftCart() {
    const { clearCart, cart, } = useCart();
    // console.log("cart current: ", cart);
    return (
        <div className={`Left ${blockContainerCSS} flex flex-col`}>

            <div className="flex justify-between">
                <Title>Giỏ hàng</Title>
                {cart && cart.items && cart?.items.length > 0 && (
                    <button onClick={clearCart} type="button" className="fontA5 cursor-pointer hover:text-orange-500 hover:opacity-85">Xóa giỏ hàng</button>
                )}
            </div>
            <div className="mt-3">
                <Divider />
            </div>
            {cart?.removedItems && cart.removedItems.length > 0 && (
                <RemovedItemNotificatate />
            )}
            <ItemList />

        </div>
    );
}

function ItemList() {
    const { cart, previewPromotion } = useCart();

    if (!cart?.items || !cart.items.length || cart?.items.length === 0) return (
        <div className="py-4 text-center text-gray-500">
            Giỏ hàng của bạn đang trống.
        </div>
    )
    return (
        cart?.items.map((item, index) => (
            <div key={index} className="">
                {index >= 1 ? <Divider /> : null}
                <CartItem item={item}
                    previewData={previewPromotion.items.find((previewItem, index) => {
                        return (previewItem.variant_id === item.variant_id && previewItem.size === item.size);
                    })} />
            </div>
        ))
    );
}

function RemovedItemNotificatate() {
    const removedItems = useCart().cart?.removedItems || [];
    const [isShowNotiArea, setIsShowNotiArea] = useState(false);
    const remove = useCart().batchRemove;
    function removeRemovedItems() {
        remove();
    }
    return (
        <div className="mt-3 px-3 py-1.5 rounded-md bg-orange-100 border-1 border-orange-500">
            <div className="flex gap-2 items-center-safe justify-between">
                <p><span className="font-semibold!">Thông báo:</span> Giỏ hàng hiện có <span className="font-bold!">{removedItems.length}</span> sản phẩm đã hết hàng/không còn kinh doanh nữa</p>
                <div className="flex justify-center-safe items-center-safe gap-3">
                    <button onClick={() => removeRemovedItems()} className="fontA4 cursor-pointer rounded-md transition-all duration-150 ease-in-out hover:bg-orange-400/80 hover:shadow-sm hover:text-white px-1.5 py-1">Xóa khỏi giỏ</button>
                    <button onClick={() => setIsShowNotiArea(!isShowNotiArea)} className="aspect-1/1 p-0.5 cursor-pointer rounded-md transition-all hover:bg-orange-400/80 hover:shadow-sm group"><Image src="/icon/chevron-down.svg" width={24} height={24} alt="Expand details" className="group-hover:invert group-hover:brightness-0" /></button>
                </div>
            </div>
            {isShowNotiArea && (
                <ListRemovedItems />
            )}
        </div>
    );
}

function ListRemovedItems() {
    const { cart } = useCart();
    return (
        cart?.removedItems.map((item, index) => (
            <div key={index} className="">
                {index >= 1 ? <Divider /> : null}
                <CartItem item={item} isRemovedItem={true} />
            </div>
        ))
    );
}