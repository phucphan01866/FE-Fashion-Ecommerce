'use client'

import { blockContainerCSS, Title, Divider } from "./General";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { InputSelect, InputField, baseInputBlockCSS } from "../general/Input/Input";

import BasicLoadingSkeleton, { SpinLoadingSkeleton } from "../general/skeletons/LoadingSkeleton";
import { paymentMethodList } from "@/context/CartContext";
import { ToolTip } from "../user/general/general";
import { useDragScroll } from "@/hooks";
import { userPromotionService, Promotion, emptyPromotion } from "@/service/promotion.service";
import Link from "next/link";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useRouter } from "next/navigation";
import addressService, { emptyAdress, emptyAdress1, TypeAddress } from "@/service/address.service";
import { emptyPreviewPromotion } from "@/service/promotion.service";
import { select } from "framer-motion/client";

export default function RightCart() {
    const { setNotification } = useNotificateArea();
    const [addressList, setAddressList] = useState<TypeAddress[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<TypeAddress>(emptyAdress);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const router = useRouter();

    async function fetchUserAddresses(): Promise<TypeAddress[]> {
        try {
            const addresses = await addressService.getUserAddresses();
            if (addresses.length === 0) {
                setAddressList([emptyAdress]);
            }
            else {
                setAddressList(addresses);
            }
            setSelectedAddress(addresses.find((addr: TypeAddress) => addr.is_default) || addresses[0] || emptyAdress);
            return addresses;
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi tải địa chỉ người dùng.');
        }
        return [emptyAdress];
    }
    useEffect(() => {

        const loadEffect = async () => {
            const list = await fetchUserAddresses();
            // if (list[0] === emptyAdress || list[0] === emptyAdress1) {
            if (list[0] === emptyAdress || list[0] === emptyAdress1 || list.length === 0) {
                router.replace(`/customer/address?create=true&prev=${encodeURIComponent('/cart')}`);
                setNotification("Vui lòng thêm địa chỉ giao hàng");
            } else {
                setLoadingAddress(false);
            }
        }
        loadEffect();
    }, [router]);
    return (
        <div className={`Right ${blockContainerCSS} flex flex-col gap-4 !px-9`}>
            <Title>Thông tin thanh toán</Title>
            <Divider />
            {loadingAddress ? <SpinLoadingSkeleton /> : <AddressArea addressList={addressList} selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} />}
            <PaymentArea />
            <PromotionInputArea />
            <RightPriceArea selectedAddress={selectedAddress} />
        </div>
    );
}

