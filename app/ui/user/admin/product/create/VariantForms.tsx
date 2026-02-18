'use client'
import { Divider } from "@/app/ui/cart/General";
import { sectionCSS } from "../../../general/general";
import { InputField, baseInputBlockCSS } from "@/app/ui/general/Input/Input";
import Image from "next/image";
import { internationalSizes } from "@/app/demo";
import { useAdminCreateProductContext } from "@/context/AdminContexts/AdminCreateProductContext";
import { useRef, useState } from "react";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { VariantFormErrors } from "./Forms";
import { useNotificateArea } from "@/context/NotificateAreaContext";


export default function VariantForms({ formRefs, errors }: { formRefs: React.RefObject<HTMLFormElement[]>, errors?: VariantFormErrors[] }) {
    const { variantsIndex, removeVariantsIndex, addVariantsIndex } = useAdminCreateProductContext();
    return (
        <div className="flex flex-col gap-3">
            {variantsIndex.map((index) => (
                <form
                    key={index}
                    ref={(el) => { if (el) formRefs.current[index] = el }}
                    className="flex flex-col gap-3">
                    <VariantForm index={index} errors={errors ? errors.find(err => err.id === index) : undefined} removeVariant={removeVariantsIndex} />
                    {index === variantsIndex[variantsIndex.length - 1] ? (<AddVariantArea addVariant={addVariantsIndex} />) : null}
                </form>
            ))}
        </div>
    );
}

function VariantForm({ index, errors }: { index: number, removeVariant: (index: number) => void, errors?: VariantFormErrors }) {
    return (
        <div className={`grid grid-cols-[100%] gap-3 rounded-xl bg-white border-2 border-gray-200`}>
            <div className="grid grid-cols-[60%_1fr] gap-3">
                <LeftForm index={index} errors={errors} />
                <RightForm index={index} errors={errors} />
            </div>
            <input name="index" type="hidden" readOnly value={index} />
        </div>
    );
}

function LeftForm({ index, errors }: { index: number, errors?: VariantFormErrors }) {
    const { removeVariantsIndex } = useAdminCreateProductContext();
    function preRemoveVariant(index: number) {
        removeVariantsIndex(index);
    }
    return (
        <div className={`${sectionCSS} flex flex-col gap-4 border-none`}>
            <h3 className="fontA3">Phân loại sản phẩm #{index}</h3>
            <Divider />
            <div className="flex gap-2">
                <div className="flex-1">
                    <SizeSelectionArea index={index} />
                    {errors?.sizes && (
                        <p className="text-red-500 text-sm mt-1">{errors.sizes}</p>
                    )}
                </div>

                <div className="flex-1">
                    <StockInputArea index={index} />
                    {errors?.stock && (
                        <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                    )}
                </div>
            </div>

            <div>
                <ColorSelectionArea index={index} />
                {errors?.colorName && (
                    <p className="text-red-500 text-sm mt-1">{errors.colorName}</p>
                )}
                {errors?.colorCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.colorCode}</p>
                )}
            </div>

            <div className="flex flex-1 flex-col justify-end">
                <button type="button" onClick={() => preRemoveVariant(index)} className="w-fit p-1.5 rounded-lg bg-gray-200 hover:bg-gray-100" >
                    <Image src="/icon/trash-x-filled.svg" alt="delete variant" width={24} height={24} />
                </button>
            </div>
        </div>
    )
}

function SizeSelectionArea({ index }: { index: number }) {
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    function toggleSelectedSizes(inputSize: string) {
        if (selectedSizes.some(arraySize => arraySize === inputSize)) {
            setSelectedSizes(selectedSizes.filter((arraySize) => arraySize !== inputSize));
        } else {
            setSelectedSizes([...selectedSizes, inputSize]);
        }
    }
    return (
        <div className={`grid gap-2 ${baseInputBlockCSS}`}>
            <label className="fontA5" htmlFor={`size-${index}`}>Kích thước <span className="text-red-500">*</span></label>
            <input id={`size-${index}`} name={`size`} className="hidden" type="string" required />
            <div className="flex gap-2">
                {internationalSizes.map((size, idx) => {
                    return (
                        <SizeButton key={idx} size={size} selected={selectedSizes.some(arraySize => arraySize === size)} toggleSelectedSizes={toggleSelectedSizes} />
                    )
                })}
            </div>
            <select id={`size-${index}`} name={`size`} className="hidden" value={selectedSizes} onChange={() => null} required multiple>
                {internationalSizes.map((size, idx) => {
                    return (
                        <option key={idx} value={size}>{size}</option>
                    )
                })}
            </select>
        </div>
    )
}

function StockInputArea({ index }: { index: number }) {
    return (
        <InputField
            bonusCSS="h-full"
            required={true}
            label="Tồn kho"
            type="number"
            defaultValue={100}
            id={`stock-${index}`}
            name="stock"
            placeholder="Nhập số lượng tồn kho"
        />
    )
}

