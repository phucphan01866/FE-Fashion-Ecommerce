'use client'

import Image from "next/image";
import Link from "next/link";
import { sectionCSS, inputCSS, Divider } from "@/app/ui/user/general/general";
import "@/app/ui/user/style.css";
import { useEffect, useState } from "react";
import { useraddressList, addressType, userInfo, UserInfo } from "@/app/demo";
import { InputField } from "@/app/ui/general/Input/Input";
import { Title } from "@/app/ui/cart/General";
import { useAuth } from "@/context/AuthContext";
import { profileService, TypeProfileUpdate } from "@/service/profile.service";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useProfile } from "@/context/ProfileContext";
import adminUserService from "@/service/adminUser.service";
import { useParams, useRouter } from "next/navigation";

interface TypeFullProfileUpdate {
    full_name?: string, phone?: string, name?: string; email: string; id: string;
}

interface TypeUserProfileUpdate {
    full_name: string, phone: string, name: string;
}

export default function Page({ }) {
    const setNoti = useNotificateArea().setNotification;
    const [originUserData, setOriginUserData] = useState<TypeFullProfileUpdate>();
    const [isGoogleAccount, setIsGoogleAccount] = useState<boolean>(false);
    const { id } = useParams() as { id: string };
    async function fetchUserProfile() {
        try {
            const data = await adminUserService.getUser(id);
            console.log('Fetched user data:', data);
            setOriginUserData({
                full_name: data.full_name || "",
                name: data.name || "",
                phone: data.phone || "",
                email: data.email,
                id: data.id,
            });
            setIsGoogleAccount(data.google_id ? true : false);
        } catch (error) {
            setNoti(error instanceof Error ? "Lỗi: " + error.message : "Đã có lỗi xảy ra khi lấy thông tin người dùng");
        }
    }
    useEffect(() => {
        fetchUserProfile();
    }, []);
    if (!originUserData) {
        return <div>Đang tải thông tin người dùng...</div>;
    } else {
        return (
            <div className="orderPage px-4 py-2 flex flex-col gap-4">
                <PersonalInfoSection oldData={originUserData} isGGAcount={isGoogleAccount} fetchUserProfile={fetchUserProfile} />
            </div>
        );
    }

}



