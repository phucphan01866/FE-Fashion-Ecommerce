'use client'

import Image from "next/image";
import Link from "next/link";
import { sectionCSS, inputCSS, Divider } from "@/app/ui/user/general/general";
import "@/app/ui/user/style.css";
import { useEffect, useState } from "react";
import { InputField, ControllableInputSelect } from "@/app/ui/general/Input/Input";
import { useAuth } from "@/context/AuthContext";
import { profileService, TypeProfileUpdate } from "@/service/profile.service";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useProfile } from "@/context/ProfileContext";
import { useRouter } from "next/navigation";
import { Title } from "@/app/ui/user/general/general";
import { Title as SmallTitle } from "@/app/ui/cart/General";
import { TypePersonalData } from "@/service/profile.service";


export default function page({ }) {
    return (
        <div className="orderPage px-4 py-2 flex flex-col gap-4">
            <Title>HỒ SƠ TÀI KHOẢN</Title>
            <AccountInfoSection />
            <PersonalInfoSection />
        </div>
    );
}

const btnCSS = `px-4 py-2 rounded-lg text-white min-w-[30%]`;

function AccountInfoSection() {
    const [isEditProdile, setIsEditProfile] = useState(false);
    const { userProfile, setUserProfile } = useProfile();
    const { setNotification } = useNotificateArea();
    const [formData, setFormData] = useState<TypeProfileUpdate>({
        full_name: userProfile?.full_name || "",
        name: userProfile?.name || "",
        phone: userProfile?.phone || "",
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const handleReset = () => {
        setFormData({
            full_name: userProfile?.full_name || "",
            name: userProfile?.name || "",
            phone: userProfile?.phone || "",
        });
        setFormErrors({});
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    useEffect(() => {
        setFormData({
            full_name: userProfile?.full_name || "",
            name: userProfile?.name || "",
            phone: userProfile?.phone || "",
        })
    }, [userProfile]);
    function validateData(data: TypeProfileUpdate) {
        const errors: { [key: string]: string } = {};
        if (data.full_name.trim() === "") {
            errors.full_name = "Họ tên không được để trống";
        }
        if (data.name.trim() === "") {
            errors.name = "Tên tài khoản không được để trống";
        }
        if (data.phone.trim() === "") {
            errors.phone = "Số điện thoại không được để trống";
        } else {
            const cleanPhone = data.phone.replace(/\s.,/g, '');
            if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
                errors.phone = "Số điện thoại không hợp lệ";
            }
        }
        if (
            data.full_name.trim() === (userProfile?.full_name?.trim() || "") &&
            data.name.trim() === (userProfile?.name?.trim() || "") &&
            data.phone.trim() === (userProfile?.phone?.trim() || "")
        ) {
            throw new Error("Bạn chưa thay đổi thông tin nào");
        }
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            throw new Error();
        }
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        try {
            validateData(formData);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : "Dữ liệu không hợp lệ, vui lòng kiểm tra lại!");
            return;
        }

        try {
            const res = await profileService.updateProfile(formData);
            // console.log(res);
            setUserProfile(res);
            setIsEditProfile(false);
            setNotification("Update tài khoản thành công!")
        } catch (error) {
            setNotification("Update tài khoản không thành công!")
        }
    }

    const { logout } = useAuth();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    async function handleDeleteClick() {
        const confirm = window.confirm("Bạn có chắc chắn muốn xóa tài khoản không? Hành động này không thể hoàn tác.");
        if (!confirm) return;
        try {
            await profileService.deleteProfile();
            setNotification("Xóa tài khoản thành công, cảm ơn bạn đã chọn chúng tôi!")
            logout();
            router.push("/");
        } catch (error) {
            setNotification("Xóa tài khoản không thành công!")
        }
    }
    // useEffect(() => { console.log(userProfile); }, [isEditProdile]);
    return (
        <>
            <div className={`AccountInfoSection flex flex-col gap-4 ${sectionCSS}`}>
                <SmallTitle>Thông tin tài khoản</SmallTitle>
                <Divider />
                <form onSubmit={handleSubmit} className="grid grid-cols-[70%_1fr]">
                    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-4 items-center">
                        <label htmlFor="">Họ tên người dùng</label>
                        <InputField
                            disabled={!isEditProdile}
                            id="full_name"
                            placeholder="VD: Nguyễn Văn A"
                            value={formData.full_name}
                            onChange={handleChange}
                            error={formErrors.full_name}
                        />
                        <label htmlFor="">Tên tài khoản</label>
                        <InputField
                            disabled={!isEditProdile}
                            id="name"
                            placeholder="VD: nguyenvanA"
                            value={formData.name}
                            onChange={handleChange}
                            error={formErrors.name}
                        />
                        <label htmlFor="">Tài khoản Email</label>
                        <InputField
                            disabled={true}
                            id="email"
                            placeholder="VD: example@gmail.com"
                            type="email"
                            defaultValue={userProfile?.email || ""}
                        />
                        <label htmlFor="">Số điện thoại liên hệ</label>
                        <InputField
                            disabled={!isEditProdile}
                            id="phone"
                            placeholder="VD: 0912345678"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            error={formErrors.phone}
                        />
                    </div>
                    <div className="flex flex-col items-end-safe">
                        <div className="w-fit h-full flex flex-col gap-3 items-end-safe justify-between">
                            {isEditProdile ? (
                                <div className="flex flex-col gap-3">
                                    <button type="button" onClick={() => setIsEditProfile(!isEditProdile)} className={`${btnCSS} bg-stone-100 hover:bg-stone-200 !text-gray-500 hover:!text-gray-600`} >Hủy</button>
                                    <button type="button" onClick={handleReset} className={`bg-white outline-1 outline-orange-300 !text-gray-500 hover:outline-orange-600 hover:!text-gray700 ${btnCSS}`} >Đặt lại</button>
                                    <button type="submit" className={`bg-orange-400 hover:bg-orange-500 hover:text-white ${btnCSS}`} >Lưu</button>
                                </div>
                            ) : (
                                <button type="button" onClick={handleOpenForm} className={`bg-orange-400 hover:bg-orange-500 hover:text-white ${btnCSS}`} >Cập nhật</button>
                            )}
                            {isDeleting ? (
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={handleDeleteClick}
                                        className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 font-medium text-white">
                                        Xác nhận xóa tài khoản
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsDeleting(false); handleReset(); }}
                                        className="px-3 py-2 rounded-md border-1 border-red-600 hover:border-red-700 hover:bg-red-50 font-medium text-red-600">
                                        Tôi không muốn xóa nữa
                                    </button>
                                </div>
                            ) :
                                <button type="button" onClick={handleBeginDeleteAccount} className={`transition-all duration-250 ease-in-out opacity-25 hover:opacity-80 bg-red-600 ${btnCSS}`} >Xóa tài khoản</button>
                            }
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
    function handleOpenForm() {
        setIsEditProfile(true);
        handleReset();
    }
    function handleBeginDeleteAccount() {
        setIsDeleting(true);
        handleReset();
    }
}

