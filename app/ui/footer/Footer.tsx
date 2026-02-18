'use client'

import { usePublic } from "@/context/PublicContext";
import Link from "next/link";
import Image from "next/image";

const iconSize = 24;

export default function Footer() {
    const { publicData } = usePublic();
    // console.log("public data: ", publicData);
    const parentCategories = publicData?.categories.filter(cat => !cat.parent_id);
    return (
        <footer className="footer w-full bg-black text-white">
            <div className="container flex justify-around px-8 py-12">
                {parentCategories && parentCategories.length > 0 && parentCategories.slice(0, 4).map((parentCat) => {
                    const childCategories = publicData?.categories.filter(cat => cat.parent_id === parentCat.id);
                    if (!childCategories || childCategories.length === 0) return null;
                    else return (
                        <ParentBlock key={parentCat.id} title={parentCat.name} link={`/product?category_id=${encodeURI(parentCat.id)}`}>
                            <CategoryBlock categories={childCategories}></CategoryBlock>
                        </ParentBlock>
                    )
                })}
                {/* <ParentBlock title="Shirts">
                    <CategoryBlock category="Shirts"></CategoryBlock>
                </ParentBlock>
                <ParentBlock title="Pants">
                    <CategoryBlock category="Pants"></CategoryBlock>
                </ParentBlock>
                <ParentBlock title="Socks">
                    <CategoryBlock category="Socks"></CategoryBlock>
                </ParentBlock>
                <ParentBlock title="Contact">
                    <Block name="phone" iconSrc="phone-white.svg" text="+420 777 666 888"></Block>
                    <Block name="email" iconSrc="mail-white.svg" text="john.doe@gmail.com"></Block>
                </ParentBlock>
                <ParentBlock title="Working Hours">
                    <WorkingHours></WorkingHours>
                </ParentBlock> */}
            </div>
        </footer>

    );
}

function Icon({ src, alt }: { src: string, alt: string }) {
    return (
        <Image src={src} width={iconSize} height={iconSize} alt={alt} className="d-inline"></Image>
    );
}

function BlockH2({ children }: { children: React.ReactNode }) {
    return (
        <h2 className={`font-bold text-2xl border-b-2 w-fit mb-2 transition-transform hover:border-b-3 hover:mb-[7px] duration-800 ease-in-out`}>{children}</h2>
    );
}

function CategoryBlock({ categories }: { categories: any[] }) {
    return (
        <ul className="flex flex-col gap-2">
            {categories.slice(0, 4).map((cat) => {
                return (
                    <li
                        key={cat.id}>
                        <Link
                            href={`/product?category_id=${encodeURI(cat.id)}`}>{cat.name}
                        </Link>
                    </li>
                )
            })}
        </ul>
    );
}
function Block({ name, iconSrc, text }: { name: string, iconSrc: string, text: string }) {
    return (
        <div className="flex gap-2 items-center mb-2">
            <Icon src={`/icon/${iconSrc}`} alt={`${name}`}></Icon>
            <span>{text}</span>
        </div>
    );
}

function WorkingHours() {
    return (
        <div>
            <ul>
                <li className="mb-2">Mon-Fri: 8:00 - 20:00</li>
                <li className="mb-2">Sat: 9:00 - 18:00</li>
                <li className="mb-2">Sun: Closed</li>
            </ul>
        </div>
    );
}

function ParentBlock({ children, title, link }: { children: React.ReactNode, title: string, link?: string }) {
    return (
        <div>
            <BlockH2>
                {link ? <Link href={link}>{title}</Link> : title}
            </BlockH2>
            {children}
        </div>
    );
}