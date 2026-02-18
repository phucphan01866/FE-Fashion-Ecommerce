'use client'
import Image from "next/image";
import { useProductPage } from "@/context/ProductContext";
import { ReviewFromListForProduct } from "@/service/review.service";

import { useState } from "react";
import { PopupImage } from "../general/PopupImage/PopupImage";
// function Divider() {
//     return (
//         <div className="w-0 h-[24px] bg-gray-100 border-1 border-gray-100"></div>
//     );
// }

export default function CommentSection() {

    const { reviews } = useProductPage();
    return (
        <div className="w-full px-8 py-8 bg-stone-50 rounded-xl flex flex-col gap-8">
            <div><p className="fontA2">Khu vực đánh giá</p></div>
            <div className="flex flex-col gap-8">
                {reviews && reviews.length === 0 ? (
                    <p>Hiện chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                    reviews.map((review, index) => (
                        <Comments review={review} key={index} />
                    ))
                )}
            </div>
        </div>
    );
}

function Comments({ review }: { review: ReviewFromListForProduct }) {
    const date = new Date(review.created_at);
    const processed = date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false, // dùng 24h
    }).replace(',', '');
    return (
        <div className="p-4 rounded-md bg-white outline-1 outline-orange-200">
            <div className="grid grid-cols-[auto_1fr] gap-4">
                <div className="flex gap-4">
                    <UserName name={"Nguyễn Văn A"} />
                    <div className="flex gap-4 items-center relative">
                        <Rating rating={review.rating} />
                    </div>
                </div>
                <CommentText text={review.comment || ""} />
                <GalleryImage imgSrc={review.images[0]}></GalleryImage>
                <TimeStamp time_created={processed}></TimeStamp>
            </div>
        </div>
    );
}


function FullStar() {
    const iconSize = "16";
    return (
        <div className="relative flex">
            <Image src="/icon/star_orange.svg" alt="star icon" width={iconSize} height={iconSize} className={`inline-block`} ></Image>
        </div>
    );
}

function FullStarFilled() {
    const iconSize = "16";
    return (
        <div className="relative flex">
            <Image src="/icon/star_orange_filled.svg" alt="star icon" width={iconSize} height={iconSize} className={`inline-block`} ></Image>
        </div>
    );
}

function UserName({ name }: { name: string }) {
    return (
        <p className="font-semibold">{name}</p>
    );
}

function Rating({ rating }: { rating: number }) {

    return (
        <div className="flex gap-3 mr-2">
            {
                Array.from({ length: rating }, (_, index) => (
                    <FullStarFilled key={index} />
                ))
            }
            {
                Array.from({ length: 5 - rating }, (_, index) => (
                    <FullStar key={index} />
                ))
            }
        </div>
    );
}

function CommentText({ text }: { text: string }) {
    return (
        <p className="col-span-2">
            {text}
        </p>
    )
}

function GalleryImage({ imgSrc, altText = "review image" }: { imgSrc: string, altText?: string }) {
    const imageSize = 72;
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

    return (
        <>
            <button type="button"
                className="cursor-pointer"
                style={{ width: imageSize + "px", height: imageSize + "px" }}
                onClick={() => { setIsPopupOpen(!isPopupOpen) }}
            >
                <Image src={`${imgSrc}`} alt="product image" width={imageSize} height={imageSize}
                    className=" object-cover w-full h-full rounded-md border-2 border-white outline-2 outline-gray-100 hover:outline-gray-400" />

            </button>
            <PopupImage imageUrl={imgSrc} isOpen={isPopupOpen} open={() => { setIsPopupOpen(true) }} close={() => { setIsPopupOpen(false) }} />

        </>
    );
}

function TimeStamp({ time_created }: { time_created: string }) {
    return (
        <span className="text-sm text-gray-500 col-span-2">
            Đánh giá lúc {time_created}
        </span>
    );
}



