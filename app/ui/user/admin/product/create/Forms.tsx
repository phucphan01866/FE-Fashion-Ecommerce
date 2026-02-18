
'use client'

import { Title } from "@/app/ui/user/general/general";
import ProductForm from "@/app/ui/user/admin/product/create/ProductForm";
import VariantForms from "@/app/ui/user/admin/product/create/VariantForms";
import { useRef, useState } from "react";
import { TypeProductPayload } from "@/service/product.service";
import { TypeVariantPayload } from "@/service/variant.service";
import { useAdminCreateProductContext } from "@/context/AdminContexts/AdminCreateProductContext";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import { useNotificateArea } from "@/context/NotificateAreaContext";

export function skuCreator(input: string[]) {
    const result = input.map(item => item.trim()).join("-");
    return result;
}

export interface ProductFormErrors {
    productName?: string;
    productPrice?: string;
    productDescription?: string;
    productCategory?: string;
    productSupplier?: string;
    productImages?: {
        main?: string;
        sub1?: string;
        sub2?: string;
        sub3?: string;
    };
}

export interface VariantFormErrors {
    id: number;
    sizes?: string;
    stock?: string;
    colorName?: string;
    colorCode?: string;
    images?: {
        main?: string;
        sub1?: string;
        sub2?: string;
        sub3?: string;
    };
}


