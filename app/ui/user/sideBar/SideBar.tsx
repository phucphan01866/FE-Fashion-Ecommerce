'use client'

import Link from "next/link";
import Image from "next/image";
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { usePathname } from "next/navigation";
import { adminMenuList, customerMenuList } from "@/app/menu";


export default function SideBar(
    { authRole, closeSideBar }: { authRole: string, closeSideBar?: () => void }
) {
    const menuList = authRole === "admin" ? adminMenuList : customerMenuList;
    const path = usePathname().split('/').filter(Boolean);
    const secondRoute = path[1] || '';

    return (
        <div className="min-h-[100dvh] w-fit h-full bg-white border-r-2 border-r-gray-200 px-0 py-8 pr-0">
            <Link href={'/'} className="w-fit mx-auto relative block"><Image className="" src={"/logo/logo.png"} width={140} height={35} alt="logo" /></Link>
            <div className="mt-6 flex flex-col gap-1">
                {menuList.map((item, index) => {
                    const isActive = secondRoute === item.link;
                    return ((
                        <Button onClick={closeSideBar} authRole={authRole} key={index} title={item.title} link={item.link} isActive={isActive}></Button>
                    ));
                })}
            </div>
        </div>
    )
}

function Button({ title, link, imgSrc, isActive, authRole, onClick }: { title: string, link: string, imgSrc?: string, isActive: boolean, authRole: string, onClick?: () => void }) {
    return (
        <Link onClick={onClick}
            className={`fontA4 px-[1.5rem] md:px-[2.5rem] lg:px-[3rem] min-w-[240px] py-2 ${isActive ? "!border-r-4 !border-r-orange-300" : null} hover:border-r-4 hover:border-r-orange-300`}
            href={`/${authRole}/${link}`}>{title}</Link>
    )
}