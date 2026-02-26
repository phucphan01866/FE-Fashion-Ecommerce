'use client'
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/app/ui/general/Breadcrumb/Breadcrumb";
import Product from "@/app/ui/general/ProductSection/Product";
import { useHomeProductPage, HomeProductPageProvider } from "@/context/HomeProductContext";
import { ControllableInputSelect, InputField, InputSelect, InputToggle } from "@/app/ui/general/Input/Input";
import { usePublic } from "@/context/PublicContext";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFavorite } from "@/context/FavoriteContext";
import { SpinLoadingSkeleton, TextLoadingSkeleton } from "@/app/ui/general/skeletons/LoadingSkeleton";
import { formatVND } from "@/app/ui/user/admin/promotion/PromotionForm";

export default function page() {
    return (
        <HomeProductPageProvider>
            <PageContent />
        </HomeProductPageProvider>
    );
}

function PageContent() {
    const cats = usePublic().publicData?.categories;
    const catId = useHomeProductPage().category_id;
    const catParentId = cats?.find(cat => cat.id === catId)?.parent_id;
    const breadcrumbItems = [
        { link: "/", text: "Trang chủ" },
        { link: `/product?category_id=${catParentId}`, text: cats?.find(cat => cat.id === catParentId)?.name || '' },
        { link: `/product?category_id=${catId}`, text: cats?.find(cat => cat.id === catId)?.name || 'Sản phẩm' }
    ]
    const { items, firstLoad } = useHomeProductPage();
    return (
        <div className="bg-white min-h-screen mt-8">
            {/* <Breadcrumb breadcrumbItems={breadcrumbItems} /> */}
            <div className="container flex flex-col gap-4 w-full p-4 ">
                <Breadcrumb breadcrumbItems={breadcrumbItems} />

                <Divider />
                <Header />
                <FilterArea />
                {firstLoad ?
                    (
                        <>
                            <SpinLoadingSkeleton /><TextLoadingSkeleton />
                        </>
                    ) : (
                        <>
                            <ContentArea items={items} />
                            <PaginateArea />
                        </>
                    )}
            </div>
        </div>
    );
}

function Header() {
    const { q } = useHomeProductPage();
    return (
        q && q.trim() !== '' ? (
            <p className="fontA4">Kết quả tìm kiếm cho từ khóa: <span className="ml-2 fontA2 ">{q}</span></p>
        ) : null
    )
}

const orderByOptions = [
    { content: 'date_asc', label: 'Mới nhất' },
    { content: 'date_desc', label: 'Cũ nhất' },
    { content: 'price_asc', label: 'Giá: Thấp đến cao' },
    { content: 'price_desc', label: 'Giá: Cao đến thấp' },
]

