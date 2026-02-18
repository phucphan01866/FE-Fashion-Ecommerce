'use client'
import { Divider, Title } from "@/app/ui/cart/General";
import { sectionCSS } from "../../../general/general";
import Input, { TextArea } from "@/app/ui/general/Input/Input";
import Image from "next/image";
import { internationalSizes } from "@/app/demo";
import { TypeVariantPayload } from "@/service/variant.service";
import { useAdminCreateProductContext } from "@/context/AdminContexts/AdminCreateProductContext";
import { useState, useEffect } from "react";
import setPreviewImageHelper from "@/helper/setPreviewImageHelper";
import { useNotificateArea } from "@/context/NotificateAreaContext";


export default function VariantForms({ formRefs }: { formRefs: React.RefObject<HTMLFormElement[]> }) {
    const { variantsIndex, removeVariantsIndex, addVariantsIndex } = useAdminCreateProductContext();
    return (
        <div className="flex flex-col gap-3">
            {variantsIndex.map((index) => (
                <form
                    key={index}
                    ref={(el) => { if (el) formRefs.current[index] = el }}
                    className="flex flex-col gap-3">
                    <VariantForm index={index} removeVariant={removeVariantsIndex} />
                    {index === variantsIndex[variantsIndex.length - 1] ? (<AddVariantArea addVariant={addVariantsIndex} />) : null}
                </form>
            ))}
        </div>
    );
}

function VariantForm({ index }: { index: number, removeVariant: (index: number) => void }) {
    return (
        <div className={`grid grid-cols-[100%] gap-3 rounded-xl bg-white border-2 border-gray-200`}>
            <div className="grid grid-cols-[60%_1fr] gap-3">
                <LeftForm index={index} />
                <RightForm index={index} />
            </div>
        </div>
    );
}

function LeftForm({ index }: { index: number }) {
    const { removeVariantsIndex } = useAdminCreateProductContext();
    function preRemoveVariant(index: number) {
        removeVariantsIndex(index);
    }
    return (
        <div className={`${sectionCSS} flex flex-col gap-4 border-none`}>

            <h3 className="fontA3">Phân loại sản phẩm #{index}</h3>
            <Divider />
            <div className="flex gap-4">
                <SizeSelectionArea index={index} />
                <StockInputArea index={index} />
            </div>

            <ColorSelectionArea index={index} />
            <div className="flex flex-1 flex-col justify-end">
                <button onClick={() => preRemoveVariant(index)} className="w-fit p-1.5 rounded-lg bg-gray-200 hover:bg-gray-100" >
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
            // input đã tồn tại trong mảng
            setSelectedSizes(selectedSizes.filter((arraySize) => arraySize !== inputSize));
        } else {
            // input chưa tồn tại trong mảng
            setSelectedSizes([...selectedSizes, inputSize]);
        }
        // console.log(selectedSizes);
    }
    return (
        <div className="grid gap-2">
            <label htmlFor={`size-${index}`}>Kích thước</label>
            <input id={`size-${index}`} name={`size`} className="hidden" type="string" required />
            <div className="flex gap-2">
                {internationalSizes.map((size, index) => {
                    return (
                        <SizeButton key={index} size={size} selected={selectedSizes.some(arraySize => arraySize === size)} toggleSelectedSizes={toggleSelectedSizes} />
                    )
                })}
            </div>
            <select id={`size-${index}`} name={`size`} className="hidden" value={selectedSizes} onChange={() => null} required multiple>
                {internationalSizes.map((size, index) => {
                    return (
                        <option key={index} value={size}>{size}</option>
                    )
                })}
            </select>
        </div>
    )
}

function StockInputArea({ index }: { index: number }) {
    return (
        <div className="grid gap-2">
            <label htmlFor={`SKU-${index}`}>Tồn kho</label>
            <div className="flex gap-2">
                <Input type="number" defaultValue={1} id={`stock-${index}`} name={"stock"} placeholder="Nhập số lượng tồn kho" />
            </div>
        </div>
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
    const [color, setColor] = useState<string>("#4E545C");
    function onInputColor(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.value.charAt(0) !== "#") e.target.value = "#";
        setColor(e.target.value);
    }
    return (
        <div className="grid gap-2">
            <label htmlFor={`colorName-${index}`}>Màu sắc (mã màu Hex)</label>
            <div className="flex gap-2">
                <Input placeholder="Tên màu sắc" id={`colorName-${index}`} name="colorName" />
                <Input onChange={onInputColor} defaultValue={"#"} minLength={1} maxLength={7} id={`colorCode-${index}`} name="colorCode" />
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
            {/* <p className="tooltip absolute w-max -top-[2rem]"
            style={{transform: "translateX(-50%)", left: "50%"}}>Màu đen</p> */}
        </div>
    )
}

function RightForm({ index }: { index: number }) {
    return (
        <div className={`${sectionCSS} border-none`}>
            <p>Ảnh sản phẩm</p>
            <div className="grid gap-2">
                <InputImage type="main" id={`${index}-main`} name="main" />
                <div className="grid grid-cols-3 gap-2">
                    <InputImage type="sub" id={`${index}-sub1`} name="sub1" />
                    <InputImage type="sub" id={`${index}-sub2`} name="sub2" />
                    <InputImage type="sub" id={`${index}-sub3`} name="sub3" />
                </div>
            </div>
        </div>
    )
}

// function InputImage({ type }: { type: string }) {
//     const iconSize = type === "main" ? 48 : 24;
//     return (
//         <label htmlFor="productImage">
//             <div className="preview w-full aspect-[16/9] flex flex-col gap-1 items-center justify-center rounded-md border-2 border-gray-200 bg-stone-50 hover:bg-stone-100">
//                 <Image src="/icon/camera-up.svg" width={iconSize} height={iconSize} alt="preview" />

//                 {type === "main" ? (
//                     <p className="fontA5">Hình ảnh chính</p>
//                 ) : (
//                     <p className="fontA6">Hình ảnh phụ</p>
//                 )}
//             </div>
//             <input
//                 type="file"
//                 id="productImage"
//                 name="productImage"
//                 accept="image/*"
//                 // onChange={handleImageChange}
//                 className="hidden" />
//         </label>
//     );
// }

function InputImage({ type, id, name }: { type: string, id: string, name: string }) {
    const iconSize = type === "main" ? 48 : 24;
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file != undefined) setPreviewImageHelper(file, setPreviewImage);
    }
    return (
        <label htmlFor={`productImage-${id}`}>
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
                className="hidden" />
        </label>
    );
}

function AddVariantArea({ addVariant }: { addVariant: () => void }) {
    // const { variantNumber, setVariantNumber } = useAdminCreateProductContext();
    return (
        <button
            onClick={() => {
                // setVariantNumber(variantNumber + 1);
                addVariant();
            }}
            className={`${sectionCSS} py-6! flex gap-3 hover:bg-gray-100 hover:cursor-pointer`}>
            <Image src={'/icon/plus.svg'} alt="add variant" width={24} height={24} />
            <p>Thêm chủng loại mới</p>
        </button>
    );
}