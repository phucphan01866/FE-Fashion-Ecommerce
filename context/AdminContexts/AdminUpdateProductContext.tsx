'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TypeCategory } from "@/service/category.service";
import { useAdminCategoryContext } from "./AdminCategoryContext";
import { TypeSupplier } from "@/service/supplier.service";
import { useAdminSupplierContext } from "./AdminSupplierContext";
import { TypeProduct, TypeProductPayload, getProduct, updateProduct } from "@/service/product.service";
import { TypeVariantPayload } from "@/service/variant.service";
import { useNotificateArea } from "../NotificateAreaContext";
import { getCategories } from "@/service/category.service";
import { getSuppliers } from "@/service/supplier.service";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import { skuCreator } from "@/app/ui/user/admin/product/create/Forms";

export interface updateVariantIndex {
    index: number;
    usingOldVariant: boolean;
}

const baseVariantPayload: TypeVariantPayload = {
    sku: "",
    color_name: "",
    color_code: "",
    sizes: [],
    stock_qty: 0,
    images: [],
    images_files: new Map<number, File>(),
};

export interface ProductFormErrors {
    productName?: string;
    productPrice?: string;
    productDescription?: string;
    productCategory?: string;
    productSupplier?: string;
    productImages?: string;
}

export interface VariantFormErrors {
    id: number;
    sizes?: string;
    stock?: string;
    colorName?: string;
    colorCode?: string;
    images?: string;
}

interface AdminUpdateProductContextType {
    categoryList: TypeCategory[];
    supplierList: TypeSupplier[];
    oldProductInputs: TypeProductPayload;
    oldVariantsInput: TypeVariantPayload[];
    variantsIndex: updateVariantIndex[];
    addVariant: () => void;
    removeVariant: (index: number) => void;
    isUploading: boolean;
    updateProductPayload: (input: Partial<TypeProductPayload>) => void;
    oldProductPayload: TypeProductPayload;
    productPayload: TypeProductPayload;
    variantsPayload: TypeVariantPayload[];
    updateVariantsPayload: (index: number, input: Partial<TypeVariantPayload>) => void;
    onSave: () => void;
}

const AdminUpdateProductContext = createContext<AdminUpdateProductContextType | undefined>(undefined);