function PersonalInfoSection({ oldData, isGGAcount, fetchUserProfile }: { oldData: TypeFullProfileUpdate, isGGAcount: boolean, fetchUserProfile: () => Promise<void> }) {
    const btnCSS = `px-4 py-2 rounded-lg text-white w-full min-w-[30%]`;
    const [isEditProfile, setIsEditProfile] = useState(false);
    const [isEditEmail, setIsEditEmail] = useState(false);
    const { setNotification } = useNotificateArea();
    const [formData, setFormData] = useState<TypeUserProfileUpdate>({
        full_name: oldData?.full_name || "",
        name: oldData?.name || "",
        phone: oldData?.phone || "",
    });
    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    function validateData(data: TypeProfileUpdate) {
        const errors: { [key: string]: string } = {};
        if (data.full_name.trim() === "") {
            errors.full_name = "Họ tên không được để trống";
        }
        if (data.name.trim() === "") {
            errors.name = "Tên tài khoản không được để trống";
        }
        if (!data.phone || !data.phone.trim()) {
            errors.phone = "SĐT không được để trống!";
        } else {
            const cleanPhone = data.phone.replace(/\s/g, '');

            if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
                errors.phone = "SĐT không hợp lệ!";
            }
        }
        if (
            data.full_name.trim() === (oldData?.full_name?.trim() || "") &&
            data.name.trim() === (oldData?.name?.trim() || "") &&
            data.phone.trim() === (oldData?.phone?.trim() || "")
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
        try {
            validateData(formData);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : "Dữ liệu không hợp lệ, vui lòng kiểm tra lại!");
            return;
        }
        setFormErrors({});
        try {
            const res = await adminUserService.updateUserInfo(oldData.id, formData);
            fetchUserProfile();
            setIsEditProfile(false);
            setNotification("Update tài khoản thành công!")
        } catch (error) {
            setNotification("Update tài khoản không thành công!")
        }
    }

    const handleReset = () => {
        setFormData({
            full_name: oldData?.full_name || "",
            name: oldData?.name || "",
            phone: oldData?.phone || "",
        });
        setEmail(oldData.email || "");
        setFormErrors({});
    };

    const handleBackButton = () => {
        setIsEditProfile(false);
        setIsEditEmail(false);
        handleReset();
    }


    // Change reset email
    const [email, setEmail] = useState(oldData.email);
    const [emailError, setEmailError] = useState<string>("");
    const handleChangeMailForm = () => {
        if (isGGAcount) {
            setNotification("Không thể thay đổi email nếu tài khoản đăng ký bằng tài khoản Google");
            return;
        }
        setIsEditEmail(true);
        handleReset();
    }
    const validateEmail = () => {
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !email.trim()) {
                throw new Error("Email không được để trống!");
            }
            if (!emailRegex.test(email)) {
                throw new Error("Email không hợp lệ!");
            }
            return true;
        } catch (error) {
            setEmailError(error instanceof Error ? error.message : "Email không hợp lệ!");
            return false;
        }
    }
    const submitChangeEmail = async () => {
        try {
            if (!validateEmail()) { throw new Error(); }
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : "Dữ liệu email không hợp lệ, vui lòng kiểm tra lại!");
            return;
        }
        setFormErrors({});
        try {
            const res = await adminUserService.updateUserEmail(oldData.id, email);
            setIsEditProfile(false);
            setNotification("Update email thành công!")
            fetchUserProfile();
        } catch (error) {
            setNotification(error instanceof Error ? error.message : "Update email không thành công!")
        }
    }
    // /////////////////////////// Xóa tài khoản
    const [reason, setReason] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const router = useRouter();
    const [reasonError, setReasonError] = useState<string>('');

    async function handleDeleteClick() {
        const ok = confirm('Bạn có chắc chắn muốn xóa tài khoản này?');
        if (!ok) return;
        try {
            if (reason.trim() === '') {
                throw new Error('Vui lòng cung cấp lý do xóa tài khoản.');
            }
            await deleteUser();
            setNotification('Xóa tài khoản thành công');
            router.push('/admin/users');
        } catch (err) {
            setNotification(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi xóa tài khoản');
        }
    }

    async function deleteUser() {
        try {
            await adminUserService.deleteUserPermanent(oldData.id, reason);
        } catch (error) {
            throw error;
        }
    }
    return (
        <div className={`PersonalInfoSection flex flex-col gap-4 min-h-full ${sectionCSS}`}>
            <Title>THÔNG TIN TÀI KHOẢN</Title>
            <Divider />
            <form onSubmit={handleSubmit} className="grid grid-cols-[70%_1fr]">
                <div className="grid grid-cols-[auto_1fr] py-4 gap-8 items-center">
                    <label htmlFor="full_name">Họ tên người dùng</label>
                    <InputField
                        disabled={!isEditProfile}
                        id="full_name"
                        placeholder="VD: Nguyễn Văn A"
                        value={formData.full_name}
                        onChange={handleInfoChange}
                        error={formErrors.full_name}
                    />
                    <label htmlFor="name">Tên tài khoản</label>
                    <InputField
                        disabled={!isEditProfile}
                        id="name"
                        placeholder="VD: nguyenvanA"
                        value={formData.name}
                        onChange={handleInfoChange}
                        error={formErrors.name}
                    />
                    <label htmlFor="email">Tài khoản Email</label>
                    <InputField
                        disabled={!isEditEmail}
                        id="email"
                        placeholder="VD: example@gmail.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={emailError}
                    />
                    <label htmlFor="phone">Số điện thoại liên hệ</label>
                    <InputField
                        disabled={!isEditProfile}
                        id="phone"
                        placeholder="VD: 0912345678"
                        type="text"
                        value={formData.phone}
                        onChange={handleInfoChange}
                        error={formErrors.phone}
                    />
                </div>
                <div className="flex flex-col  gap-3 items-end-safe justify-between">
                    <div className="flex flex-col  gap-3 items-end-safe justify-start-safe">
                        {!isEditEmail && !isEditProfile && (
                            <>
                                <button type="button" onClick={handleOpenForm} className={`bg-orange-400 hover:opacity-80 ${btnCSS}`} >Cập nhật thông tin</button>
                                <button type="button" onClick={handleChangeMailForm} className={`bg-orange-400 hover:opacity-80 ${btnCSS}`} >Cập nhật Email</button>
                            </>
                        )}
                        {isEditProfile && (
                            <>
                                <button type="button" onClick={() => setIsEditProfile(!isEditProfile)} className={`${btnCSS} bg-stone-100 hover:bg-stone-200 !text-gray-500 hover:!text-gray-600`} >Hủy</button>
                                <button type="button" onClick={handleReset} className={`bg-white outline-1 outline-orange-300 !text-gray-500 hover:outline-orange-600 hover:!text-gray700 ${btnCSS}`} >Đặt lại</button>
                                <button type="submit" className={`bg-orange-400 hover:opacity-80 ${btnCSS}`} >Lưu thông tin</button>
                            </>
                        )}
                        {isEditEmail && (
                            <>
                                <button type="button" onClick={() => setIsEditEmail(!isEditEmail)} className={`${btnCSS} bg-stone-100 hover:bg-stone-200 !text-gray-500 hover:!text-gray-600`} >Hủy</button>
                                <button type="button" onClick={handleReset} className={`bg-white outline-1 outline-orange-300 !text-gray-500 hover:outline-orange-600 hover:!text-gray700 ${btnCSS}`} >Đặt lại</button>
                                <button type="button" onClick={submitChangeEmail} className={`bg-orange-400 hover:opacity-80 ${btnCSS}`} >Lưu Email</button>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        {!isDeleting && (
                            <button
                                type="button"
                                onClick={() => setIsDeleting(true)}
                                className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 font-medium text-white">
                                Xóa tài khoản
                            </button>
                        )}
                        {isDeleting && (
                            <>
                                <InputField id="reason" label="Lý do xóa tài khoản" placeholder="Nhập lý do ở đây" value={reason} onChange={(e) => setReason(e.target.value)} error={reasonError} />
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 font-medium text-white">
                                    Xác nhận xóa tài khoản
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsDeleting(false); setReason(''); setReasonError(''); }}
                                    className="px-3 py-2 rounded-md border-1 border-red-600 hover:border-red-700 hover:bg-red-50 font-medium text-red-600">
                                    Tôi không muốn xóa nữa
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
    function handleOpenForm() {
        setIsEditProfile(true);
        handleReset();
    }
}

