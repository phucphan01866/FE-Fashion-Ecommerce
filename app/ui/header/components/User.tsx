'use client';
import { navButtonClass, dropdownClassCenter, itemClass2 as itemClass, dropdownMenuClass2, dropdownClassRight, dropdownClassLeft } from './styles';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminMenuList, customerMenuList } from "@/app/menu";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';


function Item({ href = "/", text, imgSrc = "", type }: { href?: string, text: string, imgSrc?: string, type?: string }) {
    const iconSize = 24;
    const { logout } = useAuth();
    const router = useRouter();
    const logoutHandler = () => {
        logout();
        router.push("/");
    }
    // Đưa cái logout ra ngoài để đỡ số lần import
    if (type && type === "logout") {
        return (
            <li>
                <button type="button" onClick={logoutHandler} className={`${itemClass}`}>
                    {imgSrc !== "" ?
                        <Image src={imgSrc}
                            alt={text}
                            className=''
                            width={iconSize} height={iconSize} /> : null}
                    <p>{text}</p>
                </button>
            </li>
        )
    } else {
        return (
            <li>
                <Link href={href} className={`${itemClass}`}>
                    {imgSrc !== "" ?
                        <Image src={imgSrc}
                            alt={text}
                            className=''
                            width={iconSize} height={iconSize} /> : null}
                    <p>{text}</p>
                </Link>
            </li>
        );
    }
}

export default function User({ name, role = "admin" }: { name?: string, role?: string }) {
    const [menuList, setMenuList] = useState(role === "admin" ? adminMenuList : customerMenuList)
    const [expanded, setExpanded] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setExpanded(false);
            }
        };
        if (expanded) { document.addEventListener('mousedown', handleClickOutside) };
        return () => { document.removeEventListener('mousedown', handleClickOutside) };
    }, [expanded]);

    const toggleDropdown = () => {
        setExpanded(!expanded);
    };


    return (
        <div className='relative' ref={dropdownRef} onClick={toggleDropdown}>
            <button className={`transition-all duration-100 ease-in-out px-4 py-2 pl-5 text-gray-700  flex flex-row items-center gap-2 rounded-full bg-gray-100 hover:bg-gray-200`}>
                <p className='max-w-[20ch] truncate'>{name ? name : "User Name"} ({role === 'admin' ? 'Quản trị viên' : 'Khách hàng'})</p>
            </button>
            <div className={`${dropdownClassRight} ${expanded ? '' : 'hidden'}`}>
                <ul className={`${dropdownMenuClass2} w-auto`}>
                    {menuList.map((item, index) => (
                        <Item key={index} href={`/${role}/${item.link}`} text={item.title} imgSrc={`/icon/${item.imgSrc}`}></Item>
                    ))}
                    <Item type='logout' text="Logout" imgSrc="/icon/square-rounded-arrow-right.svg"></Item>
                </ul>
            </div>
        </div>
    );
}