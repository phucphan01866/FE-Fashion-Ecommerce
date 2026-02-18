
import { useAdminCategoryContext } from "@/context/AdminContexts/AdminCategoryContext";
import { sectionCSS, Divider, SeeMoreButton } from "@/app/ui/user/general/general";
import Input, { InputSelect, InputField, InputToggle, ControllableInputSelect } from "@/app/ui/general/Input/Input";
import { TypeCategory } from "@/service/category.service";
import Image from "next/image";
import Link from "next/link";
import { deleteCategory } from "@/service/category.service";
import { useState, useEffect } from "react";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useAdminEditCategoryContext } from "@/context/AdminContexts/AdminEditCategoryContext";
import { useAdminProductContext } from "@/context/AdminContexts/AdminProductContext";
import { TypeProduct, removeProduct, updateSaleOffStatus } from "@/service/product.service";
import { useParams } from "next/navigation";
import { usePublic } from "@/context/PublicContext";

export default function CategoryListArea() {
    const { hasMore, loadMore } = useAdminProductContext();
    return (
        <div className={`CategoryTable ${sectionCSS} flex-1 flex flex-col gap-4`}>
            <FilterArea />
            <TableArea />
            {hasMore && (
                <NextPageArea fetchProd={loadMore} />
            )}
        </div>
    )
}

function FilterArea() {
    const { publicData } = usePublic();
    // console.log(publicData);
    const { updateFilters, filters } = useAdminProductContext();
    const findCategoryById = (id: string | undefined) => {
        if (!id) return null;
        return publicData?.categories.find(cat => cat.id === id);
    }
    const updateNumber = (type: 'min_price' | 'max_price', newValue: string) => {
        const numericValue = newValue.replace(/[^0-9]/g, '');
        if (!numericValue || numericValue.length === 0) {
            updateFilters({ [type]: undefined });
            return;
        }
        if (!numericValue || isNaN(Number(numericValue))) {
            return undefined;
        }

        updateFilters({ [type]: newValue ? Number(numericValue) : 0 });
    }
    // Nếu không rỗng -> select thông thường, nếu rỗng -> chọn tất cả -> case 1: đang ở sub prods-> lấy parant_id, case 2: đang ở parent prods -> lấy current_id
    function updateSubFilter(id: string) {
        if (!id || id.length === 0) {
            const currentParent = findCategoryById(filters.category_id)?.parent_id;
            if (currentParent) {
                updateFilters({ 'category_id': currentParent });
                return;
            }
            updateFilters({ 'category_id': filters.category_id || undefined });
            return;
        }
        updateFilters({ 'category_id': id || undefined });
    }

    return (
        <div className="flex gap-2 flex-wrap">
            {/* Category Filter */}
            {(publicData && publicData?.categories?.length > 0) && (
                <>
                    <ControllableInputSelect
                        onClick={(value) => updateFilters({ 'category_id': value || undefined })}
                        id="category-filter"
                        label="Phân loại chính:"
                        showDirection="horizontal"
                        items={[
                            { content: '', label: 'Tất cả' },
                            ...publicData.categories.filter(cat => cat.parent_id === null).map((cat) => ({
                                content: String(cat.id),
                                label: cat.name,
                            }))
                        ]}
                        // có parent_id -> lấy parent_id, nếu không lấy filters.category_id
                        currentValue={findCategoryById(filters.category_id)?.parent_id ? findCategoryById(filters.category_id).parent_id : filters.category_id || ''}
                    />
                    <ControllableInputSelect
                        onClick={(value) => updateSubFilter(value || '')}
                        id="category-filter"
                        label="Phân loại phụ:"
                        showDirection="horizontal"
                        disabled={filters.category_id ? false : true}
                        items={[
                            { content: findCategoryById(filters.category_id)?.parent_id || '', label: 'Tất cả' },
                            //nếu có parent_id -> lọc theo parent_id đó
                            ...publicData.categories.filter(cat => {
                                const parentCat = findCategoryById(filters.category_id);
                                if (parentCat && parentCat.parent_id) {
                                    return cat.parent_id === parentCat.parent_id;
                                }
                                return cat.parent_id === filters.category_id;
                            }).map((cat) => ({
                                content: String(cat.id),
                                label: cat.name,
                            }))
                        ]}
                        currentValue={findCategoryById(filters.category_id)?.parent_id ? filters.category_id : ''}
                    />
                </>
            )}

            {/* Brand Filter */}
            {(publicData?.brands && publicData?.brands?.length > 0) && (
                <InputSelect
                    onChange={(value) => updateFilters({ 'supplier_id': value || undefined })}
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
                    defaultItem={filters.supplier_id || ''}
                />
            )}

            <div className="flex items-end gap-2">
                <InputField
                    unit="VNĐ"
                    id="price-from"
                    type="text"
                    label="Tối thiểu :"
                    value={filters?.min_price?.toLocaleString('vi-VN') || 0}
                    inputBonusCSS="!w-fit max-w-[75px]"
                    direction="horizontal"
                    onChange={(e) => updateNumber('min_price', e.target.value)}
                // onKeyDown={handleStartPriceKeyDown}
                // onBlur={() => applyPriceFilter('min_price', startPrice)}
                />
                <InputField
                    unit="VNĐ"
                    id="price-to"
                    type="text"
                    label="Tối đa :"
                    inputBonusCSS="!w-fit max-w-[75px]"
                    value={filters?.max_price?.toLocaleString('vi-VN') || 0}
                    direction="horizontal"
                    onChange={(e) => updateNumber('max_price', e.target.value)}
                // onKeyDown={handleEndPriceKeyDown}
                // onBlur={() => applyPriceFilter('max_price', endPrice)}
                />
            </div>

            {/* Discounting Filter */}
            <InputToggle
                bonusCSS="!py-2 !items-end"
                id="price-toggle"
                label="Đang giảm giá"
                value={filters.flash_sale ? true : false}
                onChange={() => updateFilters({ 'flash_sale': filters.flash_sale === true ? undefined : true })} />

            {/* Inactive Products Filter */}
            <InputToggle
                bonusCSS="!py-2 !items-end"
                id="price-toggle"
                label="Sản phẩm đã xóa"
                value={filters.status && filters.status === 'inactive' ? true : false}
                onChange={() => updateFilters({ 'status': filters.status === 'inactive' ? undefined : 'inactive' })} />
        </div>
    );
}


