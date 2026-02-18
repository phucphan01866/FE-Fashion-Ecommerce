'use client'
import Input, { InputField, InputSelect, TextArea, InputToggle, TypeInputSelect, ControllableInputSelect } from "@/app/ui/general/Input/Input";
import { Title, Divider, sectionCSS } from "../../general/general";
import { useState, useEffect } from "react";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { adminPromotionService, PromotionFormData } from "@/service/promotion.service";
import { useRouter } from "next/navigation";
import ProductAppliedForm from "./ProductAppliedForm";
import { getSuppliers } from "@/service/supplier.service";
import { getCategories } from "@/service/category.service";
import { useParams } from "next/navigation";

interface ValidationErrors {
    code?: string;
    name?: string;
    value?: string;
    start_date?: string;
    end_date?: string;
    usage_limit?: string;
}

interface Product {
    id: string;
    name: string;
    category_id: string;
    supplier_id: string;
    category?: string;
    supplier?: string;
    price: number;
}

export const formatVND = (value: string, setState: React.Dispatch<React.SetStateAction<number>>) => {
    console.log(value);
    const numericValue = value.replace(/[^0-9]/g, '');
    console.log(numericValue);
    setState(Number(numericValue));
}

export function PromotionForm({ oldData }: { oldData?: PromotionFormData }) {

    const { setNotification } = useNotificateArea();
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApplyForAll, setIsApplyForAll] = useState<boolean>(true);

    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [products, setProducts] = useState<Product[]>([]);
    const params = useParams();

    const router = useRouter();

    const promotionType = [{
        label: "Phần trăm (%)",
        content: "percentage"
    }, {
        label: "Cụ thể (VNĐ)",
        content: "amount"
    }];

    const status = [
        {
            label: "Kích hoạt",
            content: "active"
        },
        {
            label: "Chưa kích hoạt",
            content: "inactive"
        }
    ];

    function formatDateForInput(isoDate: string | undefined): string {
        if (!isoDate) return '';
        try {
            // Chức năng: Extract yyyy-MM-dd from ISO string (2333-11-21T17:00:00.000Z → 2333-11-21)
            return isoDate.split('T')[0];
        } catch (error) {
            console.error('Định dạng ngày không hợp lệ:', isoDate);
            return '';
        }
    }

    function capDateYear(dateString: string): string {
        if (!dateString) return dateString;
        try {
            const [year, month, day] = dateString.split('-').map(Number);
            if (year >= 10000) {
                return `9999-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
            return dateString;
        } catch (error) {
            return dateString;
        }
    }

    const validateForm = (data: PromotionFormData): ValidationErrors => {
        const errors: ValidationErrors = {};
        if (!data.code || data.code.trim() === '') {
            errors.code = 'Bắt buộc';
        } else if (data.code.trim().length < 3) {
            errors.code = 'Ít nhất 3 ký tự';
        } else if (!/^[A-Z0-9]+$/.test(data.code.trim().toUpperCase())) {
            errors.code = 'Chỉ chứa chữ in hoa và số';
        }

        if (!data.name || data.name.trim() === '') {
            errors.name = 'Bắt buộc';
        } else if (data.name.trim().length < 5) {
            errors.name = 'Ít nhất 5 ký tự';
        }

        if (data.value === null || data.value === undefined || isNaN(data.value)) {
            errors.value = 'Bắt buộc';
        } else if (data.value <= 0) {
            errors.value = 'Phải lớn hơn 0';
        } else if (data.type === 'percentage' && data.value > 100) {
            errors.value = 'Không được vượt quá 100%';
        }


        if (!data.start_date) {
            errors.start_date = 'Bắt buộc';
        }

        if (!data.end_date) {
            errors.end_date = 'Bắt buộc';
        }

        if (data.start_date && data.end_date) {
            const startDate = new Date(data.start_date);
            const endDate = new Date(data.end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (endDate < startDate) {
                errors.end_date = 'Phải sau ngày bắt đầu';
            }
        }

        if (data.usage_limit === null || data.usage_limit === undefined || isNaN(data.usage_limit)) {
            errors.usage_limit = 'Bắt buộc';
        } else if (data.usage_limit <= 0) {
            errors.usage_limit = 'Phải lớn hơn 0';
        } else if (!Number.isInteger(data.usage_limit)) {
            errors.usage_limit = 'Phải là số nguyên';
        }

        return errors;
    };

    const [promoValue, setPromoValue] = useState<number>(oldData?.value || 0);
    const [promoType, setPromoType] = useState<'percentage' | 'amount'>(oldData?.type as 'percentage' | 'amount' || 'percentage');
    const [promoMin, setPromoMin] = useState<number>(oldData?.min_order_value || 0);
    const [promoMax, setPromoMax] = useState<number>(oldData?.max_discount_value || 0);
    const [promoStatus, setPromoStatus] = useState<'active' | 'inactive'>(oldData?.status as 'active' | 'inactive' || 'inactive');

    const onInputPromoValue = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (promoType === 'percentage' && Number(numericValue) > 100) {
            setPromoValue(100);
            return;
        }
        setPromoValue(Number(numericValue));
    }

    // Hàm submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        const form = e.currentTarget;
        const formDataRaw = new FormData(form);

        const formData: PromotionFormData = {
            code: (formDataRaw.get('code') as string || '').trim().toUpperCase(),
            name: (formDataRaw.get('name') as string || '').trim(),
            description: (formDataRaw.get('description') as string || '').trim(),
            type: promoType,
            value: promoValue,
            min_order_value: promoMin > 0 ? promoMin
                : null,
            max_discount_value: promoMax > 0 ? promoMax
                : null,
            start_date: capDateYear(formDataRaw.get('start_date') as string) || '',
            end_date: capDateYear(formDataRaw.get('end_date') as string) || '',
            usage_limit: parseInt(formDataRaw.get('usage_limit') as string) || 0,
            status: promoStatus,
            product_ids: isApplyForAll ? null : (Array.from(selectedProducts) || []), // Tạm thời set cứng là []
        };

        const validationErrors = validateForm(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setNotification("Nội dung nhập vào không hợp lệ!")
            return;
        }

        // console.log(formData);
        // return;
        setIsSubmitting(true);
        try {
            // console.log('Form data to submit:', formData);
            if (oldData) {
                const id = params.id as string;
                setNotification(await adminPromotionService.updatePromotion(id, formData));
            } else {
                setNotification(await adminPromotionService.createPromotion(formData));
            }

            router.replace('/admin/promotion')
        } catch (error) {
            setNotification(error instanceof Error ? error.message : "Lỗi không thể lưu mã giảm giá");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [categories, setCategories] = useState<TypeInputSelect[]>([]);
    const [suppliers, setSuppliers] = useState<TypeInputSelect[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setPromoMax(oldData?.max_discount_value || 0);
        setPromoMin(oldData?.min_order_value || 0);
        setPromoValue(oldData?.value || 0);
        (async () => {
            const [categoriesData, suppliersData] = await Promise.all([
                getCategories(),
                getSuppliers()
            ]);
            setCategories(categoriesData.filter(cat => cat.parent_id !== null).map((item) => ({
                label: item.name,
                content: item.id,
            })));
            setSuppliers(suppliersData.map((item) => ({
                label: item.name,
                content: item.id,
            })));
        })();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (oldData?.product_ids) {
            setIsApplyForAll(false);
            const oldSet = new Set(oldData?.product_ids)
            setSelectedProducts(oldSet);
        }
        setPromoMax(oldData?.max_discount_value || 0);
        setPromoMin(oldData?.min_order_value || 0);
        setPromoValue(Number(oldData?.value) || 0);
        console.log((Number(oldData?.value) || 0).toLocaleString('vi-VN'));
        setPromoType(oldData?.type as 'percentage' | 'amount' || 'percentage');
    }, [oldData])

    return (
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <Title additionalCSS="flex justify-between items-center sticky -top-2 block z-[9999]">
                <p>Tạo mã giảm giá</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => { router.replace("/admin/promotion") }}
                        className="fontA4 px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 duration-100 ease-in-out cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="fontA4 px-3 py-2 rounded-md 
                        bg-orange-400 hover:bg-orange-500 transition-all duration-100 ease-in-out cursor-pointer 
                        text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {!oldData ? (isSubmitting ? "Đang lưu..." : "Lưu") : (isSubmitting ? "Đang cập nhật..." : "Cập nhật")}
                    </button>
                </div>
            </Title>
            <div className={`${sectionCSS} AdminProductPage grid grid-cols-[60%_1fr] gap-9`}>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-[40%_1fr] gap-4">
                        <InputField
                            id="code"
                            name="code"
                            label="Mã khuyến mãi"
                            required={true}
                            placeholder="VD: SUMMER2024"
                            error={errors.code}
                            inputBonusCSS="uppercase"
                            defaultValue={oldData?.code}
                        />
                        <InputField
                            id="name"
                            name="name"
                            label="Tên khuyến mãi"
                            required={true}
                            placeholder="Khuyến mãi mùa hè 2024"
                            error={errors.name}
                            defaultValue={oldData?.name}
                        />
                    </div>
                    <div className="grid grid-cols-[1fr_25%] gap-4">
                        <InputField
                            id="value"
                            name="value"
                            label="Giá trị (VNĐ)"
                            required={true}
                            type="text"
                            placeholder="VD: 20 hoặc 50000"
                            error={errors.value}
                            value={promoValue.toLocaleString('vi-VN')}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputPromoValue(e.target.value)}
                        />
                        {/* <InputSelect
                            id="type"
                            name="type"
                            label="Loại giảm giá"
                            items={promotionType}
                            defaultItem={oldData?.type}
                        /> */}
                        <ControllableInputSelect
                            id="type"
                            label="Loại giảm giá"
                            items={promotionType}
                            currentValue={promoType}
                            onClick={(value) => { setPromoType(value as 'percentage' | 'amount') }}
                        />
                    </div>

                    <TextArea
                        bonusCSS="min-h-[3lh]"
                        id="description"
                        name="description"
                        label="Mô tả"
                        placeholder="Mô tả ngắn cho mã khuyến mãi"
                        defaultValue={oldData?.description}
                    />
                    <InputToggle
                        label="Áp dụng chung"
                        id="isApplyForAll"
                        value={isApplyForAll}
                        onChange={() => { setIsApplyForAll(!isApplyForAll) }}
                    />
                    {!isApplyForAll && (
                        <ProductAppliedForm
                            isLoading={isLoading}
                            selectedProducts={selectedProducts}
                            setSelectedProducts={setSelectedProducts}
                            products={products}
                            setProducts={setProducts}
                            categories={[{ label: "Chọn phân loại", content: "" }, ...categories]}
                            suppliers={[{ label: "Chọn nhà cung cấp", content: "" }, ...suppliers]} />
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-[50%_1fr] gap-4">
                        <InputField
                            type="date"
                            id="start_date"
                            name="start_date"
                            label="Bắt đầu"
                            required={true}
                            error={errors.start_date}
                            defaultValue={formatDateForInput(oldData?.start_date)}
                        />
                        <InputField
                            type="date"
                            id="end_date"
                            name="end_date"
                            label="Kết thúc"
                            required={true}
                            error={errors.end_date}
                            defaultValue={formatDateForInput(oldData?.end_date)}
                        />
                    </div>
                    {/* <InputSelect
                        id="status"
                        name="status"
                        label="Trạng thái"
                        items={status}
                        defaultItem={oldData?.status}
                    /> */}
                    <ControllableInputSelect
                        id='status'
                        label="Trạng thái"
                        items={status}
                        currentValue={promoStatus}
                        onClick={(value) => { setPromoStatus(value as 'active' | 'inactive') }}
                    />
                    <InputField
                        id="min_order_value"
                        name="min_order_value"
                        label="Đơn hàng tối thiểu"
                        type="text"
                        placeholder="VD: 500000 VNĐ"
                        value={Number(promoMin).toLocaleString('vi-VN')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            formatVND(e.target.value, setPromoMin);
                        }}
                    // defaultValue={oldData?.min_order_value ? parseFloat(oldData?.min_order_value.toString()).toString() : undefined}
                    />
                    <InputField
                        id="max_discount_value"
                        name="max_discount_value"
                        label="Giảm tối đa"
                        type="text"
                        placeholder="VD: 200000 VNĐ"
                        value={Number(promoMax).toLocaleString('vi-VN')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            formatVND(e.target.value, setPromoMax);
                        }}
                    // defaultValue={oldData?.max_discount_value ? parseFloat(oldData?.max_discount_value.toString()).toString() : undefined}
                    />
                    <InputField
                        id="usage_limit"
                        name="usage_limit"
                        label="Giới hạn lần dùng"
                        required={true}
                        type="number"
                        placeholder="VD: 1000"
                        error={errors.usage_limit}
                        defaultValue={oldData?.usage_limit}
                    />
                </div>
            </div>
        </form>
    )
}