function PromotionInputArea() {
    const dragScrollRef = useDragScroll();
    const { selectedPromotionCode, setSelectedPromotionCode, cart, setPreviewItemList, setPreviewPromotion } = useCart();
    async function getPromotions() {
        try {
            const data = await userPromotionService.checkPromotionCode(cart?.subtotal || 0);
            // console.log(data);
            setPromotions(data);
        } catch (error) {
            console.log('Lỗi khi lấy danh sách khuyến mãi:', error);
        }
    }
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    useEffect(() => {
        getPromotions();
    }, [cart]);
    function handleDBClick(promotion: Promotion) {
        if (selectedPromotionCode === promotion) {
            setSelectedPromotionCode(emptyPromotion);
            setPreviewPromotion(emptyPreviewPromotion);
            setSelectedPromotionCode(emptyPromotion);
        }
        else {
            setPreviewItemList(promotion);
        }
        // console.log(promotion);
        return;
    }
    const [manualCode, setManualCode] = useState<string>("");
    const handlePromotionCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManualCode(e.target.value.trim().toUpperCase());
    };
    const { setNotification } = useNotificateArea();
    async function checkAndSavePromotionCode() {
        try {
            if (cart === null || cart.items.length === 0) {
                throw new Error("Giỏ hàng trống, chưa thể áp dụng mã giảm giá");
            }
            const res = await userPromotionService.checkPromotionCodeAndSave(manualCode, cart?.subtotal || 0);
            if (res.valid !== true) throw new Error(res.message);
            // console.log(res);
            setSelectedPromotionCode(res.promotion!);
            setPreviewItemList(res.promotion!);
            getPromotions();
            setManualCode("");
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi áp dụng mã khuyến mãi');
        }
    }
    return (
        <div className={`"w-full flex flex-col gap-2 rounded-md py-3 border-2 border-gray-200 bg-white`}>
            <div ref={dragScrollRef} className={`
                ${promotions && (cart && cart?.items && cart?.items.length > 0) ? '' : 'hidden'}
                ${baseInputBlockCSS} !border-0 !p-0 !px-4 overflow-hidden  flex-row gap-2`}>
                {/* <PromotionCode isActive={true} /> */}
                {promotions && (cart && cart?.items && cart?.items.length > 0) && promotions.map((promo, index) => {
                    return <PromotionCode
                        isActive={selectedPromotionCode?.code === promo.code}
                        key={index} value={promo.value}
                        description={promo.description || ""}
                        handleDBClick={() => handleDBClick(promo)}
                        postFix={promo.type === "amount" ? "VNĐ" : "%"}
                        min={promo.min_order_value || undefined}
                        max={promo.max_discount_value || undefined} />
                })}
            </div>
            <div className="flex px-4 gap-2">
                <InputField
                    id="promocode"
                    label="Mã khuyến mãi"
                    placeholder="Nhập mã khuyến mãi"
                    type="text"
                    value={manualCode}
                    onChange={handlePromotionCodeChange}
                />
                <button onClick={() => { checkAndSavePromotionCode() }} className="bg-amber-500 hover:bg-orange-500 cursor-pointer p-3 rounded-md">
                    <Image
                        src="/icon/checks.svg"
                        alt="apply"
                        width={24}
                        height={24}
                        className="brightness-0 invert"
                    />
                </button>
            </div>
        </div>
    )
}

function PromotionCode({ isActive = false, value, description, handleDBClick, postFix, min, max }: { isActive?: boolean, value: number, description: string, handleDBClick: () => void, postFix: string, min?: number, max?: number }) {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
        <div
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onDoubleClick={() => handleDBClick()}
            className={`relative min-w-[200px] flex gap-2 px-3 py-2 rounded-md border-1 border-orange-200 ${isActive ? "bg-amber-500 border-2 !border-amber-400 outline-2 outline-white text-white" : ""}`}>
            <div>
                {!showTooltip ? (
                    <>
                        <p className="fontA5 !font-semibold">Mã giảm {postFix !== '%' ? Math.floor(value).toLocaleString('vi-VN') : value}{postFix}</p>
                        <p className="fontA5 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">{description}</p>
                    </>
                ) : (
                    <>
                        <p className="fontA5 !font-medium whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">Tối thiểu : {min ? Math.floor(min).toLocaleString('vi-VN') + 'đ' : 'không yêu cầu'}</p>
                        <p className="fontA5 !font-medium whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">Giảm tối đa : {max ? Math.floor(max).toLocaleString('vi-VN') + 'đ' : 'không giới hạn'}</p>
                    </>
                )}
            </div>
        </div>
    )
}