export default function Forms() {
    const formProductRef = useRef<HTMLFormElement>(null);
    const formVariantRef = useRef<HTMLFormElement[]>([]);
    const { setNotification } = useNotificateArea();
    const { isUploading, categoryList, supplierList, setIsUploading, submit, variantsIndex } = useAdminCreateProductContext();
    const [productFormErrors, setProductFormErrors] = useState<ProductFormErrors>();
    const [variantsFormErrors, setVariantsFormErrors] = useState<VariantFormErrors[]>();

    function onSave() {
        const productFormData = new FormData(formProductRef.current!);
        const variantFormsData = formVariantRef.current
            .map((formRef) => {
                return new FormData(formRef)
            })
        processData(productFormData, variantFormsData);
    }

    async function processData(prodFormData: FormData, varFormData: FormData[]) {
        try {
            setIsUploading(true);
            const newProduct = await getAndValidateProductData(prodFormData);
            const newVariants = await getAndValidateVariantsData(varFormData, newProduct);
            await submit({ ...newProduct, variants: newVariants });
        } catch (err) {
            console.log(err);
            setNotification(`Nội dung sản phẩm không hợp lệ: ${err instanceof Error ? err.message : err}`);
            setIsUploading(false);
        }
    }

    async function getAndValidateProductData(formData: FormData): Promise<TypeProductPayload> {
        const formErrors: ProductFormErrors = {};
        // Validate product name
        const name = formData.get("productName")?.toString().trim() || "";
        if (!name) {
            formErrors.productName = "Tên sản phẩm không được để trống";
        } else if (name.length < 3) {
            formErrors.productName = "Tên sản phẩm phải có ít nhất 3 ký tự";
        } else if (name.length > 100) {
            formErrors.productName = "Tên sản phẩm không được vượt quá 100 ký tự";
        }

        // Validate price
        const priceStr = formData.get("productPrice")?.toString().trim().replace(/\./g,'') || "";
        const price = Number(priceStr) || 0;
        if (!priceStr) {
            formErrors.productPrice = "Giá sản phẩm không được để trống";
        } else if (isNaN(price) || price <= 0) {
            formErrors.productPrice = "Giá sản phẩm phải là số lớn hơn 0";
        }

        // Validate description
        const description = formData.get("productDescription")?.toString().trim() || "";
        if (!description) {
            formErrors.productDescription = "Mô tả sản phẩm không được để trống";
        } else if (description.length < 10) {
            formErrors.productDescription = "Mô tả phải có ít nhất 10 ký tự";
        } else if (description.length > 2000) {
            formErrors.productDescription = "Mô tả không được vượt quá 2000 ký tự";
        }

        // Validate category
        const category_id = formData.get("productCategory")?.toString() || "";
        if (!category_id) {
            formErrors.productCategory = "Vui lòng chọn danh mục sản phẩm";
        }

        // Validate supplier
        const supplier_id = formData.get("productSupplier")?.toString() || "";
        if (!supplier_id) {
            formErrors.productSupplier = "Vui lòng chọn nhà cung cấp";
        }

        // Validate images
        const imageinputs: (File | null)[] = [
            formData.get("productImage-main") as File | null,
            formData.get("productImage-sub1") as File | null,
            formData.get("productImage-sub2") as File | null,
            formData.get("productImage-sub3") as File | null
        ];

        const mainImage = imageinputs[0];
        if (!mainImage || mainImage.size === 0) {
            formErrors.productImages = {
                ...formErrors.productImages,
                main: "Thiếu ảnh đại diện cho sản phẩm"
            };
        } else {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(mainImage.type)) {
                formErrors.productImages = {
                    ...formErrors.productImages,
                    main: "Chỉ chấp nhận JPG, PNG, WEBP"
                };
            }
            else if (mainImage.size > 5 * 1024 * 1024) {
                formErrors.productImages = {
                    ...formErrors.productImages,
                    main: "Kích thước không được vượt quá 5MB"
                };
            }
        }
        const subImageTypes = ['sub1', 'sub2', 'sub3'] as const;
        imageinputs.slice(1).forEach((img, idx) => {
            if (img && img.size > 0) {
                const imageKey = subImageTypes[idx];
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(img.type)) {
                    formErrors.productImages = {
                        ...formErrors.productImages,
                        [imageKey]: "Định dạng ảnh không hợp lệ"
                    };
                } else if (img.size > 5 * 1024 * 1024) {
                    formErrors.productImages = {
                        ...formErrors.productImages,
                        [imageKey]: "Kích thước ảnh không được vượt quá 5MB"
                    };
                }
            }
        });

        if (Object.keys(formErrors).length > 0) {
            console.log(formErrors);
            setProductFormErrors(formErrors);
            throw new Error;
        }
        setProductFormErrors({}); // Nếu không có lỗi thì xóa các lỗi của lần trước đó

        const inputNameList = ["productImage-main", "productImage-sub1", "productImage-sub2", "productImage-sub3"]
        const imagesList: string[] = await Promise.all(
            imageinputs
                .map(async (input, index) => {
                    if (input && input.size > 0) {
                        const result = await uploadToCloudinary(input!, `product/${name}`, inputNameList[index]);
                        return result.imageUrl;
                    }
                    return "";
                })
        );
        const images = imagesList.filter((imageURL) => (imageURL !== ""));
        console.log(images);

        return {
            name,
            description,
            category_id,
            supplier_id,
            price,
            sale_percent: 0,
            is_flash_sale: false,
            images,
            variants: [],
        };
    }

    async function getAndValidateVariantsData(formDataArray: FormData[], newProduct: TypeProductPayload): Promise<TypeVariantPayload[]> {
        const variantErrors: VariantFormErrors[] = [];

        for (let i = 0; i < formDataArray.length; i++) {
            console.log(formDataArray);
            const form = formDataArray[i];
            const index = Number(form.get("index"));
            if (variantsIndex.some(arrayIndex => arrayIndex === index)) {
                const errors: VariantFormErrors = { id: index };

                const color_name = form.get("colorName")?.toString().trim() || "";
                if (!color_name) {
                    errors.colorName = "Tên màu sắc không được để trống";
                } else if (color_name.length < 2) {
                    errors.colorName = "Tên màu phải có ít nhất 2 ký tự";
                } else if (color_name.length > 50) {
                    errors.colorName = "Tên màu không được vượt quá 50 ký tự";
                }

                const color_code = form.get("colorCode")?.toString().trim() || "";
                const hexRegex = /^#[0-9A-Fa-f]{6}$/;
                console.log(color_code);
                if (!color_code) {
                    errors.colorCode = "Mã màu không được để trống";
                } else if (!hexRegex.test(color_code)) {
                    errors.colorCode = "Mã màu phải đúng định dạng Hex (VD: #FF0000)";
                }

                const sizes = (form.getAll("size") as string[]).filter(size => size !== "");

                const stock_qty = Number(form.get("stock"));
                if (isNaN(stock_qty) || stock_qty < 0) {
                    errors.stock = "Tồn kho phải là số không âm";
                    // } else if (stock_qty === 0) {
                    //     errors.stock = "Tồn kho phải lớn hơn 0";
                } else if (stock_qty > 999999) {
                    errors.stock = "Tồn kho không hợp lệ";
                }

                const imageinputs: (File | null)[] = [
                    form.get("productImage-main") as File | null,
                    form.get("productImage-sub1") as File | null,
                    form.get("productImage-sub2") as File | null,
                    form.get("productImage-sub3") as File | null,
                ];

                const mainImage = imageinputs[0];
                if (!mainImage || mainImage.size === 0) {
                    errors.images = {
                        ...errors.images,
                        main: "Thiếu ảnh đại diện cho chủng loại số " + index
                    };
                } else {
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                    if (!allowedTypes.includes(mainImage.type)) {
                        errors.images = {
                            ...errors.images,
                            main: "Chỉ chấp nhận JPG, PNG, WEBP"
                        };
                    } else if (mainImage.size > 5 * 1024 * 1024) {
                        errors.images = {
                            ...errors.images,
                            main: "Kích thước không được vượt quá 5MB"
                        };
                    }
                }

                const subImageTypes = ['sub1', 'sub2', 'sub3'] as const;
                imageinputs.slice(1).forEach((img, idx) => {
                    if (img && img.size > 0) {
                        const imageKey = subImageTypes[idx];
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                        if (!allowedTypes.includes(img.type)) {
                            errors.images = {
                                ...errors.images,
                                [imageKey]: "Định dạng ảnh không hợp lệ"
                            };
                        } else if (img.size > 5 * 1024 * 1024) {
                            errors.images = {
                                ...errors.images,
                                [imageKey]: "Kích thước không được vượt quá 5MB"
                            };
                        }
                    }
                });
                variantErrors.push(errors);
            }
        }

        const hasErrors = variantErrors.some(varError =>
            Object.keys(varError).length > 1
        );

        if (hasErrors) {
            console.log(variantErrors);
            setVariantsFormErrors(variantErrors);
            throw new Error("Dữ liệu phân loại sản phẩm không hợp lệ");
        }

        setVariantsFormErrors([]);

        const variants: TypeVariantPayload[] = await Promise.all(
            formDataArray.map(async (form, arrayIndex) => {
                const index = Number(form.get("index"));
                const color_name = form.get("colorName")?.toString().trim() || "";
                const color_code = form.get("colorCode")?.toString().trim() || "";
                const sizes = (form.getAll("size") as string[]).filter(size => size !== "");
                const stock_qty = Number(form.get("stock"));

                const categoryName = categoryList.find(
                    category => category.id === newProduct.category_id
                )?.name || "UNKNOWN_CATEGORY";
                const supplierName = supplierList.find(
                    supplier => supplier.id === newProduct.supplier_id
                )?.name || "UNKNOWN_SUPPLIER";
                const sku = skuCreator([newProduct.name, categoryName, supplierName, color_name]);

                const imageinputs: (File | null)[] = [
                    form.get("productImage-main") as File | null,
                    form.get("productImage-sub1") as File | null,
                    form.get("productImage-sub2") as File | null,
                    form.get("productImage-sub3") as File | null,
                ];

                const inputNameList = ["main", "sub1", "sub2", "sub3"];
                const imagesList: string[] = await Promise.all(
                    imageinputs.map(async (input, imgIndex) => {
                        if (input && input.size > 0) {
                            const result = await uploadToCloudinary(
                                input,
                                `product/${newProduct.name}/variant/${sku}`,
                                inputNameList[imgIndex]
                            );
                            return result.imageUrl;
                        }
                        return "";
                    })
                );

                const images = imagesList.filter((imageURL) => imageURL !== "");

                return {
                    sku,
                    color_name,
                    color_code,
                    sizes,
                    stock_qty,
                    images,
                };
            })
        );

        return variants;
    }

    return (
        <>
            <Title additionalCSS="flex justify-between items-center sticky -top-2 block z-[9999]">
                <p>Tạo sản phẩm</p>
                <div className="flex gap-3">
                    <button onClick={() => window.history.back()} className="fontA4 px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Hủy</button>
                    <button disabled={isUploading} onClick={onSave} className="fontA4 px-3 py-2 rounded-md bg-orange-500 hover:bg-orange-400 text-white">{!isUploading ? "Lưu" : "Đang lưu..."}</button>
                </div>
            </Title>
            <div className={`AdminProductPage flex flex-col gap-3`}>
                <ProductForm ref={formProductRef} errors={productFormErrors} />
                <VariantForms formRefs={formVariantRef} errors={variantsFormErrors} />
            </div>
        </>
    )
}