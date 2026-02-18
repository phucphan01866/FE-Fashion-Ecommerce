const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import { ogFetch } from '@/utils/authIntercept';
import Cookies from 'js-cookie';

export interface User {
    name?: string;
    full_name?: string;
    phone?: string;
    email?: string;
    role?: string;
    status?: string;
    id?: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterData {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
}

export interface VerifyOTPData {
    email: string,
    otp: string,
}

export interface ResetPWData {
    resetToken: string;
    newPassword: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Đăng nhập thất bại" }));
        console.log(errorData);
        throw new Error(errorData.message || "Có lỗi xảy ra!");
    }
    const result = await res.json();
    return result;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const result = await handleResponse<LoginResponse>(res);
        // console.log('Set refreshToken:', result.refreshToken);
        Cookies.set('accessToken', result.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', result.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
        return result;
    },
    async getUser(token: string): Promise<User> {
        const res = await fetch(`${API_URL}/api/check-login`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await res.json();
        if (result?.error && result.error.message === 'jwt expired') {
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
                try {
                    const newAccessToken = (await this.refresh()).accessToken;
                    Cookies.set('accessToken', newAccessToken, { expires: 1, secure: true, sameSite: 'strict' });
                    return this.getUser(newAccessToken);
                } catch {
                    throw new Error('Hãy đăng nhập lại để bảo đảm an toàn cho tài khoản');
                }
            }
        }
        return result.user;
    },
    async logout(token: string, refreshToken: string) {
        if (!token || !refreshToken) return;
        await fetch(`${API_URL}/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ refreshToken }),
        });
        console.log('Remove refreshToken');
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
    },
    async refresh(): Promise<{ accessToken: string }> {
        const refreshToken = Cookies.get('refreshToken');
        const res = await ogFetch(`${API_URL}/api/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
            throw new Error('Refresh token thất bại')
        };
        const result = await res.json();
        console.log("new tokens,", result);
        // console.log('Set refreshToken:', result.refreshToken);
        // Cookies.set('accessToken', result.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
        // Cookies.set('refreshToken', result.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
        Cookies.set('accessToken', result.accessToken, { expires: 7, secure: true, sameSite: 'strict' }); //content bên trong hết hạn sau 1h, nhưng token bị xóa sau 7 ngày
        return result;
    },
    async sendOTPRegister(data: RegisterData): Promise<string> {
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: data.email,
                password: "",
                full_name: "",
                phone: "",
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Gửi OTP thất bại');
        }
        const text = await res.json();
        return text.message;
    },

    async verifyOTPAndRegister(data: RegisterData, otp: string): Promise<LoginResponse> {
        const res = await fetch(`${API_URL}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: data.email,
                otp: otp,
                password: data.password,
                full_name: data.fullName,
                phone: data.phone,
            }),
        });
        const result = await handleResponse<LoginResponse>(res);
        console.log('Set refreshToken:', result.refreshToken);
        Cookies.set('accessToken', result.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', result.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
        return result;
    },
    resetPW: {
        async sendOTP(email: string): Promise<string> {
            const res = await fetch(`${API_URL}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                switch (res.status) {
                    case 403:
                        throw new Error("Tài khoản đã bị khóa");
                    case 429:
                        throw new Error("OTP đã được gửi gần đây, vui lòng chờ");
                    default:
                        throw new Error("Không thể gửi OTP");
                }
            }
            return "Mã OTP đã được gửi đến email bạn vừa nhập";
        },
        async verifyOTP(data: VerifyOTPData) {
            const res = await fetch(`${API_URL}/api/reset-password/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                throw new Error('Mã OTP không đúng hoặc đã quá hạn sử dụng');
            }
            const result = await res.json();
            return {
                resetToken: result.resetToken,
                message: "Nhập mã OTP thành công"
            };
        },
        async setNewPW(data: ResetPWData) {
            const res = await fetch(`${API_URL}/api/reset-password/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                switch (res.status) {
                    case 404: throw new Error("Không tìm thấy tài khoản");
                    case 400: throw new Error("Mật khẩu mới không được giống mật khẩu cũ");
                    case 500: throw new Error("Lỗi server");
                    default: throw new Error("Mã OTP không đúng hoặc đã quá hạn sử dụng");
                }
            }
            return "Cập nhật mật khẩu mới thành công";
        }
    }
}