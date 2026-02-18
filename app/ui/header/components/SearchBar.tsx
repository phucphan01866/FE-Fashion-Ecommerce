'use client'

import { useDebounce } from '@/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import HomeService from '@/service/public.service';
import { TypeProduct } from '@/service/product.service';
import { useRouter } from 'next/navigation';
import { useNotificateArea } from '@/context/NotificateAreaContext';
import track from '@/utils/track';

export default function SearchBar() {
    const router = useRouter();
    const iconSize = 24;
    const [isFocused, setIsFocused] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const { setNotification } = useNotificateArea();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                resultRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !resultRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
                setIsFocused(false);
            }
        };

        if (isFocused || showResults) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFocused, showResults]);

    const hanldeFormClick = () => {
        if (!isFocused) {
            setIsFocused(true);
            setShowResults(true);
            inputRef.current?.focus();
        }
    };

    const handleFormInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);

        if (!isFocused) {
            setIsFocused(true);
        }

        if (value.trim() !== '') {
            setShowResults(true); // ✅ Luôn show results khi có input
            performQuickSearchDebounced(value);
        } else {
            setShowResults(false);
            setPreviewItemsList([]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
        if (e.key === 'Escape') {
            setShowResults(false);
            setIsFocused(false);
            inputRef.current?.blur();
        }
    };

    const handleClickSearch = () => {
        if (!isFocused) {
            setIsFocused(true);
            setShowResults(true);
        } else {
            performSearch();
        }
    };

    const performSearch = () => {
        track('search', { query: searchValue });
        if (searchValue.trim() === '') {
            setNotification("Vui lòng nhập từ khóa tìm kiếm");
            return;
        }

        const query = searchValue.trim();
        setSearchValue('');
        setShowResults(false);
        setIsFocused(false);
        router.push(`/product?q=${encodeURIComponent(query)}`);
    };

    const [previewItemsList, setPreviewItemsList] = useState<TypeProduct[]>([]);

    const performQuickSearch = useCallback(async (query: string) => {
        // console.log('Searching for:', query);
        try {
            const response = await HomeService.fetchProducts({
                filter: { q: query },
                limit: 7
            });
            if (response.items) {
                setPreviewItemsList(response.items);
            }
        } catch (error) {
            console.error('Search error:', error);
            setPreviewItemsList([]);
        }
    }, []);

    const performQuickSearchDebounced = useDebounce(performQuickSearch, 300);

    return (
        <div className='relative search-bar mr-2'>
            <form onClick={hanldeFormClick} className='py-[8px] px-[16px] rounded-lg bg-gray-100 flex flex-row items-center justify-center gap-2 hover:shadow-sm hover:bg-gray-200 transition-all'>
                <input
                    ref={inputRef}
                    id="search-input"
                    type="text"
                    placeholder='Tìm kiếm...'
                    onChange={handleFormInput}
                    onKeyDown={handleKeyDown}
                    value={searchValue}
                    className='focus:outline-none'
                    autoComplete='off'
                />
                <button type="button" onClick={handleClickSearch}>
                    <Image
                        className={`rounded-md transition-all duration-150 ease-in-out p-1 bg-orange-400 hover:bg-orange-500 `} src="/icon/search-light.svg"
                        alt="Search" width={iconSize} height={iconSize} />
                </button>

                {showResults && previewItemsList.length !== 0 && setSearchValue.length > 0 ? (
                    <div
                        ref={resultRef}
                        className={`transition-all duration-1000 flex flex-col px-1 py-1 z-99 absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg bg-white border-1 border-white`}>
                        {previewItemsList.length === 0 ? <span className="fontA5 italic text-gray-500 text-center">Không có kết quả phù hợp</span> :
                            (
                                <>
                                    {previewItemsList.map((item, index) => (
                                        <Link
                                            key={item.id}
                                            onClick={() => {
                                                // ✅ Hide results khi click vào item
                                                setShowResults(false);
                                                setIsFocused(false);
                                            }}
                                            href={`/product/${item.id}`}
                                            className={`grid grid-cols-[auto_1fr] gap-2 p-1 rounded-md hover:bg-gray-100 overflow-ellipsis`}>
                                            {/* <div className='block relative w-16 h-16 bg-gray-300 rounded-md overflow-hidden'>
                                                <Image src={item.product_images && item.product_images[0].url || "/"} alt="product-image" fill />
                                            </div> */}
                                            {/* <div className='flex flex-col gap-1 overflow-ellipsis'>
                                                <span className='fontA5 block font-semibold! text-gray-700 truncate overflow-ellipsis'>{item.name}</span>
                                                <span className='fontA5 text-gray-500 truncate leading-none!'>{Math.floor(item.final_price).toLocaleString()}đ {item.is_flash_sale && (<span className='text-red-500 font-light italic'>(sale)</span>)}</span>
                                            </div> */}
                                            <span className='px-2 py-1 fontA5 block font-medium! text-gray-700 truncate overflow-ellipsis'>{item.name}</span>
                                        </Link>
                                    ))}
                                    {/* <ResultItem /> */}
                                    <button onClick={() => performSearch()} type="button" className="transition-all m-0.5 duration-200 ease-in-out cursor-pointer fontA4 text-center font-gray-700 leading-none!
                                    p-2.5 block mx-center rounded-lg bg-orange-400 hover:bg-orange-500 text-white font-medium!">Xem tất cả kết quả</button>
                                </>
                            )}
                    </div>
                ) : null}
            </form>
        </div>
    );
}

interface ResultItemProps {
    data: TypeProduct;
    onClick: () => void;
}