export function AdminUpdateProductProvider({ children }: { children: React.ReactNode }) {
    // const categoryList = useAdminCategoryContext().categoryList;
    // const supplierList = useAdminSupplierContext().supplierList;
    const [categoryList, setCategoryList] = useState<TypeCategory[]>([]);
    const [supplierList, setSupplierList] = useState<TypeSupplier[]>([]);
    const { setNotification } = useNotificateArea();

    const [oldProductInputs, setOldProductInputs] = useState<TypeProductPayload>(baseProductPayloadConstructor());
    const [oldVariantsInput, setOldVariantsInput] = useState<TypeVariantPayload[]>([]);
    const [oldProductPayload, setOldProductPayload] = useState<TypeProductPayload>(baseProductPayloadConstructor());

    const [variantsIndex, setVariantsIndex] = useState<updateVariantIndex[]>([{ index: 0, usingOldVariant: false }]);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [productPayload, setProductPayload] = useState<TypeProductPayload>(baseProductPayloadConstructor());
    const [productFormErrors, setProductFormErrors] = useState<ProductFormErrors>({});
    const [variantsPayload, setVariantsPayload] = useState<TypeVariantPayload[]>([]);
    const [variantFormErrors, setVariantFormErrors] = useState<VariantFormErrors[]>([]);

    const params = useParams();
    const id = params?.id as string;

    const updateProductPayload = (input: Partial<TypeProductPayload>) => {
        setProductPayload(prev => ({
            ...prev,
            ...input
        }));
    }

    const updateVariantsPayload = (index: number, input: Partial<TypeVariantPayload>) => {
        setVariantsPayload(prev => prev.map((variant, varIndex) => {
            if (varIndex === index) {
                return {
                    ...variant,
                    ...input
                };
            } else {
                return variant;
            }
        }));
    }

    useEffect(() => {
        if (!id) {
            setNotification("ID sản phẩm không hợp lệ");
            return;
        }
        (async () => {
            try {
                const categoryResponse = await getCategories();
                setCategoryList(categoryResponse);
                const supplierResponse = await getSuppliers();
                setSupplierList(supplierResponse);

                const oldProduct = await getProduct(id);
                const oldVariants = oldProduct.variants;

                setOldProductInputs(oldProduct);
                setOldVariantsInput(oldVariants);
                setVariantsIndex(oldVariants.map((variant, index) => ({
                    index,
                    usingOldVariant: true,
                })));

                setOldProductPayload(oldProduct);
                let newPayload;
                if (categoryResponse !== undefined && supplierResponse !== undefined) {
                    newPayload = {
                        ...oldProduct,
                        category_id: categoryResponse.find(cat => cat.name === oldProduct.category_name)?.id || "123",
                        supplier_id: supplierResponse.find(sup => sup.name === oldProduct.supplier_name)?.id || "123",
                        product_images_files: new Map<number, File>(),
                    };
                    setProductPayload(newPayload);
                    setVariantsPayload(oldVariants);
                }
                // console.log("newPayload: ", newPayload);
                console.log("old prod: ", oldProduct);
                console.log("old vars: ", oldVariants);
            } catch (err) {
                setNotification(`Xảy ra lỗi khi tải sản phẩm: ${err}`);
            }
        })();
    }, [id]);

    function addVariant() {
        setVariantsPayload(prev => [...prev, baseVariantPayload])
    }

    function removeVariant(index: number) {
        setVariantsPayload(prev =>
            prev.filter((variant, varIndex) => varIndex !== index)
        )
    }
    const router = useRouter();
    async function onSave() {
        console.log(productPayload);
        console.log(variantsPayload);
        const prodErrorNum = validateProductData();
        const varsHasError = validateVariantsData();
        try {
            if (prodErrorNum !== 0 || varsHasError) {
                throw new Error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại");
            }
            let newProductPayload = { ...productPayload };
            if (productPayload.product_images_files && productPayload.product_images_files.size > 0) {
                const uploadPromises = Array.from(productPayload.product_images_files.entries()).map(
                    async ([index, file]) => {
                        const url = await uploadToCloudinary(file, `product/${productPayload.name}`);
                        return { index, url };
                    }
                );

                const uploadResults = await Promise.all(uploadPromises);
                const urls = new Map<number, string>();
                uploadResults.forEach(({ index, url }) => {
                    urls.set(index, url.imageUrl);
                });
                if (productPayload.images) {
                    productPayload.images.map((img, idx) => {
                        if (!urls.has(idx)) {
                            urls.set(idx, img);
                        }
                        return null;
                    })
                }
                const sortedUrls = Array.from([...urls].sort((a, b) => a[0] - b[0])).map(([_, url]) => url);
                updateProductPayload({ images: sortedUrls });
                newProductPayload = {
                    ...newProductPayload,
                    images: sortedUrls,
                }
            }

            const variantUploadPromises = variantsPayload.flatMap((variant, variantIndex) => {
                if (variant.images_files && variant.images_files.size > 0) {
                    return Array.from(variant.images_files.entries()).map(
                        async ([imageIndex, file]) => {
                            const url = await uploadToCloudinary(file, `product/${productPayload.name}/variant/${variant.sku}`);
                            const imgUrl = url.imageUrl
                            return { variantIndex, imageIndex, imgUrl };
                        }
                    );
                }
                return [];
            });

            const variantUploadResults = await Promise.all(variantUploadPromises);
            if (variantUploadResults.length > 0) {
                const newVariants = variantsPayload.map((variant, vIndex) => {
                    const relatedUploads = variantUploadResults.filter(res => res.variantIndex === vIndex);
                    if (relatedUploads.length > 0) {
                        const relatedSorted = relatedUploads.sort((a, b) => a.imageIndex - b.imageIndex);
                        console.log(relatedUploads);
                        const newImages = variant.images.map((img, imgIdx) => {
                            const upload = relatedSorted.find(res => res.imageIndex === imgIdx);
                            if (upload) {
                                return upload.imgUrl;
                            } else {
                                return img;
                            }
                        });
                        relatedSorted.forEach(res => {
                            if (res.imageIndex >= newImages.length) {
                                newImages.push(res.imgUrl);
                            }
                        })
                        return {
                            ...variant,
                            images: newImages,
                        }
                    }
                    return variant;
                })
                // console.log(newVariants);
                newProductPayload = {
                    ...newProductPayload,
                    variants: newVariants as any,
                }
                submit(newProductPayload, newVariants as any);
                return;
            }
            const payload = {
                ...newProductPayload,
                variants: variantsPayload as any,
            }
            submit(newProductPayload, variantsPayload);
            return;
        } catch (err) {
            setNotification((err as Error).message);
            return;
        }
    }

    function validateProductData() {
        const formErrors: ProductFormErrors = {};

        // Validate product name
        const name = productPayload.name.trim();
        if (!name) {
            formErrors.productName = "Tên sản phẩm không được để trống";
        } else if (name.length < 3) {
            formErrors.productName = "Tên sản phẩm phải có ít nhất 3 ký tự";
        } else if (name.length > 100) {
            formErrors.productName = "Tên sản phẩm không được vượt quá 100 ký tự";
        }

        // Validate price
        const priceStr = productPayload.price.toString().trim();
        const price = Number(priceStr) || 0;
        if (!priceStr) {
            formErrors.productPrice = "Giá sản phẩm không được để trống";
        } else if (isNaN(price) || price <= 0) {
            formErrors.productPrice = "Giá sản phẩm phải là số lớn hơn 0";
        }

        // Validate description
        const description = productPayload.description.trim();
        if (!description) {
            formErrors.productDescription = "Mô tả sản phẩm không được để trống";
        } else if (description.length < 10) {
            formErrors.productDescription = "Mô tả phải có ít nhất 10 ký tự";
        } else if (description.length > 2000) {
            formErrors.productDescription = "Mô tả không được vượt quá 2000 ký tự";
        }

        // Validate category
        const category_id = productPayload.category_id;
        if (!category_id) {
            formErrors.productCategory = "Vui lòng chọn danh mục sản phẩm";
        }

        // Validate supplier
        const supplier_id = productPayload.supplier_id;
        if (!supplier_id) {
            formErrors.productSupplier = "Vui lòng chọn nhà cung cấp";
        }

        if (Object.keys(formErrors).length > 0) {
            // console.log('Product validation errors:', formErrors);
            setProductFormErrors(formErrors);
            // throw new Error("Dữ liệu sản phẩm không hợp lệ");
        } else {
            setProductFormErrors({});
        }
        return Object.keys(formErrors).length;

    }

    function validateVariantsData() {
        const variantErrors: VariantFormErrors[] = [];

        // Validate từng variant trước khi upload
        variantsPayload.map((variant, index) => {
            const errors: VariantFormErrors = { id: index };

            // Validate color name
            const color_name = variant.color_name.trim();
            if (!color_name) {
                errors.colorName = "Tên màu sắc không được để trống";
            } else if (color_name.length < 2) {
                errors.colorName = "Tên màu phải có ít nhất 2 ký tự";
            } else if (color_name.length > 50) {
                errors.colorName = "Tên màu không được vượt quá 50 ký tự";
            }

            // Validate color code (Hex format)
            const color_code = variant.color_code.trim();
            const hexRegex = /^#[0-9A-Fa-f]{6}$/;
            if (!color_code) {
                errors.colorCode = "Mã màu không được để trống";
            } else if (!hexRegex.test(color_code)) {
                errors.colorCode = "Mã màu phải đúng định dạng Hex (VD: #FF0000)";
            }

            // Validate sizes
            const sizes = variant.sizes.filter(size => size !== "");
            if (sizes.length === 0) {
                errors.sizes = "Vui lòng chọn ít nhất 1 kích thước";
            }

            // Validate stock
            const stock_qty = variant.stock_qty;
            if (isNaN(stock_qty) || stock_qty < 0) {
                errors.stock = "Tồn kho phải là số không âm";
            } else if (stock_qty > 999999) {
                errors.stock = "Tồn kho không hợp lệ";
            }
            variantErrors.push(errors);

        });

        // Kiểm tra xem có lỗi nào không (ngoại trừ field 'id')
        const hasErrors = variantErrors.some(varError =>
            Object.keys(varError).length > 1
        );

        if (hasErrors) {
            // console.log('Variant validation errors:', variantErrors);
            setVariantFormErrors(variantErrors);
            // throw new Error("Dữ liệu phân loại sản phẩm không hợp lệ");
        }
        setVariantFormErrors([]);
        return hasErrors;
    }

    function baseProductPayloadConstructor(): TypeProductPayload {
        return {
            name: "",
            description: "",
            category_id: "",
            supplier_id: "",
            price: 0,
            sale_percent: 0,
            is_flash_sale: false,
            images: [],
            variants: [],
        };
    }

    async function submit(productPayload: TypeProductPayload, variantsPayload: TypeVariantPayload[]) {
        setIsUploading(true);
        const newVariants = variantsPayload.map(variant => {
            return {
                ...variant,
                sku: variant.sku.length > 0 ? variant.sku : skuCreator([productPayload.name, categoryList.find(cat => cat.id === productPayload.category_id)?.name || "", supplierList.find(sup => sup.id === productPayload.supplier_id)?.name || "", variant.color_name]),
            }
            // const sku = skuCreator([newProduct.name, categoryName, supplierName, color_name]);
        })
        const data: TypeProductPayload = {
            ...productPayload,
            variants: newVariants as any,
        }
        const result = await updateProduct(id, data);
        setNotification(result);
        setIsUploading(false);
        router.back();
    }

    return (
        <AdminUpdateProductContext.Provider value={{
            categoryList,
            supplierList,
            oldProductInputs,
            oldVariantsInput,
            variantsIndex,
            addVariant,
            removeVariant,
            isUploading,
            updateProductPayload,
            oldProductPayload,
            productPayload,
            variantsPayload,
            updateVariantsPayload,
            onSave,
        }}>
            {children}
        </AdminUpdateProductContext.Provider>
    );
}

export const useAdminUpdateProductContext = () => {
    const context = useContext(AdminUpdateProductContext);
    if (!context) {
        throw new Error('useAdminUpdateProductContext must be used within AdminUpdateProductProvider');
    }
    return context;
};