'use client';
import BorderlessButton from '@/app/ui/header/components/BorderlessButton';
import { usePublic } from '@/context/PublicContext';
import { TypeCategory } from '@/service/category.service';
import { useEffect, useState } from 'react';

export default function Navigation() {
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
        <div className='navigation flex flex-row items-center gap-2'>
            <BorderlessButton>Trang chủ</BorderlessButton>
            {parentsOfChildrenList && parentsOfChildrenList.length > 0 && parentsOfChildrenList.slice(0, max).map((category: any) => (
                <BorderlessButton
                    key={category.id}
                    type="list"
                    href={`/product?category_id=${encodeURI(category.id)}`}
                    items={
                        publicData?.categories
                            .filter((cat: TypeCategory) => cat.parent_id === category.id)
                            .map((item: TypeCategory) => ({
                                href: `/product?category_id=${encodeURI(item.id)}`,
                                content: item.name,
                                key: item.id,
                            }))
                    }
                >
                    {category.name}
                </BorderlessButton>))}
            <BorderlessButton href='/news'>Tin tức</BorderlessButton>
        </div>
    );
}
