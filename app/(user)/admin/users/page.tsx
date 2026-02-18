'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Title, BaseUserPageLayout, sectionCSS, sectionGridCSS, Divider, GeneralButton } from "@/app/ui/user/general/general";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import adminUserService, { AdminUserResponse } from "@/service/adminUser.service";
import { useEffect } from "react";

export default function page({ }) {
    return (
        <BaseUserPageLayout>
            <Title>
                <p className="fontA2">Quản lý tài khoản</p>
                <GeneralButton href={"/admin/users/create"}>+ Tạo tài khoản</GeneralButton>
            </Title>
            <UserListSection />
        </BaseUserPageLayout>
    );
}

const headItemCSS = "py-4 fontA4 !font-semibold text-center";
const bodyItemCSS = "py-4 fontA4 text-center";

function UserListSection() {
    const setNoti = useNotificateArea().setNotification;

    const [userList, setUserList] = useState<AdminUserResponse[]>([]);
    async function fetchUserList() {
        try {
            const data = await adminUserService.getUsers();
            setUserList(data);
            console.log('Fetched user list:', data);
        }
        catch (error) {
            setNoti(error instanceof Error ? "Lỗi: " + error.message : "Đã có lỗi xảy ra khi lấy danh sách người dùng");
        }
    }
    async function lockUserAccount(userId: string) {
        try {
            const result = await adminUserService.deactiveUser(userId);
            setNoti("Đã khóa tài khoản người dùng thành công");
            setUserList((prevList) =>
                prevList.map((user) =>
                    user.id === userId
                        ? { ...user, status: 'banned' as const }
                        : user
                )
            );
        } catch (error) {
            setNoti(error instanceof Error ? "Lỗi: " + error.message : "Đã có lỗi xảy ra khi khóa tài khoản người dùng");
        }
    }

    async function restoreUserAccount(userId: string) {
        try {
            const result = await adminUserService.restoreUser(userId);
            setUserList((prevList) =>
                prevList.map((user) =>
                    user.id === userId
                        ? { ...user, status: 'active' as const }
                        : user
                )
            );
        } catch (error) {
            setNoti(error instanceof Error ? "Lỗi: " + error.message : "Đã có lỗi xảy ra khi mở khóa tài khoản người dùng");
        }
    }

    let mounted = false;
    useEffect(() => {
        if (mounted) return;
        mounted = true;
        fetchUserList();
    }, [])

    return (
        <div className={`UserListSection ${sectionCSS} grid gap-2`}>
            <table className="UserList w-full">
                <thead>
                    <ListHead />
                </thead>
                <tbody className="pb-4">
                    {userList.map((user) => (
                        <UserRow key={user.id} data={user} onBlock={() => lockUserAccount(user.id)} onUnBlock={() => restoreUserAccount(user.id)} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ListHead() {
    return (
        <tr>
            <th className={`${headItemCSS}`}>Tài khoản (Email)</th>
            <th className={`${headItemCSS}`}>Tên hiển thị</th>
            <th className={`${headItemCSS}`}>Số điện thoại</th>
            <th className={`${headItemCSS}`}>Trạng thái</th>
            <th className={`${headItemCSS} w-[180px]`}>Tùy chọn</th>
        </tr>
    );
}

function UserRow({ data, onBlock, onUnBlock }: { data: AdminUserResponse, onBlock: () => void, onUnBlock: () => void }) {
    function toggleBanUser() {
        if (data.status === 'active') {
            onBlock();
        } else {
            onUnBlock();
        }
    }
    return (
        <tr className="hover:bg-gray-100 rounded-lg">
            <td className={`${bodyItemCSS} text-center`}>
                <span className="font-medium">{data.email}</span>
            </td>

            {/* Tên hiển thị: ưu tiên full_name → name → "Chưa đặt tên" */}
            <td className={`${bodyItemCSS} text-center max-w-[30ch]`}>
                {data.full_name || data?.name || (
                    <span className="text-gray-400">Chưa cập nhật</span>
                )}
            </td>

            {/* Số điện thoại */}
            <td className={`${bodyItemCSS}`}>
                {data.phone || <span className="text-gray-400">Chưa cập nhật</span>}
            </td>

            {/* Trạng thái */}
            <td className={`${bodyItemCSS}`}>
                <span className={`px-3 py-1 rounded-full fontA5 font-medium ${data.status === "active"
                    ? 'bg-white text-orange-500 border-1 border-orange-400'
                    : 'bg-red-700 text-white'
                    }`}>
                    {data.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                </span>
            </td>
            {/* Tùy chọn */}
            <td className={`${bodyItemCSS}`}>
                <div className="flex items-center justify-center gap-3">

                    {/* Nút khóa/khôi phục */}
                    <button
                        onClick={toggleBanUser}
                        className={`p-1 cursor-pointer rounded hover:bg-gray-200 transition ${data.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        disabled={data.role === 'admin'}
                        title={data.role === 'admin' ? 'Không thể khóa admin' : ''}
                    >
                        <Image
                            src={data.status === 'active' ? '/icon/lock-exclamation.svg' : '/icon/lock-open.svg'}
                            width={24}
                            height={24}
                            alt={data.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        />
                    </button>

                    {/* Nút cập nhật */}
                    <Link
                        href={`/admin/users/edit/${data.id}`}
                        className={`p-1 rounded hover:bg-gray-200 transition ${data.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <Image
                            src={'/icon/float-left.svg'}
                            width={24}
                            height={24}
                            alt="Cập nhật"
                        />
                    </Link>
                </div>
            </td>
        </tr>
    );
}