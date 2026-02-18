'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const router = useRouter();
    const { user, isLoading, setIsLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.replace(`/login?redirect=${encodeURIComponent('/admin')}`);
        } else if (user.role !== "admin") {
            router.push("/");
        }
    }, [user, isLoading])

    if (isLoading || !user || user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        );
    }
    else return <>{children}</>;
}