function FilterArea() {
    const { publicData } = usePublic();
    const { updateFilter, category_id, supplier_id, min_price, max_price, order, is_flash_sale } = useHomeProductPage();

    // Đồng bộ giá trị input với URL khi mount hoặc khi filter thay đổi
    const [startPrice, setStartPrice] = useState<number>(() =>
        min_price ? min_price : 0
    );
    const [endPrice, setEndPrice] = useState<number>(() =>
        max_price ? max_price : 0
    );

    // Cập nhật input khi URL thay đổi (dùng khi back/forward hoặc reload)
    useEffect(() => {
        setStartPrice(min_price ? min_price : 0);
        setEndPrice(max_price ? max_price : 0);
    }, [min_price, max_price]);

    // Hàm xử lý khi nhấn Enter hoặc blur
    const applyPriceFilter = (type: 'min_price' | 'max_price', value: number) => {
        if (value === 0) {
            updateFilter(type, null); // xóa filter
        } else if (value >= 0) {
            updateFilter(type, value.toString());
        }
        // Nếu không hợp lệ → không làm gì (giữ giá trị cũ)
    };

    const handleStartPriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyPriceFilter('min_price', startPrice);
        }
    };

    const handleEndPriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyPriceFilter('max_price', endPrice);
        }
    };

    function toggleSetSaleProductFilter() {
        updateFilter('is_flash_sale', is_flash_sale ? null : 'true');
    }

    function makeChildCategoryItems(currentCatID: string) {
        if (!publicData || !publicData.categories) return [];
        const currentCat = publicData.categories.find(cat => cat.id === currentCatID);
        if (!currentCat) return [{ content: '', label: 'Tất cả' }];
        // Nếu là danh mục cha -> lấy list danh mục con, nếu là danh mục con -> lấy list danh mục con của danh mục cha
        if (currentCat.parent_id === null) {
            const result = [{ content: currentCatID, label: 'Tất cả' },
            ...publicData.categories.filter(cat => cat.parent_id === currentCatID).map(cat => ({
                content: cat.id,
                label: cat.name,
            }))];
            return result;
        } else {
            const parentID = currentCat.parent_id;
            const result = [{ content: parentID, label: 'Tất cả' },
            ...publicData.categories.filter(cat => cat.parent_id === parentID).map(cat => ({
                content: cat.id,
                label: cat.name,
            }))];
            return result;
        }
    }

    return (
        <div className="flex gap-2 flex-wrap">
            {/* Category Filter */}
            {(publicData && publicData?.categories?.length > 0) && (
                <>
                    <ControllableInputSelect
                        onClick={(value) => updateFilter('category_id', value || null)}
                        id="category-filter"
                        label="Phân loại chính:"
                        showDirection="horizontal"
                        items={[
                            { content: '', label: 'Tất cả' },
                            ...publicData.categories.filter(cat => cat.parent_id === null).map((cat) => ({
                                content: cat.id,
                                label: cat.name,
                            }))
                        ]}
                        currentValue={category_id !== '' ? (publicData.categories.find(cat => cat.id === category_id).parent_id || category_id) : ''}
                    />
                    <InputSelect
                        disabled={!category_id || category_id === ''}
                        onChange={(value) => updateFilter('category_id', value || null)}
                        id="category-filter"
                        label="Phân loại phụ:"
                        showDirection="horizontal"
                        items={makeChildCategoryItems(category_id)}
                        defaultItem={category_id || ''}
                    />
                </>
            )}
            {/* Brand Filter */}
            {(publicData?.brands && publicData?.brands?.length > 0) && (
                <InputSelect
                    onChange={(value) => updateFilter('supplier_id', value || null)}
                    id="supplier-filter"
                    label="Nhà phân phối :"
                    showDirection="horizontal"
                    items={[
                        { content: '', label: 'Tất cả' },
                        ...publicData.brands.map((brand) => ({
                            content: String(brand.id),
                            label: brand.name,
                        }))
                    ]}
                    defaultItem={supplier_id || ''}
                />
            )}
            <div className="basis-full"/>
            {/* Price Range */}
            <div className="flex items-end gap-2">
                <InputField
                    id="price-from"
                    type="text"
                    label="Giá từ :"
                    placeholder="0 VNĐ"
                    bonusCSS="!w-fit max-w-[95px]"
                    value={startPrice.toLocaleString('vi-VN')}
                    direction="horizontal"
                    // onChange={(e) => setStartPrice(e.target.value)}
                    onChange={(e) => formatVND(e.target.value, setStartPrice)}
                    onKeyDown={handleStartPriceKeyDown}
                    onBlur={() => applyPriceFilter('min_price', startPrice)}
                    unit="VNĐ"
                />
                {/* <span className="text-gray-500 pb-2">→</span>    */}
                <InputField
                    id="price-to"
                    type="text"
                    label="Tối đa :"
                    placeholder="0 VNĐ"
                    bonusCSS="!w-fit max-w-[95px]"
                    value={endPrice.toLocaleString('vi-VN')}
                    direction="horizontal"
                    onChange={(e) => formatVND(e.target.value, setEndPrice)}
                    onKeyDown={handleEndPriceKeyDown}
                    onBlur={() => applyPriceFilter('max_price', endPrice)}
                    unit="VNĐ"
                />
            </div>

            {/* Sort Filter */}
            <InputSelect
                id="orderBy-filter"
                label="Sắp xếp theo :"
                showDirection="horizontal"
                items={orderByOptions}
                onChange={(value) => updateFilter('order', value || 'desc')}
            />
            {/* Flash sale filter */}
            <InputToggle
                bonusCSS="!py-2 h-full min-h-[43px] !items-end"
                id="price-toggle"
                label="Đang khuyến mãi"
                value={is_flash_sale}
                onChange={toggleSetSaleProductFilter} />
        </div>
    );
}

function ContentArea({ items }: { items: any[] }) {
    const { user } = useAuth();
    const { favoriteIdsList } = useFavorite();

    return (
        <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr_1fr_1fr] lg:grid-cols-[1fr_1fr_1fr_1fr] gap-4">
            {/* <Product data={productSampleData} /> */}
            {items.map((product, index) => (
                <Product key={index} data={product} isCustomer={user?.role === "customer" ? true : false} isFavored={favoriteIdsList.includes(product.id)} />
            ))}
            {items.length === 0 && (
                <p className="col-span-4 text-center text-gray-500 my-3">Không có sản phẩm phù hợp nào.</p>
            )}
        </div>
    )
}

function Divider() {
    return (
        <div className="w-full h-[0px] border-1 border-gray-100"></div>
    );
}

function PaginateArea() {
    const { hasMore, loadMore } = useHomeProductPage();
    return (
        <div className="w-full flex gap-2 justify-center">
            {hasMore && (
                <PaginateButton onClick={loadMore}>Xem thêm ...</PaginateButton>
            )}
        </div>
    );
}

function PaginateButton({ children, isCurrentPage = false, onClick }: { children: React.ReactNode, isCurrentPage?: boolean, onClick: () => void }) {
    return (
        <div onClick={onClick} className={`transition all ease-in-out inline-block px-3 py-2 bg-gray-100 hover:bg-orange-400 hover:!text-white rounded-lg mx-1  ${isCurrentPage ? "bg-gray-200" : "bg-gray-100 cursor-pointer"}`}> {children} </div>
    );
}