function PersonalInfoSection() {
    const { personalData, updatePersonalDataField } = useProfile();
    return (
        <div className={`AccountInfoSection flex flex-col gap-4 ${sectionCSS}`}>
            <div className="flex gap-8 justify-between items-baseline">
                <SmallTitle>Thông tin cá nhân</SmallTitle>
            </div>
            <Divider />

            <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr] gap-4 max-w-[90%] items-center">
                {/* Giới tính */}
                <label className="font-medium">Giới tính</label>
                <ControllableInputSelect
                    id="gender"
                    onClick={(value) =>
                        updatePersonalDataField("gender", value)
                    }
                    bonusCSS="!w-fit"
                    currentValue={personalData?.gender || ""}
                    items={[
                        { content: "", label: "Chọn giới tính" },
                        { content: "male", label: "Nam" },
                        { content: "female", label: "Nữ" },
                        { content: "other", label: "Khác" },
                    ]}
                    hiddenItems={[""]}
                />
                <div className="col-span-4" />

                {/* Chiều cao + Cân nặng */}
                <label htmlFor="height">Chiều cao</label>
                <InputField
                    id="height"
                    type="number"
                    placeholder="VD: 165"
                    bonusCSS="max-w-[150px]"
                    direction="horizontal"
                    value={personalData?.height ?? ""} // sửa
                    onChange={(e) => updatePersonalDataField("height", e.target.value ? Number(e.target.value) : null)}
                    unit="cm"
                />

                <label htmlFor="weight">Cân nặng</label>
                <InputField
                    id="weight"
                    type="number"
                    placeholder="VD: 55"
                    bonusCSS="max-w-[150px]"
                    direction="horizontal"
                    value={personalData?.weight || ""} // sửa
                    onChange={(e) => updatePersonalDataField("weight", e.target.value ? Number(e.target.value) : null)}
                    unit="kg"
                />
                <div className="col-span-2"></div>
                {/* 3 vòng */}
                <label htmlFor="bust">Vòng 1 (ngực)</label>
                <InputField
                    id="bust"
                    type="number"
                    placeholder="VD: 86"
                    bonusCSS="max-w-[150px]"
                    direction="horizontal"
                    value={personalData?.bust ?? ""}
                    onChange={(e) => updatePersonalDataField("bust", e.target.value ? Number(e.target.value) : null)}
                    unit="cm"
                />

                <label htmlFor="waist">Vòng 2 (eo)</label>
                <InputField
                    id="waist"
                    type="number"
                    placeholder="VD: 64"
                    bonusCSS="max-w-[150px]"
                    direction="horizontal"
                    value={personalData?.waist ?? ""}
                    onChange={(e) => updatePersonalDataField("waist", e.target.value ? Number(e.target.value) : null)}
                    unit="cm"
                />

                <label htmlFor="hip">Vòng 3 (mông)</label>
                <InputField
                    id="hip"
                    type="number"
                    placeholder="VD: 90"
                    bonusCSS="max-w-[150px]"
                    direction="horizontal"
                    value={personalData?.hip ?? ""}
                    onChange={(e) => updatePersonalDataField("hip", e.target.value ? Number(e.target.value) : null)}
                    unit="cm"
                />
            </div>
        </div>
    )
}

