'use client';
import Image from "next/image";
import { useEffect, useState } from "react";

// import { useProductPage } from "@/app/(main)/product/page";
import { useProductPage } from "@/context/ProductContext";
import { useFavorite } from "@/context/FavoriteContext";
import { TypeVariant, TypeVariantPayload } from "@/service/variant.service";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ToolTip } from "../user/general/general";
import BasicLoadingSkeleton from "../general/skeletons/LoadingSkeleton";

// function BreadcrumbSection() {
//     const { product } = useProductPage();
//     const breadcrumbItems = [
//         {link: `/`, text: "Trang chủ"},
//         {link: `/category`, text: product.category},
//         {link: `/${product.category}/${product?.name}`, text: product?.name},
//     ]
//     return (
//         <Breadcrumb breadcrumbItems={breadcrumbItems} />
//     );
// }

export default function TextContent() {
    return (
        <>
            <TitleSection />
            <PriceSection />
            <VariantSection />
            <AddToCartSection />
        </>
    );
}

function TitleSection() {
    const { product } = useProductPage();
    return (
        <>
            <div className="flex gap-2 w-full mb-4">
                <h1 className="flex-1 text-4xl font-semibold uppercase leading-tight">{product?.name}</h1>
                {/* <p className="w-fit leading-loose">{product?.category}</p> */}
            </div>
            {/* <p className="mb-4 text-justify">{product?.description}</p> */}
        </>
    );
}

function PriceSection() {
    const { product } = useProductPage();
    return (
        <div className="flex items-baseline gap-4 mb-8">
            {product?.is_flash_sale && product.sale_percent > 0 && <span className="text-gray-400 line-through text-md">{Math.floor(product?.price).toLocaleString('vi-VN')} ₫</span>}
            <span className="text-2xl font-bold">
                {(product?.is_flash_sale && product.sale_percent ? (product.price * (100 - product.sale_percent) / 100) : (Number(product?.price) || 0)).toLocaleString('vi-VN')} ₫</span>
            {product?.is_flash_sale && product.sale_percent > 0 && <span className="text-red-500 font-medium bg-red-100 px-2 py-1 rounded-full text-sm">Flash Sale {`${Math.floor(product.sale_percent)}%`}</span>}
        </div>
    );
}

function VariantSection() {
    const { variantList, sizeList } = useProductPage();
    return (
        <div className="flex flex-col gap-3 w-fit hover:bg-gray-200 outline-4 outline-gray-50 border-2 border-white bg-gray-100 p-4 rounded-[2rem] mb-4 transition-all duration-5p0 ease-in-out">
            <BaseButtonArea label={sizeList.length > 0 && sizeList[0].toUpperCase() !== "KHÁC" ? "Màu sắc" : "Phân loại"}>
                <ColorButtonArea colorList={variantList.filter(variant => variant.stock_qty > 0).map((variant) => ({ sku: variant.sku, title: variant.color_name, colorCode: variant.color_code }))} />
            </BaseButtonArea>
            {(sizeList.length > 0 && sizeList[0].toUpperCase() !== "KHÁC") && (
                <BaseButtonArea label="Kích thước">
                    <SizeButtonArea />
                </BaseButtonArea>
            )}

        </div>
    );
}

function BaseButtonArea({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className={`w-fit flex gap-2 items-center px-4 py-1 rounded-full border-2 border-gray-200 bg-white`}>
            <p className="mr-2">{label}</p>
            {children}
        </div>
    );
}


function SizeButtonArea() {
    const { selectedSize, setSelectedSize, sizeList, selectableSizes } = useProductPage();
    return (
        <>
            {sizeList.map(function (size, index) {
                return (
                    <SizeButton
                        key={index}
                        selectable={selectableSizes.includes(size)}
                        selectedSize={selectedSize}
                        setSize={setSelectedSize}>{size}</SizeButton>
                );
            })}
        </>
    );
}

function SizeButton({
    children, selectedSize, selectable, setSize }: {
        children: string,
        selectable: boolean,
        selectedSize: string,
        setSize: (size: string) => void
    }) {
    const active = (children === selectedSize);
    const handleClick = () => {
        setSize(children);
    }
    return (
        <button type="button" onClick={selectable ? handleClick : () => { }}
            className={`
                fontA5
                ${active ? ' bg-gray-200 !font-bold' : ""}
                ${selectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} transition-all duration-100 ease-in-out
                font-bold py-[12px] w-[44px] rounded-full !leading-1 border-2 border-gray-200 hover:bg-gray-200 antialiased`}>
            {children}
        </button>

    )
}

function Dot({ colorCode }: { colorCode: string }) {
    const dotSize = "20px";
    return (
        <div className="rounded-full"
            style={{ backgroundColor: colorCode, width: dotSize, height: dotSize }}></div>
    );
}

function ColorButton({ sku, colorName, colorCode, handleClick, active = false }: { sku: string, colorName: string, colorCode?: string, handleClick: (sku: string) => void, active?: boolean }) {
    const [isTooltipHovered, setIsTooltipHovered] = useState(false);
    return (
        <div className="relative flex rounded-full"
            onMouseEnter={() => setIsTooltipHovered(true)}
            onMouseLeave={() => setIsTooltipHovered(false)}>
            <button
                title={colorName}
                className={`rounded-full shadow-[0_0_1px_1px_rgba(110,110,110,0.25)] transition-all duration-100 ease-in-out hover:scale-115 ${active ? "scale-110" : null}`}
                style={{ outlineColor: colorCode }}
                onClick={() => handleClick(sku)}
            >
                <Dot colorCode={colorCode || "#CCCCCC"}></Dot>
            </button>
            {isTooltipHovered &&
                <ToolTip><p>{colorName}</p></ToolTip>}
        </div>
    )
}