function TableArea() {
    const { productList } = useAdminProductContext();
    return (
        <table className={`TableArea border-separate border-spacing-4`}>
            <thead className="">
                <tr>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Nhà cung cấp</th>
                    <th>Giá gốc</th>
                    <th>Khuyến mãi (%)</th>
                    <th>Giá cuối cùng</th>
                    <th>Lựa chọn</th>
                </tr>
            </thead>
            <tbody className="">
                {productList?.length > 0 ? productList.map((product, index) => (
                    <ProductItem index={index} key={product.id} product={product} />
                )) :
                    <tr>
                        <td colSpan={7}><p className="px-3 py-6 text-center text-gray-500">Hiện chưa có sản phẩm nào</p></td>
                    </tr>
                }
            </tbody>
        </table>
    )
}

function ProductItem({ index, product }: { index: number, product: TypeProduct }) {
    const [isFLS, setIsFLS] = useState(product.is_flash_sale);
    const tdCSS = "py-4 px-2 text-center";
    const { setNotification } = useNotificateArea();
    // const { productList, fetchProducts } = useAdminProductContext();
    const { categoryList, supplierList, deleteProduct, restoreProduct } = useAdminProductContext();

    async function deleteClickHandle(id: string) {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
            deleteProduct(id);
        }
    }

    async function restoreClickHandle(id: string) {
        if (confirm("Bạn có chắc chắn muốn khôi phục sản phẩm này không?")) {
            restoreProduct(id);
        }
    }

    async function submitUpdateSale(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const formSalePercent = Number(formData.get('salePercent'));
        const formIsSaleOff = Boolean(formData.get('isSaleOff'));
        if ((formSalePercent === product.sale_percent) && (formIsSaleOff === product.is_flash_sale)) return null;
        const response = await updateSaleOffStatus(product.id, formSalePercent > 0 ? formSalePercent : product.sale_percent, formIsSaleOff);
        setNotification(response);
    }

    function toggleIsFLS(e: React.ChangeEvent<HTMLInputElement>) {
        setIsFLS(!isFLS);
        e.target.form?.requestSubmit();
    }

    async function updateSaleValues(e: any) {
        if (Number(e.target.value) === 0) {
            await setIsFLS(false);
        };
        e.target.form?.requestSubmit();
    }

    function validateSalePercentate(e: any) {
        if (Number(e.target.value) > 100) {
            e.target.value = "100";
        } else if (Number(e.target.value) < 0) {
            e.target.value = "0";
        }
    }

    return (
        <tr className="" key={product.id}>
            <td className={`${tdCSS} !text-left`}>{product.name}</td>
            <td className={tdCSS}>{categoryList.find(cat => cat.id === product.category_id)?.name || "N/A"}</td>
            <td className={tdCSS}>{supplierList.find(sup => sup.id === product.supplier_id)?.name || "N/A"}</td>
            <td className={tdCSS}>{Math.floor(product.price).toLocaleString('vi-VN')}đ</td>
            <td className={`${tdCSS} flex items-center justify-center gap-2`}>
                <form onSubmit={submitUpdateSale} className="flex gap-3">
                    <div className="flex justify-center" >
                        <Input
                            bonusCSS={`text-center px-0! py-1! ${!isFLS ? "opacity-50" : ""}`}
                            id={`sale_percent-${product.id}`}
                            name="salePercent"
                            type="number"
                            min={0}
                            max={100}
                            onBlur={updateSaleValues}
                            onChange={validateSalePercentate}
                            defaultValue={Number(product.sale_percent)}
                            disabled={!isFLS}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    updateSaleValues(e);
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                        />
                    </div>
                    <div className="flex justify-center" >
                        <input type="checkbox"
                            id={`isSaleOff-${product.id}`}
                            name="isSaleOff"
                            onChange={toggleIsFLS}
                            checked={isFLS} />
                    </div>
                </form>
            </td>
            <td className={tdCSS}>{Math.floor(product.final_price).toLocaleString('vi-VN')}đ</td>
            <td className="flex gap-3 justify-center">
                {product.status === 'inactive' ? (
                    <button onClick={() => restoreClickHandle(product.id)} className="py-4 hover:text-orange-500 hover:cursor-pointer">Khôi phục</button>

                ) : (
                    <>
                        <Link href={`/admin/product/edit/${product.id}`}
                            className="py-4 hover:text-orange-500 hover:cursor-pointer">Sửa</Link>
                        <button onClick={() => deleteClickHandle(product.id)} className="py-4 hover:text-orange-500 hover:cursor-pointer">Xóa</button>
                    </>
                )}
            </td>
        </tr>
    );
}

function NextPageArea({ fetchProd }: { fetchProd: () => void }) {
    return (
        <div className="flex justify-center-safe">
            <SeeMoreButton onClick={fetchProd}>Xem thêm ...</SeeMoreButton>
            {/* <button type="button" onClick={fetchProd} className="mx-auto px-3 py-1 border-1 border-gray-300 rounded-md hover:bg-gray-100">Xem thêm...</button> */}
        </div>
    )
}