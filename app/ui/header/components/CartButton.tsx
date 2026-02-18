'use client'

import Image from 'next/image';
import Link from 'next/link';
import { navButtonClass2 as navButtonClass, dropdownClassCenter, dropdownMenuClass2, itemClass2 as itemClass } from './styles';
import { use, useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function CartButton({
    items
}: {
    items: any[];
}) {
    const iconSize = 20;
    const [expanded, setExpanded] = useState(false);
    const handleClickInside = () => {
        setExpanded(!expanded);
    };
    const handleClickOutside = () => {
        setExpanded(false);
    };
    return (
        <div className='relative' onMouseEnter={handleClickInside} onMouseLeave={handleClickOutside} >
            <Link href={`/cart`} className={`${navButtonClass} rounded-full block`}  >
                <div className='flex'>
                    <Image src={`/icon/cart.svg`} alt={`cart`} width={iconSize} height={iconSize} />
                </div>
            </Link>
            {items && items.length > 0 && <ItemDot />}
            {expanded && (
                <div className={`${dropdownClassCenter} w-max`}>
                    <ul className={`${dropdownMenuClass2}`}>
                        {items && items.length > 0 && items.slice(0, 4).map((item) => {
                            return (
                                <li key={item.size + '' + item.sku}>
                                    <Link href={`/product/${item.product_id}`} className='p-1.5 rounded-xl hover:bg-gray-100 flex relative gap-2'>
                                        <div className='relative w-18 h-18 flex-shrink-0 rounded-lg overflow-hidden'>
                                            <Image
                                                src={item.image_url || '/placeholder.png'}
                                                alt={item.product_name}
                                                fill
                                                className='object-cover aspect-square'
                                            />
                                        </div>
                                        <div className='flex flex-col gap-1 max-w-[20ch]! justify-center-safe fontA5 font-medium!'>
                                            <p className='line-clamp-2!'>{item.product_name}</p>
                                            <div className='flex gap-1 justify-between fontA6'>
                                                <div>
                                                    <span>{item.color_name}</span>
                                                    {', '}
                                                    <span>{item.size}</span>
                                                </div>
                                                <div>
                                                    <span>{Number(item.unit_price).toLocaleString('vi-VN')} ₫</span>
                                                    {` x `}
                                                    <span>{item.qty}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            )
                        })}
                        {(!items || items.length === 0) && (
                            <li className='px-3 py-2 text-center text-gray-700 fontA5'>Giỏ hàng trống</li>
                        )}
                        {items && items.length > 0 && (
                            <>
                                {items.length > 4 && (
                                    <p className='text-right fontA6 italic text-gray-700'>Cùng với {items.length - 4} sản phẩm khác</p>
                                )}
                                <li className=''>
                                    <Link href={`/cart`}
                                        className='block text-center bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg fontA4 font-medium! transition-all duration-100 ease-in-out'>
                                        Xem giỏ hàng
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

function ItemDot() {
    return (
        <div className="w-3 h-3 bg-red-500 rounded-full absolute top-0 right-0 border-2 border-white"></div>
    )
}