import { User } from "@/service/auth.service";
import { Button, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon } from "lucide-react";
import { usePublic } from "@/context/PublicContext";
import { TypeCategory } from "@/service/category.service";
import { useEffect, useState } from "react";

export default function SideMenu({ user }: { user: User | null }) {
    const { publicData } = usePublic();
    const [parentsOfChildrenList, setParentList] = useState<TypeCategory[]>([]);
    useEffect(() => {
        if (publicData && publicData.categories.length > 0) {
            const childList = publicData?.categories.filter((category: TypeCategory) => { return category.parent_id !== null });
            const parentList = publicData?.categories.filter((category: TypeCategory) => { return category.parent_id === null });
            const parentsOfChildrenList = parentList.filter((parent: TypeCategory) =>
                childList.some((child: TypeCategory) => child.parent_id === parent.id)
            );
            setParentList(parentsOfChildrenList || []);
        }

    }, [publicData]);
    const max = 4;
    return (
        <>
            {user ? (
                null
            )
                : (
                    <>
                        <ButtonLink link="/login">Đăng nhập</ButtonLink>
                        <ButtonLink link="/register">Đăng ký</ButtonLink>
                    </>
                )}
            {/* button, dropdown, search */}
            <Divider />
            <ButtonLink link="/">Trang chủ</ButtonLink>
            {parentsOfChildrenList && parentsOfChildrenList.length > 0 && parentsOfChildrenList.slice(0, max).map((category: any, index: number) => (
                <Dropdown key={category.id} title={category.name} options={publicData?.categories
                    .filter((cat: TypeCategory) => cat.parent_id === category.id)
                    .map((item: TypeCategory) => ({
                        link: `/product?category_id=${encodeURI(item.id)}`,
                        label: item.name
                    })) || []} />
            ))}
            <ButtonLink link="/news">Tin tức</ButtonLink>


        </>
    )
}

const btnCSS = 'w-full block text-left px-4 py-2 rounded-md hover:bg-gray-100 my-1 cursor-pointer';

function ButtonLink({ link, children }: { link: string, children: React.ReactNode }) {
    return (
        <a href={link}><Button className={btnCSS}>
            {children}
        </Button></a>
    )
}

function Dropdown({ title, options }: { title: string, options: { label: string, link: string }[] }) {
    return (
        <div>
            <Disclosure as="div">
                <DisclosureButton className={`${btnCSS} flex items-center-safe justify-between`}>
                    <span>{title}</span>
                    <span><ChevronDownIcon /></span>
                </DisclosureButton>
                <DisclosurePanel transition={true} className={'flex flex-col gap-1 px-4 transition data-closed:scale-95 data-closed:opacity-0'}>
                    {options.map((option, index) => (
                        <a className={`px-4 py-1 cursor-pointer hover:bg-gray-100 rounded-sm`} key={index} href={option.link}>
                            {option.label}
                        </a>
                    ))}
                </DisclosurePanel>
            </Disclosure>
        </div>
    )
}

function Divider() {
    return <div className="w-full h-px bg-gray-300 my-2"></div>;
}