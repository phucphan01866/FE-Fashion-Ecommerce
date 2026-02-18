const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import Cookies from 'js-cookie';
import { RegisterData } from '@/service/auth.service';

export interface CreateUserBody {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
}

export interface UpdateUserBody {
    full_name?: string;
    phone?: string;
    name?: string;
}

export interface ChangeEmailBody {
    email: string;
}

export interface AdminUserResponse {
    id: string;
    email: string;
    name: string | null;
    full_name: string | null;
    phone: string | null;
    role: "customer" | "admin";
    status: "active" | "banned";
    created_at: string;
    google_id?: string | null;
}

export const adminUserService = {
    // async getUserAddresses() {
    //     const token = Cookies.get('accessToken');
    //     const response = await fetch(`${API_URL}/user/addresses`, {
    //         method: 'GET',
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //         },
    //     })
    //     if (!response.ok) {
    //         throw new Error(`Lỗi không lấy được danh sách : ${response.statusText}`);
    //     }
    //     const data = await response.json();
    //     return data.data;
    // },

    // async addUserAddress(data: TypeAddressPayload) {
    //     const token = Cookies.get('accessToken');
    //     const response = await fetch(`${API_URL}/user/addresses`, {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(data),
    //     })
    //     if (!response.ok) {
    //         throw new Error(`Lỗi khi tạo địa chỉ nhận hàng : ${response.statusText}`);
    //     }
    //     const result = await response.json();
    //     console.table(result);
    //     return { newAddress: result.address, message: "Đã thêm địa chỉ nhận hàng mới!" };
    // },
    async getUsers(): Promise<AdminUserResponse[]> {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`,
            }
        })
        if (!response.ok) {
            throw new Error(`Lỗi không lấy được danh sách người dùng: ${response.statusText}`);
        }
        const data = await response.json();
        const returnData = data.users;
        return returnData;
    },
    async getUser(id: string): Promise<AdminUserResponse> {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/users/${encodeURI(id)}`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${token}`,
            }
        })
        if (!response.ok) {
            throw new Error(`Lỗi không lấy được thông tin người dùng: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    },
    async createUser(regData: RegisterData) {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify(regData);
        console.log('Create user from admin payload: ', body);
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }, body
        })
        if (!response.ok) {
            const result = await response.json();
            if (result.message === "Valid email is required") {
                throw new Error("Cú pháp Email không hợp lệ!");
            } else if (result.message === "Email already exists") {
                throw new Error("Email này đã được đăng ký trước đó!");
            } else throw new Error(`Lỗi khi tạo người dùng mới: ${response.statusText}`);
        }
        const data = await response.json();
        return data.message;
    },
    async updateUserInfo(id: string, payload: UpdateUserBody): Promise<AdminUserResponse> {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify(payload);
        console.log('Update payload:', body);
        const response = await fetch(`${API_URL}/admin/users/${encodeURI(id)}`, {
            method: 'PUT',
            headers: {
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body
        })
        if (!response.ok) {
            throw new Error(`Lỗi không cập nhật được thông tin người dùng: ${response.statusText}`);
        }
        const data = await response.json();
        return data.user;
    },
    async deactiveUser(id: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/users/${encodeURI(id)}/deactivate`, {
            method: 'POST',
            headers: {
                'authorization': `Bearer ${token}`,
            }
        })
        if (!response.ok) {
            throw new Error(`Lỗi không khóa được người dùng: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    },
    async restoreUser(id: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/users/${encodeURI(id)}/restore`, {
            method: 'POST',
            headers: {
                'authorization': `Bearer ${token}`,
            }
        })
        if (!response.ok) {
            throw new Error(`Lỗi mở khóa được người dùng: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    },
    async deleteUserPermanent(id: string, reason: string) {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify({ reason });
        const response = await fetch(`${API_URL}/admin/users/${encodeURI(id)}`, {
            method: 'DELETE',
            headers: {
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body
        })
        if (!response.ok) {
            throw new Error(`Lỗi không thể xóa người dùng: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    },
    async updateUserEmail(id: string, email: string): Promise<AdminUserResponse> {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify({ email });
        const response = await fetch(`${API_URL}/admin/users/${encodeURI(id)}/email`, {
            method: 'PATCH',
            headers: {
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body
        })
        console.log('Response from updateUserEmail:', response);
        if (!response.ok) {
            throw new Error(`Lỗi cập nhật được Email người dùng: ${response.statusText}`);
        }
        const data = await response.json();
        return data.user;
    },
}

export default adminUserService;