function SizeButton({ size, selected = false, toggleSelectedSizes }: { size: string, selected?: boolean, toggleSelectedSizes: (input: string) => void }) {
    return (
        <button type="button" onClick={() => toggleSelectedSizes(size)} className={
            `px-3 py-2 bg-gray-50 border-1 border-gray-200 hover:bg-gray-200 rounded-md fontA5
            ${selected && 'bg-orange-500 border-orange-200 hover:bg-orange-400 text-white'}`
        }>{size}</button>
    );
}

function ColorSelectionArea({ index }: { index: number }) {
    const [color, setColor] = useState<string>("");
    function onInputColor(e: React.ChangeEvent<HTMLInputElement>) {
        // if (e.target.value.charAt(0) !== "#") e.target.value = "#";
        setColor(e.target.value);
    }
    return (
        <div className="grid gap-2">
            <div className="flex gap-2">
                <InputField
                    required={true}
                    label="Màu sắc"
                    type="text"
                    id={`colorName-${index}`}
                    name="colorName"
                    placeholder="Tên màu sắc"
                />
                <InputField
                    required={true}
                    onChange={onInputColor}
                    label="Mã màu (Hex)"
                    defaultValue={"#"}
                    minLength={1}
                    maxLength={7}
                    id={`colorCode-${index}`}
                    name="colorCode"
                    placeholder="VD: #101010"
                />
                <ColorBlock colorCode={color} />
            </div>
        </div>
    )
}

function ColorBlock({ colorCode }: { colorCode: string }) {
    return (
        <div
            style={{ backgroundColor: colorCode }}
            className={`relative h-full aspect-1/1 border-2 border-gray-200 rounded-md `}>
        </div>
    )
}

function RightForm({ index, errors }: { index: number, errors?: VariantFormErrors }) {
    return (
        <div className={`${sectionCSS} border-none`}>
            <p>Ảnh sản phẩm</p>
            <div className="grid gap-2">
                <div>
                    <InputImage type="main" id={`${index}-main`} name="main" />
                    {errors?.images?.main && (
                        <p className="text-red-500 text-sm mt-1">{errors.images.main}</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <InputImage type="sub" id={`${index}-sub1`} name="sub1" />
                        {errors?.images?.sub1 && (
                            <p className="text-red-500 text-xs mt-1">{errors.images.sub1}</p>
                        )}
                    </div>

                    <div>
                        <InputImage type="sub" id={`${index}-sub2`} name="sub2" />
                        {errors?.images?.sub2 && (
                            <p className="text-red-500 text-xs mt-1">{errors.images.sub2}</p>
                        )}
                    </div>

                    <div>
                        <InputImage type="sub" id={`${index}-sub3`} name="sub3" />
                        {errors?.images?.sub3 && (
                            <p className="text-red-500 text-xs mt-1">{errors.images.sub3}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function InputImage({ type, id, name }: { type: string, id: string, name: string }) {
    const iconSize = type === "main" ? 48 : 24;
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [validatedImage, setValidatedImage] = useState<File | null>(null);
    const { setNotification } = useNotificateArea();
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSize) {
            setNotification('Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn!');
            e.target.value = "";
            setPreviewImage(null);
            return;
        }
        setPreviewImageHelper(file, setPreviewImage); // Cập nhật preview
    }
    const inputRef = useRef<HTMLInputElement>(null);
    function removeImage(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.stopPropagation();
        e.preventDefault();
        setPreviewImage(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setNotification("Đã xóa ảnh Variant")
    }
    return (
        <label htmlFor={`productImage-${id}`} className="cursor-pointer">
            <div className="preview relative overflow-hidden w-full aspect-[16/9] flex flex-col gap-1 items-center justify-center rounded-md border-2 border-gray-200 bg-stone-50 hover:bg-stone-100">
                {previewImage ? (
                    <>
                        <Image src={previewImage} fill alt="preview" className="hover:opacity-80 object-cover" />
                        <button onClick={removeImage} type="button"
                            className={`absolute ${type === 'main' ? " top-3 right-5" : 'top-1 right-2'} p-1 rounded-xl bg-gray-900 bg-opacity-50 hover:shadow-white hover:shadow-2xl opacity-75 hover:opacity-90`}>
                            <Image className="" src="/icon/trash-x-filled-white.svg" width={iconSize / 1.5} height={iconSize / 1.5} alt="change" />
                        </button>
                    </>
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
                className="hidden" />

        </label>
    );
}

function AddVariantArea({ addVariant }: { addVariant: () => void }) {
    return (
        <button
            type="button"
            onClick={addVariant}
            className={`${sectionCSS} py-6! flex gap-3 hover:bg-gray-100 hover:cursor-pointer`}>
            <Image src={'/icon/plus.svg'} alt="add variant" width={24} height={24} />
            <p>Thêm chủng loại mới</p>
        </button>
    );
}