function ColorButtonArea({ colorList }: {
    colorList: { sku: string, title: string, colorCode: string }[]
}) {
    const { selectedVariant, setSelectedVariant, variantList, updateSelectedColor } = useProductPage();

    return (
        <>
            <div className="px-1 py-1 flex gap-2 rounded-full border-2 border-gray-300 ">
                {colorList.map(function (color, index) {
                    const isActivating = selectedVariant?.color_name === color.title;
                    return (
                        <ColorButton key={index} sku={color.sku} colorName={color.title} colorCode={color.colorCode} handleClick={(sku) => updateSelectedColor(sku)} active={isActivating}></ColorButton>
                    );
                })}
            </div>
        </>
    );
}

function AddToCartSection() {
    const { user } = useAuth();
    return (
        <div className="w-full flex items-center gap-4 mb-16">
            <FormCart isCustomer={user?.role === 'customer'} />
            {user?.role === 'customer' && <FavoriteButton />}
        </div>
    );
}

function FavoriteButton() {
    const iconSize = 36;
    const [isHovering, setIsHovering] = useState(false);
    const { favoriteIdsList, toggleFavoriteState, isLoadFavorite } = useFavorite();
    const { product } = useProductPage();
    const [isFavorite, setIsFavorite] = useState<boolean>(favoriteIdsList.includes(product?.id || "-1"));

    useEffect(() => {
        setIsFavorite(favoriteIdsList.includes(product?.id || "-1"));
    }, [favoriteIdsList, product]);

    if (isLoadFavorite) {
        return <BasicLoadingSkeleton />;
    } else {
        return (
            <button className="rounded-full p-2 hover:scale-125 transition-all duration-150 ease-in-out"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => {
                    if (toggleFavoriteState) {
                        toggleFavoriteState(product?.id || "0");
                    }
                }}>
                <Image src={`/icon/heart${isFavorite ? "_activated" : ""}.svg`} alt="favorite button" width={iconSize} height={iconSize} className="" />
            </button>
        )
    }
}

function FormCart({ isCustomer }: { isCustomer: boolean }) {
    const { selectedVariant, selectedSize, quantity, setQuantity, product } = useProductPage();
    const [isError, setIsError] = useState(false);
    const increaseQuantity = function () {
        setQuantity(quantity ? quantity + 1 : 1);
        if (quantity && quantity < 1) {
            setQuantity(1);
        } else if (quantity && quantity >= 999) {
            setQuantity(999);
        }
    }
    const decreaseQuantity = function () {
        if (quantity && quantity > 1) {
            setQuantity(quantity - 1);
        } else {
            setQuantity(undefined);
        }
        setIsError(false);
    }
    const { setNotification } = useNotificateArea();
    const handleOnChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const input = Number(e.target.value);
        if (input <= 0) setQuantity(undefined); else setQuantity(input);
        if (input > 999) setQuantity(999);
        setIsError(false);
    }
    const { addItem, cart } = useCart();
    async function handleAddToCart() {
        try {
            if (!isCustomer) {
                throw new Error("Vui lòng đăng nhập tài khoản để thêm sản phẩm vào giỏ.");
            }
            if (product?.status === 'inactive') {
                throw new Error("Sản phẩm hiện không khả dụng để đặt hàng.");
            }
            if (!selectedVariant) {
                throw new Error("Vui lòng chọn kích thước và màu sắc sản phẩm trước.");
            }
            const cartItem = cart?.items.find(item => item.variant_id === selectedVariant.id && item.size === selectedSize);
            const sumStock = (cartItem?.qty || 0) + (quantity || 1); //Tối thiểu thêm 1 sản phẩm
            if (sumStock > (selectedVariant.stock_qty)) {
                throw new Error("Kho hiện chỉ còn " + (selectedVariant.stock_qty) + " sản phẩm này, bạn đang đặt " + sumStock + " sản phẩm.");
            }
            await addItem(selectedVariant.id, selectedSize, quantity);
        } catch (error) {
            setIsError(true);
            setNotification(error instanceof Error ? error.message : "Đã có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
        }
    }
    return (
        <form className="flex gap-4">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
                <ButtonCompact onClickFunction={decreaseQuantity}>-</ButtonCompact>
                <input onChange={handleOnChange} type="number" value={quantity || ""} placeholder="1" max={999} className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-[2rem]" />
                <ButtonCompact onClickFunction={increaseQuantity}>+</ButtonCompact>
            </div>
            <button type="button"
                onClick={handleAddToCart}
                className={`
                    ${(isCustomer && product?.status && product.status !== 'inactive') ? "" : "cursor-not-allowed opacity-50"}
                    px-4 py-1 rounded-full hover:bg-orange-500 text-white bg-linear-to-tl from-amber-500 to-orange-600 hover:opacity-90
                    ${isError && "bg-red-500 hover:bg-red-500"} transition-all duration-100 ease-in-out`}>
                Thêm sản phẩm vào giỏ</button>
        </form>
    );
}

function ButtonCompact({ children, onClickFunction }: { children: React.ReactNode, onClickFunction: () => void }) {
    const buttonSize = "36px";
    return (
        <button type="button" onClick={onClickFunction} className={`rounded-full hover:bg-gray-200 p-1 transition-all duration-100 ease-in-out`}
            style={{ width: buttonSize, height: buttonSize }}>{children}</button>
    )
};