function AddressArea({ addressList, selectedAddress, setSelectedAddress }: { addressList: TypeAddress[], selectedAddress: TypeAddress, setSelectedAddress: React.Dispatch<React.SetStateAction<TypeAddress>> }) {
    // const { selectedAddress, addressList, setSelectedAddress, fetchUserAddresses, setLoadingAddress } = useCart();
    const [isShowAddressList, setIsShowAddressList] = useState(false);

    const currentAddressItemCSS = `flex justify-between gap-4 items-baseline fontA4 my-1`;
    const buttonCSS = "flex justify-between items-center-safe gap-3 px-3 py-3 rounded-md transition-all duration-200 ease-in-out";
    return (
        addressList.length === 0 ? <BasicLoadingSkeleton /> : (
            <>
                {/* <InputSelect
                    isAdditionalButton={true}
                    onChange={() => setSelectedAddress(addressList.find(address => address.id === selectedAddress.id)!)}
                    defaultItem={selectedAddress.id}
                    id="address" label="Địa Chỉ Giao Hàng" 
                    items={addressList.map(address => ({ label: address.tag + ' / ' + address.receive_name + ' / ' + address.phone + ' / ' + address.address, content: address.id }))}
                >
                    <Link href={`/customer/address?create=true&prev=${encodeURIComponent('/cart')}`} className="block capitalize px-4 py-2 w-full text-left hover:bg-gray-100 fontA5">+ Nhập địa chỉ mới</Link>
                </InputSelect> */}
                <div className={`${baseInputBlockCSS} `}>
                    <p className="fontA5">Địa chỉ giao hàng</p>
                    <p className="fontA2 font-semibold!">{selectedAddress.tag}</p>
                    <Divider />
                    <div className={`${currentAddressItemCSS}`}>
                        <p className="fontA5">Tên người nhận</p>
                        <p className="fontA4 font-medium!">{selectedAddress.receive_name}</p>
                    </div>
                    <div className={`${currentAddressItemCSS}`}>
                        <p className="fontA5">Số điện thoại</p>
                        <p className="fontA4 font-medium!">{selectedAddress.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3")}</p>
                    </div>
                    <div className={`${currentAddressItemCSS}`}>
                        <p className="min-w-fit fontA5">Địa chỉ :</p>
                        <p className="text-right fontA4 font-medium!">{selectedAddress.address}</p>
                    </div>
                    <Divider />
                    <button type="button"
                        onClick={() => { setIsShowAddressList(prev => !prev) }}
                        className="flex justify-end-safe p-2 hover:bg-gray-100 rounded-md">
                        <Image src="/icon/chevron-down.svg"
                            height={24}
                            width={24}
                            alt="see more"
                            className={`transition-all duration-250 ease-in-out ${isShowAddressList ? 'rotate-180' : ''}`}
                        />
                    </button>
                    {isShowAddressList && (
                        <div className="flex flex-col">
                            {addressList.map((address) => {
                                return (
                                    <button key={address.id} type="button" onClick={() => { setSelectedAddress(address) }} className={`${buttonCSS} first:mt-0 mt-2 hover:bg-gray-100 hover:opacity-95`}>
                                        <p className="truncate fontA5 text-gray-500">
                                            <span className="fontA3 font-semibold! text-gray-700">{address.tag}</span>{` / `}
                                            <span className="">{address.receive_name}</span>{` / `}
                                            <span>{address.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3")}</span>{` / `}
                                            <span>{address.address}</span>
                                        </p>
                                        <div
                                            className={`
                                        hover:scale-105 transition-all duration-100 ease-in-out
                                        relative block w-3.5 h-3.5 rounded-full bg-white outline-1 outline-gray-500 aspect-square
                                        ${address.id === selectedAddress.id ? "scale-105 hover:scale-115" : null}
                                        `}>
                                            {address.id === selectedAddress.id && (
                                                <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-full h-full scale-75 bg-black rounded-full" />
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                            <Link
                                href={`/customer/address?create=true&prev=${encodeURIComponent('/cart')}`}
                                className={`${buttonCSS} hover:mx-2 py-2! fontA5 text-gray-700 hover:text-white hover:bg-orange-400`}>Thêm địa chỉ mới</Link>
                        </div>
                    )}
                </div>
            </>
        )
    );
}


function PaymentArea() {
    const { currentPaymentMethod, setCurrentPaymentMethod, paymentMethodList } = useCart();
    return (
        <div className={`${baseInputBlockCSS} focus-within:!ring-0 focus-within:ring-orange-400 focus-within:!border-gray-200 flex flex-col gap-2 p-4`}>
            <p className="fontA5">Hình thức thanh toán: <span className="fontA4 !font-semibold">{paymentMethodList.find(method => method.name === currentPaymentMethod)?.label}</span></p>
            <div className="flex gap-3">
                <PaymentMethodList handleOnClick={(selectedMethod: string) => { setCurrentPaymentMethod(selectedMethod) }} currentMethod={currentPaymentMethod} />
            </div>
        </div>
    );
}

function PaymentMethodList({ handleOnClick, currentMethod }: { handleOnClick: (method: string) => void, currentMethod: string }) {
    return (
        paymentMethodList.map((method, index) => (
            <PaymentSelectButton key={index} handleOnClick={handleOnClick} currentMethod={currentMethod} meThodInList={method} />
        ))
    );
}

function PaymentSelectButton({ handleOnClick, currentMethod, meThodInList }: { handleOnClick: (method: string) => void, currentMethod: string, meThodInList: { name: string; label: string; imgSrc: string } }) {
    const [isTooltipHovered, setIsTooltipHovered] = useState(false);
    const iconSize = { width: 90, height: 40 };
    return (
        <button type="button" onClick={() => handleOnClick(meThodInList.name)}
            onMouseEnter={() => setIsTooltipHovered(true)}
            onMouseLeave={() => setIsTooltipHovered(false)}
            className={`relative w-[90px] h-[40px] px-2 py-1 border-2 border-gray-200 rounded-md ${meThodInList.name === currentMethod ? "border-orange-400" : "hover:border-orange-300 opacity-90"}`}>
            <Image src={meThodInList.imgSrc} width={iconSize.width / 2} height={iconSize.height / 2} alt={meThodInList.name} className="w-full h-full object-contain" />
            {isTooltipHovered && <ToolTip>
                <p>{meThodInList.label}</p></ToolTip>}
        </button>
    )
}

function RightPriceArea({ selectedAddress }: { selectedAddress: TypeAddress }) {
    const { cart, createOrder, previewPromotion, isCreateOrder } = useCart();
    const totalWithShip = (cart?.items && cart?.items.length > 0 && cart?.subtotal + 30000 || 0);
    return (
        <div className="py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <p className="fontA4 !font-medium">Tổng cộng :</p>
                    <p className="fontA4 !font-medium">Phí vận chuyển :</p>
                    <p className="fontA3 !font-semibold !leading-normal">Thành tiền :</p>
                </div>
                <div className="text-right flex flex-col gap-2">
                    <p className="fontA4 !font-medium">{(cart?.subtotal || 0).toLocaleString("vi-VN")}đ</p>
                    <p className="fontA4 !font-medium">{(30000).toLocaleString("vi-VN")}đ</p>
                    {/* <p className="fontA3 !font-semibold !leading-normal">{totalWithShip.toLocaleString("vi-VN")}đ</p> */}
                    <p className="fontA3 !font-semibold !leading-normal">
                        {previewPromotion && previewPromotion.final_total > 0 ? (
                            <>
                                <span className="fontA5 font-semibold line-through mr-3">({totalWithShip.toLocaleString("vi-VN")})</span>
                                <span className="text-orange-600">{Math.floor(previewPromotion.final_total).toLocaleString("vi-VN")}đ</span>
                            </>
                        ) : (
                            <>{Math.floor(totalWithShip).toLocaleString("vi-VN")}đ</>
                        )}
                    </p>
                </div>
            </div>
            <button onClick={() => createOrder(selectedAddress)}
                className={`w-full my-4 p-3 rounded-sm outline-1 outline-amber-200 border-3 border-white bg-orange-500 fontA3 text-white cursor-pointer
            ${isCreateOrder ? 'cursor-not-allowed opacity-70' : 'hover:bg-orange-600 hover:outline-orange-300 transition-all duration-150 ease-in-out'}`}>
                {isCreateOrder ? 'Đang xử lý đơn hàng...' : 'Đặt hàng ngay'}
            </button>
        </div >
    )
}