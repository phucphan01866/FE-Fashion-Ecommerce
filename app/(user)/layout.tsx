'use client'
import SideBar from "@/app/ui/user/sideBar/SideBar";
import Header from "@/app/ui/header/Header";
import Footer from "@/app/ui/footer/Footer";
import { useAuth } from "@/context/AuthContext";
import NotificateAreaProvider from "@/context/NotificateAreaContext";
import { usePathname } from 'next/navigation';

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathName = usePathname();
    // if (pathName.split('/')[1] === 'customer' || pathName.split('/')[1] === 'admin') {
    //     router.push('/login');
    // }
    const { user } = useAuth();
    const authRole = user?.role || "customer";
    return (
        <main className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] bg-gray-100">
            <div className="d-flex row-span-2 col-span-1">
                <SideBar authRole={authRole}></SideBar>
            </div>
            <Header />
            {children}
            <div className="col-span-2">
                <Footer />
            </div>

        </main>
    );
}
