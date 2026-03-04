'use client'
import SideBar from "@/app/ui/user/sideBar/SideBar";
import Header from "@/app/ui/header/Header";
import Footer from "@/app/ui/footer/Footer";
import { useAuth } from "@/context/AuthContext";
import NotificateAreaProvider from "@/context/NotificateAreaContext";
import { usePathname } from 'next/navigation';
import { useState } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = useAuth();
    const authRole = user?.role || "customer";
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    return (
        <main className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] bg-gray-100">
            <div className="hidden lg:flex row-span-2 col-span-1">
                <SideBar authRole={authRole}></SideBar>
            </div>
            <div className="flex lg:hidden row-span-2 col-span-1">
                <Dialog as="div" open={isSideBarOpen} onClose={() => setIsSideBarOpen(false)} className="">
                    <Transition show={true} appear={true}>
                        <div className="transition data-closed:opacity-0 block fixed top-0 left-0 bg-black/75 w-screen h-screen">
                            <DialogPanel transition={true} className={'w-fit transition data-closed:-translate-x-[30px]'} >
                                <SideBar authRole={authRole} closeSideBar={() => setIsSideBarOpen(false)}></SideBar>
                            </DialogPanel>
                        </div>
                    </Transition>
                </Dialog>
            </div>
            <Header isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />
            {children}
            <div className="col-span-2">
                <Footer />
            </div>

        </main>
    );
}
