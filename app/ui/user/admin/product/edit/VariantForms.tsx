'use client'
import { Divider } from "@/app/ui/cart/General";
import { sectionCSS } from "../../../general/general";
import { InputField, baseInputBlockCSS } from "@/app/ui/general/Input/Input";
import Image from "next/image";
import { internationalSizes } from "@/app/demo";
import { TypeVariantPayload } from "@/service/variant.service";
import { useAdminUpdateProductContext } from "@/context/AdminContexts/AdminUpdateProductContext";
import { useState, useEffect } from "react";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { VariantFormErrors } from "./Forms";
import { useNotificateArea } from "@/context/NotificateAreaContext";

interface VariantFormsProps {
    errors?: VariantFormErrors[];
}

export default function VariantForms({ errors = [] }: VariantFormsProps) {
    const { variantsPayload, updateVariantsPayload, removeVariant } = useAdminUpdateProductContext();
    return (
        <div className="flex flex-col gap-3">
            {variantsPayload.map((variant, index) => {
                const errorForThisVariant = errors.find(err => err.id === index) || { id: index };
                return (
                    <div
                        key={index}
                        className="flex flex-col gap-3">
                        <VariantForm
                            index={index}
                            variantPayload={variant}
                            errors={errorForThisVariant}
                            updateVariantsPayload={updateVariantsPayload}
                            removeVariant={removeVariant}
                        />
                        {index === variantsPayload.length - 1 ? (
                            <AddVariantButton />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

interface VariantFormProps {
    index: number;
    variantPayload: TypeVariantPayload;
    errors: VariantFormErrors;
    updateVariantsPayload: (index: number, input: Partial<TypeVariantPayload>) => void;
    removeVariant: (index: number) => void;
}

function VariantForm({ index, variantPayload, errors, updateVariantsPayload, removeVariant }: VariantFormProps) {
    return (
        <div className={`grid grid-cols-[100%] gap-3 rounded-xl bg-white border-2 border-gray-200`}>
            <div className="grid grid-cols-[60%_1fr] gap-3">
                <LeftForm index={index} variantPayload={variantPayload} errors={errors} updateVariantsPayload={updateVariantsPayload} removeVariant={removeVariant} />
                <RightForm index={index} variantPayload={variantPayload} errors={errors} updateVariantsPayload={updateVariantsPayload} removeVariant={removeVariant} />
            </div>
            <input name="index" type="hidden" readOnly value={index} />
        </div>
    );
}

interface FormSectionProps {
    index: number;
    variantPayload: TypeVariantPayload;
    errors: VariantFormErrors;
    updateVariantsPayload: (index: number, input: Partial<TypeVariantPayload>) => void;
    removeVariant: (index: number) => void;
}

function LeftForm({ index, variantPayload, errors, updateVariantsPayload, removeVariant }: FormSectionProps) {
    function preRemoveVariant(index: number) {
        confirm('Bạn có chắc muốn xóa chủng loại sản phẩm này không?') &&
            removeVariant(index);
    }

    return (
        <div className={`${sectionCSS} flex flex-col gap-4 border-none`}>
            <h3 className="fontA3">Phân loại sản phẩm #{index + 1}</h3>
            <Divider />

            <div className="flex gap-2">
                <div className="flex-1">
                    <SizeSelectionArea
                        index={index}
                        selectedSizes={variantPayload.sizes || []}
                        updateVariantsPayload={updateVariantsPayload}
                    />
                    {errors.sizes && (
                        <p className="text-red-500 text-sm mt-1">{errors.sizes}</p>
                    )}
                </div>

                <div className="flex-1">
                    <InputField
                        required={true}
                        id=""
                        label="Tồn kho"
                        type="number"
                        wrapperBonusCSS="h-full"
                        value={variantPayload.stock_qty || 0}
                        error={errors.stock}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVariantsPayload(index, { stock_qty: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div>
                <ColorSelectionArea
                    index={index}
                    colorName={variantPayload.color_name}
                    colorCode={variantPayload.color_code}
                    updateVariantsPayload={updateVariantsPayload}
                />
                {errors.colorName && (
                    <p className="text-red-500 text-sm mt-1">{errors.colorName}</p>
                )}
                {errors.colorCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.colorCode}</p>
                )}
            </div>

            <div className="flex flex-1 flex-col justify-end">
                <button
                    disabled={true}
                    type="button"
                    onClick={() => preRemoveVariant(index)}
                    className="w-fit p-1.5 rounded-lg bg-gray-200 hover:bg-gray-100 cursor-not-allowed opacity-50"
                >
                    <Image src="/icon/trash-x-filled.svg" alt="delete variant" width={24} height={24} />
                </button>
            </div>
        </div>
    )
}

function SizeSelectionArea({ index, selectedSizes, updateVariantsPayload }: {
    index: number;
    selectedSizes: string[];
    updateVariantsPayload: (index: number, input: Partial<TypeVariantPayload>) => void;
}) {
    // const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

    function toggleSelectedSizes(inputSize: string) {
        if (selectedSizes.length > 0 && selectedSizes.some(arraySize => inputSize === arraySize)) {
            // setSelectedSizes(selectedSizes.filter((arraySize) => arraySize !== inputSize));
            updateVariantsPayload(index, {
                sizes: selectedSizes.filter((arraySize) => arraySize !== inputSize)
            })
        } else {
            // setSelectedSizes([...selectedSizes, inputSize]);
            updateVariantsPayload(index, {
                sizes: [...selectedSizes, inputSize]
            })
        }
    }

    // useEffect(() => {
    //     if (defaultSizeSelected) {
    //         setSelectedSizes(defaultSizeSelected);
    //     }
    // }, [defaultSizeSelected]);

    return (
        <div className={`grid gap-2 ${baseInputBlockCSS}`}>
            <label className="fontA5" htmlFor={`size-${index}`}>
                Kích thước <span className="text-red-500">*</span>
            </label>
            <input id={`size-${index}`} name={`size`} className="hidden" type="string" required />
            <div className="flex gap-2">
                {internationalSizes.map((size, idx) => (
                    <SizeButton
                        key={idx}
                        size={size}
                        selected={selectedSizes.some(arraySize => arraySize === size)}
                        toggleSelectedSizes={toggleSelectedSizes}
                    />
                ))}
            </div>
            <select
                id={`size-${index}`}
                name={`size`}
                className="hidden"
                value={selectedSizes}
                onChange={() => null}
                required
                multiple
            >
                {internationalSizes.map((size, idx) => (
                    <option key={idx} value={size}>{size}</option>
                ))}
            </select>
        </div>
    )
}

function SizeButton({ size, selected = false, toggleSelectedSizes }: {
    size: string;
    selected?: boolean;
    toggleSelectedSizes: (input: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => toggleSelectedSizes(size)}
            className={`transition-all duration-200 ease-in-out
                px-3 py-2 bg-gray-50 border-1 border-gray-200 hover:bg-gray-200 rounded-md fontA5
                ${selected && 'bg-orange-500 hover:bg-orange-500 border-orange-200 hover:scale-105 text-white'}`}
        >
            {size}
        </button>
    );
}

function ColorSelectionArea({ index, colorName, colorCode, updateVariantsPayload }: {
    index: number;
    colorName?: string;
    colorCode?: string;
    updateVariantsPayload: (index: number, input: Partial<TypeVariantPayload>) => void;
}) {
    function onInputColor(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.value.length > 7 || e.target.value.length === 0) return;
        const toNumber = e.target.value.replace(/[^0-9]/g, '');
        const value = `#${toNumber}`;
        // if (e.target.value.charAt(0) !== "#") e.target.value = "#";
        e.target.value = value;
        updateVariantsPayload(index, { color_code: value });
        console.log(value);
    }
    return (
        <div className="grid gap-2">
            <div className="flex gap-2">
                <InputField
                    required={true}
                    label="Màu sắc"
                    type="text"
                    // defaultValue={defaultColorName}
                    value={colorName || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { updateVariantsPayload(index, { color_name: e.target.value }) }}
                    id={`colorName-${index}`}
                    name="colorName"
                    placeholder="Tên màu sắc"
                />

                <InputField
                    required={true}
                    // onChange={onInputColor}
                    label="Mã màu (Hex)"
                    // defaultValue={defaultColorCode || "#"}
                    value={(colorCode && colorCode.length > 0) ? colorCode : '#'}
                    onChange={onInputColor}
                    minLength={1}
                    maxLength={7}
                    id={`colorCode-${index}`}
                    name="colorCode"
                    placeholder="VD: #101010"
                />

                <ColorBlock colorCode={colorCode || ""} />
            </div>
        </div>
    )
}

function ColorBlock({ colorCode }: { colorCode: string }) {
    return (
        <div
            style={{ backgroundColor: colorCode }}
            className={`transition-colors duration-200 ease-in-out relative h-full aspect-1/1 border-2 border-gray-200 rounded-md `}
        />
    )
}

function RightForm({ index, errors, variantPayload, updateVariantsPayload }: FormSectionProps) {
    function updateImage(variantIndex: number, imageIndex: number, newImageFile: File | null) {
        const newImagesFiles = variantPayload.images_files || new Map<number, File>();
        if (newImageFile === null) {
            updateVariantsPayload(variantIndex, { images_files: new Map<number, File>([...newImagesFiles].filter(([i, _]) => i !== imageIndex)) });
        } else {
            updateVariantsPayload(variantIndex, { images_files: new Map<number, File>([...newImagesFiles, [imageIndex, newImageFile]]) });
        }
    }
    return (
        <div className={`${sectionCSS} border-none`}>
            {/* <p>Ảnh sản phẩm</p> */}
            <div className="grid gap-2">
                <div>
                    <InputImage
                        type="main"
                        id={`${index}-main`}
                        name="main"
                        onChange={(file) => updateImage(index, 0, file)}
                        defaultPreview={variantPayload?.images[0] as string}
                    />
                    {errors.images?.main && (
                        <p className="text-red-500 text-sm mt-1">{errors.images.main}</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {(['sub1', 'sub2', 'sub3'] as const).map((subId, idx) => (
                        <div key={subId}>
                            <InputImage
                                type="sub"
                                id={`${index}-${subId}`}
                                name={subId}
                                onChange={(file) => updateImage(index, idx + 1, file)}
                                defaultPreview={variantPayload?.images[idx + 1] as string}
                            />
                            {errors.images?.[subId] && (
                                <p className="text-red-500 text-xs mt-1">{errors.images[subId]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function InputImage({ type, id, name, defaultPreview, onChange }: {
    type: string;
    id: string;
    name: string;
    defaultPreview?: string;
    onChange?: (file: File | null) => void;
}) {
    const iconSize = type === "main" ? 48 : 24;
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const noti = useNotificateArea().setNotification;
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file && file.size > 5 * 1024 * 1024) {
            e.target.value = "";
            noti("Kích thước hình ảnh không được vượt quá 5MB!");
            return null;
        }
        if (file != undefined) setPreviewImageHelper(file, setPreviewImage);
        if (onChange) onChange(file || null);
    }

    useEffect(() => {
        if (defaultPreview) {
            setPreviewImage(defaultPreview);
        }
    }, [defaultPreview]);

    return (
        <label htmlFor={`productImage-${id}`} className="cursor-pointer">
            <div className="preview relative overflow-hidden w-full aspect-[16/9] flex flex-col gap-1 items-center justify-center rounded-md border-2 border-gray-200 bg-stone-50 hover:bg-stone-100">
                {previewImage ? (
                    <Image src={previewImage} fill alt="preview" className="hover:opacity-80 object-cover" />
                ) : (
                    <>
                        <Image src="/icon/camera-up.svg" width={iconSize} height={iconSize} alt="preview" />
                        {type === "main" ? (
                            <p className="fontA5">Hình ảnh chính</p>
                        ) : (
                            <p className="fontA6">Hình ảnh phụ</p>
                        )}
                    </>
                )}
            </div>
            <input
                type="file"
                id={`productImage-${id}`}
                name={`productImage-${name}`}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
            />
        </label>
    );
}

function AddVariantButton() {
    const { addVariant } = useAdminUpdateProductContext();

    return (
        <button
            type="button"
            onClick={addVariant}
            className={`${sectionCSS} py-6! flex gap-3 hover:bg-gray-100 hover:cursor-pointer`}
        >
            <Image src={'/icon/plus.svg'} alt="add variant" width={24} height={24} />
            <p>Thêm chủng loại mới</p>
        </button>
    );
}