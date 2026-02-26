'use client'

import { InputField, InputSelect, TypeInputSelect, baseInputBlockCSS } from "@/app/ui/general/Input/Input";
import { useState, useEffect } from "react";
import AdminLoadingSkeleton from "@/app/ui/general/skeletons/LoadingSkeleton";
import { searchProducts, TypeSearchProduct } from "@/service/product.service";

// interface SearchParams {
//     search_key: string, category_id?: string, supplier_id?: string
// }

interface Product {
    id: string;
    name: string;
    category_id: string;
    supplier_id: string;
    category?: string;
    supplier?: string;
    price: number;
}

export default function ProductAppliedForm({ isLoading, suppliers, categories, selectedProducts, setSelectedProducts, products, setProducts }: {
    isLoading: boolean,
    suppliers: TypeInputSelect[],
    categories: TypeInputSelect[],
    selectedProducts: Set<string>,
    setSelectedProducts: (newSet: Set<string>) => void,
    products: Product[],
    setProducts: (prods: Product[]) => void,
}) {
    const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
    // const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    // const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');

    useEffect(() => {
        // api call để search
        async function ProductQuickSearch() {
            const inputParams: TypeSearchProduct = {
                search_key: searchTerm.trim(),
                category_id: selectedCategory || undefined,
                supplier_id: selectedSupplier || undefined
            }
            // console.log(selectedCategory);
            if (!inputParams.search_key) {
                setSearchedProducts([]);
                return;
            }
            try {
                const result = await searchProducts(inputParams);
                console.log(result);
                const allProducts = [...products, ...result];
                const uniqueProducts = allProducts.filter((product, index, thisArray) => (
                    index === thisArray.findIndex(p => p.id === product.id)
                ));
                setProducts(uniqueProducts);

                // console.log(uniqueProducts);
                setSearchedProducts(result.map((product) =>
                ({
                    ...product,
                    category: categories.find(cat => cat.content === product.category_id)?.label,
                    supplier: suppliers.find(sup => sup.content === product.supplier_id)?.label,
                })));
            } catch (err) {
                console.error("Lỗi khi tìm kiếm sản phẩm:", err);
            }
        }
        ProductQuickSearch();
    }, [searchTerm, selectedCategory, selectedSupplier]);


    const toggleProduct = (id: string) => {
        const newSelected = new Set(selectedProducts);
        newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
        setSelectedProducts(newSelected);
    };

    const removeProduct = (id: string) => {
        const newSelected = new Set(selectedProducts);
        newSelected.delete(id);
        setSelectedProducts(newSelected);
    };

    const toggleAll = () => {
        const newProductsSet = new Set(selectedProducts);
        const searchedIds = searchedProducts.map((prod) => (prod.id))
        if (!isAllSelectedInSearched) {
            // Thêm hết
            searchedIds.forEach(id => newProductsSet.add(id));
        } else {
            // Xóa hết
            searchedIds.forEach(id => newProductsSet.delete(id));
        }
        setSelectedProducts(newProductsSet);
    };

    // Lấy danh sách sản phẩm đã chọn
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    const isAllSelectedInSearched = searchedProducts.every(prod => selectedProducts.has(prod.id));

    if (isLoading) return <AdminLoadingSkeleton />;

    return (
        <div className={`${baseInputBlockCSS} hover:!bg-white focus-within:!ring-gray-200 py-4`}>
            {/* Danh sách sản phẩm đã chọn - hiển thị phía trên */}
            {selectedProductsList.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="fontA5 font-semibold text-orange-700 mb-2">
                        Đã chọn {selectedProductsList.length} sản phẩm:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {selectedProductsList.map(product => (
                            <div
                                key={product.id}
                                className="flex items-center gap-2 px-3 py-1 bg-white border border-orange-300 rounded-md"
                            >
                                <span className="fontA5">{product.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeProduct(product.id)}
                                    className="text-orange-600 hover:text-orange-800 font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search và filters */}
            <InputField
                id="searchProduct"
                placeholder="Tên sản phẩm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-3">
                <InputSelect
                    id="searchCategory"
                    items={categories}
                    onChange={(value) => setSelectedCategory(value)}
                />
                <InputSelect
                    id="searchSupplier"
                    items={suppliers}
                    onChange={(value) => setSelectedSupplier(value)}
                />
            </div>

            {/* Bảng sản phẩm */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="px-4 py-3 text-left fontA5 font-semibold">Tên sản phẩm</th>
                            <th className="px-4 py-3 text-left fontA5 font-semibold">Phân loại</th>
                            <th className="px-4 py-3 text-left fontA5 font-semibold">Nhà phân phối</th>
                            <th className="px-4 py-3 text-right fontA5 font-semibold">Giá</th>
                            <th className="px-4 py-3 text-center">
                                <input
                                    type="checkbox"
                                    checked={searchedProducts.length > 0 && isAllSelectedInSearched}
                                    onChange={toggleAll}
                                    className="w-4 h-4 cursor-pointer"
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {searchedProducts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    Không tìm thấy sản phẩm nào
                                </td>
                            </tr>
                        ) : (
                            searchedProducts.map(product => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{product.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                                    <td className="px-4 py-3 text-gray-600">{product.supplier}</td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {product.price.toLocaleString('vi-VN')} ₫
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => toggleProduct(product.id)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}