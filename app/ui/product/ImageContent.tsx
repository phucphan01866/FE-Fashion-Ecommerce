'use client';
import Image from "next/image";
// import { useProductPage } from "@/app/(main)/product/page";
import { useProductPage } from "@/context/ProductContext";
import { useState, useEffect } from "react";
import { PopupImage } from "../general/PopupImage/PopupImage";


// import NavBtnArea from "./NavBtnArea";

function NavButton({ direction, clickAble = true, handleClick }: { direction: "left" | "right", clickAble?: boolean, handleClick: () => void }) {
    const iconSize = 24;
    return (
        <button onClick={() => handleClick()} className={`p-2 rounded-full bg-gray-100 
            hover:bg-gray-200 hover:outline-1 hover:outline-gray-200
            disabled:bg-black disabled:outline-1 disabled:outline-black`} disabled={!clickAble}>
            <Image src={`/icon/chevron_down${!clickAble ? "_white" : ""}.svg`}
                alt="prev"
                width={iconSize}
                height={iconSize}
                className={`${direction === "left" ? 'rotate-90' : 'rotate-270'}`}></Image>
        </button>
    )
}

function NavBtnArea({ size, currentIndex, handleClick }: { size: number, currentIndex: number, handleClick: (newIndex: number) => void }) {
    const indexFromSize = size - 1;

    return (
        <div className="flex justify-end gap-2">
            <NavButton
                handleClick={() => handleClick(currentIndex - 1)}
                direction="left"
                clickAble={currentIndex > 0}
            ></NavButton>
            <NavButton
                handleClick={() => handleClick(currentIndex + 1)}
                direction="right"
                clickAble={currentIndex < indexFromSize}
            ></NavButton>
        </div>
    );
}

function ImageArea({ imgSrc, children }: { imgSrc: string, children?: React.ReactNode }) {
    const productImgWidth = 425;
    const productImgHeight = 425;
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    return (
        <div
            onClick={() => setIsPopupOpen(true)}
            style={{ width: productImgWidth, height: productImgHeight }}
            className="relative cursor-pointer overflow-hidden rounded-[24px] border-2 border-white outline-2 outline-gray-100">
            {imgSrc && <Image
                className="w-full h-full object-cover hover:scale-110 transition-all duration-200 ease-in-out"
                src={imgSrc} alt="product image" width={productImgWidth} height={productImgHeight} />}
            {children}
            <PopupImage imageUrl={imgSrc} isOpen={isPopupOpen} open={() => { setIsPopupOpen(true) }} close={() => { setIsPopupOpen(false) }} />
        </div>
    );
}

export default function ImageContent() {
    const { selectedVariant, selectedImages } = useProductPage();

    const [selectedImage, setSelectedImage] = useState<string>("");

    useEffect(() => {
        if (selectedImages.length > 0) {
            setSelectedImage(selectedImages[0]);
        }
    }, [selectedImages]);

    function handleChangeImage(newIndex: number) {
        setSelectedImage(selectedImages[newIndex]);
    }


    return (
        <div className="flex flex-col gap-2 rounded-3xl">
            <ImageArea imgSrc={selectedImage || ""} />
            <NavBtnArea
                handleClick={(newIndex) => handleChangeImage(newIndex)}
                size={selectedImages.length} currentIndex={selectedImages.findIndex((img) => img === selectedImage)} />
        </div>
    );
}