'use client'

import Image from "next/image";
import Link from "next/link";
import { sectionCSS, inputCSS } from "@/app/ui/user/general/general";
import "@/app/ui/user/style.css";
import { useState } from "react";
import { useraddressList, addressType, userInfo, UserInfo } from "@/app/demo";
import { InputField } from "@/app/ui/general/Input/Input";


export default function page({ }) {
    return (
        <div className="orderPage px-4 py-2 flex flex-col gap-4">
            <Title>Thông tin tài khoản</Title>
            <PersonalInfoSection />
            <AddressInfoSection />
        </div>
    );
}

function Title({ children }: { children: React.ReactNode; }) {
    return (
        <h2 className="fontA2">{children}</h2>
    )
}

function PersonalInfoSection() {
    return (
        <div className={`PersonalInfoSection flex flex-col gap-4 ${sectionCSS}`}>
            <Title>THÔNG TIN TÀI KHOẢN</Title>
            <Divider />
            <form action="" className="max-w-[70%]">
                <div className="grid grid-cols-[auto_1fr] gap-8 items-center">
                    <label htmlFor="">Họ tên người dùng</label>
                    <InputField
                        id="full_name"
                        placeholder="VD: Nguyễn Văn A"
                        defaultValue={""}
                    />
                    <label htmlFor="">Tên tài khoản</label>
                    <InputField
                        id="user_name"
                        placeholder="VD: nguyenvanA"
                        defaultValue={""}
                    />
                    <label htmlFor="">Tài khoản Email</label>
                    <InputField
                        id="email"
                        placeholder="VD: example@gmail.com"
                        type="email"
                        defaultValue={""}
                    />
                    <label htmlFor="">Số điện thoại liên hệ</label>
                    <InputField
                        id="phone"
                        placeholder="VD: 0912345678"
                        type="tel"
                        defaultValue={""}
                    />
                </div>
            </form>
        </div>
    )

}

function AddressInfoSection() {
    return (
        <div className={`addressInfoSection ${sectionCSS}`}>
            {useraddressList.map((address, index) => (
                <div key={index}>
                    {index > 0 ? <Divider /> : null}
                    <AddressItem addressInfo={address} />
                </div>
            ))}

        </div>
    )
}

function AddressItem({ addressInfo }: { addressInfo: addressType }) {
    const [isShowDetail, setIsShowDetail] = useState(false);
    const handleToggleShow = () => {
        setIsShowDetail(!isShowDetail);
    }
    return (
        <div className="AddressItem">
            <PreviewSection addressInfo={addressInfo} toggleShowDetail={handleToggleShow} />
            {isShowDetail ? <DetailSection addressInfo={addressInfo} /> : null}
        </div>
    )
}

function PreviewSection({ addressInfo, toggleShowDetail }: { addressInfo: addressType, toggleShowDetail: () => void }) {

    const iconSize = 20;
    return (
        <div className={`PreviewSection my-4 grid grid-cols-[auto_auto] justify-between gap-3`}>
            <div className="flex flex-col gap-4">
                <p className="block font-a3">
                    {addressInfo.addressName}
                </p>
                <p className="font-a5 flex">{addressInfo.receiverName || userInfo.fullName} / {addressInfo.receiverPhone || userInfo.phoneNumber} / {addressInfo.detailaddress}, {addressInfo.province}</p>
            </div>
            <div className="flex gap-4 items-center">
                <ButtonSetDefault isDefault={addressInfo.isDefault} />
                <button type="button" onClick={() => toggleShowDetail()} className="w-8 h-8 flex justify-center items-center aspect-square rounded-full hover:bg-gray-100"><Image src="/icon/settings.svg" alt="show" width={iconSize} height={iconSize} /></button>
            </div>
        </div>
    );
}

function ButtonSetDefault({ isDefault }: { isDefault: boolean }) {
    return (
        <button className={`ButtonSetDefault font-a5 !font-medium px-3 py-2 rounded-md ${isDefault ? "bg-gray-200" : "bg-orange-300"}`}>
            {isDefault ? "Địa chỉ mặc định" : "Đặt làm mặc định"}
        </button>
    );
}

function DetailSection({ addressInfo }: { addressInfo: addressType }) {
    return (
        <form action={""} className={`DetailSection`}>
            <label>Tên địa điểm</label>
            <input className={`${inputCSS}`} type="text" name="" id="" defaultValue={addressInfo.addressName} />
            <label>Tên người nhận</label>
            <input className={`${inputCSS}`} type="text" name="" id="" defaultValue={addressInfo.receiverName || userInfo.fullName} />
            <label>Số điện thoại người nhận</label>
            <input className={`${inputCSS}`} type="tel" name="" id="" defaultValue={addressInfo.receiverPhone || userInfo.phoneNumber} />
            <div className="grid grid-cols-[1fr_1fr]">
                <div>
                    <label>Tỉnh/Thành phố</label>
                    <select className={`${inputCSS}`} name="" id="" defaultValue={addressInfo.province}>
                        <option value="">HCM</option>
                        <option value="">Tây Ninh</option>
                    </select>
                </div>
                <div>
                    <label>Phường/Xã</label>
                    <select className={`${inputCSS}`} name="" id="" defaultValue={addressInfo.village}>
                        <option value="">HCM</option>
                        <option value="">Tây Ninh</option>
                    </select>
                </div>
            </div>
            <label>Địa chỉ chi tiết</label>
            <input className={`${inputCSS}`} type="text" name="" id="" defaultValue={addressInfo.detailaddress} />
            <button className="p-2 m-2 rounded-md bg-orange-200 border-2 border-orange-300">Cập nhật địa chỉ</button>
        </form>
    );
}

function Divider() {
    return (
        <div className="Divider border-1 border-gray-100 w-full"></div>
    );
}