'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { authService, User, LoginResponse, RegisterData } from "@/service/auth.service";
import { useNotificateArea } from "./NotificateAreaContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { isTokenExpired } from "@/helper/accessTokenExpiryHelper";
import Cookies from 'js-cookie';

interface AuthContextType {
    user: User | null,
    login: (email: string, password: string) => void,
    logout: () => void,
    isLoading: boolean,
    setIsLoading: (input: boolean) => void,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const refreshToken = Cookies.get('refreshToken') || "";
    let accessToken = Cookies.get('accessToken') || "";
    function removeTokens() {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        // console.log("Tokens removed");
    }
    useEffect(() => {
        async function fetchUser() {
            if ((accessToken.length > 0 && refreshToken.length > 0)) {
                if (accessToken && isTokenExpired(accessToken)) {
                    try {
                        const res = await authService.refresh();
                        // Cookies.set('accessToken', res.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
                        accessToken = res.accessToken;
                    } catch {
                        removeTokens();
                        setIsLoading(false);
                    }
                }
                if (accessToken) {
                    const user = await authService.getUser(accessToken);
                    setUser(user);
                    setIsLoading(false);
                } else {
                    removeTokens();
                    setIsLoading(false);
                }
            } else {
                if (accessToken.length > 0 || refreshToken.length > 0) removeTokens();
                setIsLoading(false);
            }

        }
        fetchUser();
    }, []);
    async function login(email: string, password: string) {
        try {
            const data: LoginResponse = await authService.login(email, password);
            Cookies.set('accessToken', data.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
            Cookies.set('refreshToken', data.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
            setUser(data.user);
        } catch (error) {
            if (error instanceof Error && error.message === "Invalid email or password") {
                throw new Error("Email hoặc mật khẩu không đúng");
            }
            throw new Error(`Lỗi đăng nhập: ${error}`);
        }
    }
    async function logout() {
        router.push('/login');
        const rfToken = Cookies.get('refreshToken') || "";
        const token = Cookies.get('accessToken') || "";
        if (token && rfToken) {
            await authService.logout(token, rfToken);
            await setUser(null);
        }
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
    }
    return (<AuthContext.Provider value={{ user, login, logout, isLoading, setIsLoading }}>
        {children}
    </AuthContext.Provider>);
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};