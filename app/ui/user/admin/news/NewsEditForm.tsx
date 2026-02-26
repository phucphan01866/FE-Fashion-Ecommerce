'use client';

import { InputField, TextArea } from "@/app/ui/general/Input/Input";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useState } from "react";
import Image from "next/image";
import { useEditNews } from "@/context/AdminContexts/AdminEditNewsContext";
import { TextBlock, ImageBlock } from "@/service/news.service";
import { NewsBlock, FileImageBlock } from "@/context/AdminContexts/AdminCreateNewsContext";
import BasicLoadingSkeleton from "@/app/ui/general/skeletons/LoadingSkeleton";

export default function NewsEditForm() {
    const { setNotification } = useNotificateArea();
    const { submitNews, errors, oldNewsData, oldPreviewThumbnailUrl, isSubmitting } = useEditNews();
    if (!oldNewsData) {
        return <BasicLoadingSkeleton />;
    } else
        return (
            <div className="flex flex-col gap-6">
                <Title error={errors?.title} />
                <div className="grid grid-cols-[75%_1fr] gap-6">
                    <Body setNotification={setNotification} error={errors?.blocks} />
                    <div className="flex flex-col justify-between">
                        <PreviewImage setNotification={setNotification} error={errors?.thumbnail} oldPreviewThumbnailUrl={oldPreviewThumbnailUrl} />
                        <button disabled={isSubmitting}
                            onClick={submitNews}
                            className={`sticky px-4 py-3 bottom-24 right-6 w-fit ml-auto 
                                bg-orange-400 hover:bg-orange-500 transition-all duration-100 ease-in-out cursor-pointer
                                 rounded-xl fontA3 text-white ${isSubmitting && "opacity-75 bg-gray-300"}`}
                            type="button">Lưu tin tức</button>
                    </div>
                </div>
            </div>
        )
}

function Title({ error }: { error?: string }) {
    const { title, setTitle } = useEditNews();
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (setTitle) setTitle(e.target.value);
    }
    return (
        <div className="flex flex-col">
            <InputField id="title" label="Tiêu đề tin tức" placeholder="Nhập tiêu đề tin tức" value={title} onChange={onChange} required={true} error={error} />
        </div>
    )
}

function Body({ setNotification, error }: { setNotification: (msg: string) => void, error?: string }) {
    const { addBlock, removeBlock, updateBlock } = useEditNews();
    const { blocks } = useEditNews();
    const iconSize = 24;
    const btnCSS = `p-0.5 hover:bg-gray-100 rounded-md border-2 border-gray-200 hover:border-primary`;
    return (
        <div className="flex flex-col gap-4">
            {blocks.map((block, index) => {
                if (block.type === 'text') {
                    return <BlockText key={index} index={index} setNotification={setNotification} block={block} onRemove={() => removeBlock(index)} updateBlock={updateBlock} />
                } else if (block.type === 'image') {
                    return <BlockImage key={index} index={index} setNotification={setNotification} block={block} onRemove={() => removeBlock(index)} updateBlock={updateBlock} />
                }
            })}
            <div className="flex justify-between hover:bg-gray-50 px-3 py-2 rounded-md border-2 items-center border-gray-200">
                <div className="flex gap-3 items-center">
                    <p className="fontA4 text-gray-500">Chèn thêm:</p>
                    <button onClick={() => { addBlock('text') }} type="button" className={`${btnCSS}`}   >
                        <Image src="/icon/letter-case.svg" width={iconSize} height={iconSize} alt="text block" />
                    </button>
                    <button onClick={() => { addBlock('image') }} type="button" className={`${btnCSS}`}>
                        <Image src="/icon/photo.svg" width={iconSize} height={iconSize} alt="image block" />
                    </button>
                </div>
                <p className="italic fontA5 text-red-500">{error}</p>
            </div>
        </div>
    )
}

function BlockText({ index, setNotification, onRemove, updateBlock, block }:
    {
        index: number,
        setNotification: (msg: string) => void,
        onRemove: () => void,
        updateBlock: (index: number, updatedBlock: TextBlock | ImageBlock) => void,
        block: TextBlock
    }) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

        const updatedBlock: TextBlock = {
            type: 'text',
            text: e.target.value,
        };
        updateBlock(index, updatedBlock);   // Cập nhật state toàn cục ngay lập tức
    };
    return (
        <div className="relative">
            <TextArea
                value={block.text}
                onChange={handleChange}
                placeholder="Nội dung đoạn tin tức" id={"text-" + index} />
            <DeleteButton onClick={onRemove} />
        </div>
    )
}

function BlockImage({
    index,
    setNotification,
    onRemove,
    updateBlock,
    block
}: {
    index: number, setNotification: (msg: string) => void
    onRemove: () => void,
    updateBlock: (index: number, updatedBlock: NewsBlock) => void,
    block: ImageBlock | FileImageBlock
}) {
    // const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>('urls' in block && block.urls && Array.isArray(block.urls) && block.urls.length > 0 ? block.urls[0]?.url : null);
    // const [isSubmitting, setIsSubmitting] = useState(false);
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate kích thước
        if (file.size > 5 * 1024 * 1024) {
            setNotification("Ảnh không được lớn hơn 5MB");
            return;
        }

        // Validate định dạng
        if (!file.type.startsWith("image/")) {
            setNotification("Chỉ chấp nhận file ảnh");
            return;
        }

        // Lưu file và đăng preview
        // setImageFile(file);
        const previewURL = URL.createObjectURL(file);
        setPreviewUrl(previewURL);
        const updatedBlock: FileImageBlock = {
            ...block,
            files: [file],
        }
        updateBlock(index, updatedBlock);
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (previewUrl) {
            // setImageFile(null);
            setPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev); // giải phóng bộ nhớ
                return null;
            });
            const updatedBlock: FileImageBlock = {
                ...block,
                files: [],
            }
            updateBlock(index, updatedBlock);
            // Reset input file
            const input = document.getElementById('newsImage-' + index) as HTMLInputElement;
            if (input) input.value = "";
        } else {
            onRemove();
        }
    };

    return (
        <div>
            <input
                type="file"
                id={'newsImage-' + index}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
                // disabled={isSubmitting}
            />

            <label
                htmlFor={'newsImage-' + index}
                className={`block relative cursor-pointer rounded-lg overflow-hidden border-2 border-dashed transition-all
                    ${previewUrl ? "border-primary" : "border-gray-300"}
                `}
            >
                {previewUrl ? (
                    <div
                        className="relative group"
                        style={{
                            width: "full",
                            height: 400 + 'px',
                        }}
                    >
                        <Image
                            src={previewUrl}
                            alt="Ảnh đánh giá"
                            // width={800}
                            // height={600}
                            fill
                            className="w-full h-auto object-cover bg-gray-50"
                        />
                    </div>
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                        <Image
                            src="/icon/camera-up.svg"
                            alt="Upload"
                            width={64}
                            height={64}
                            className="mb-3"
                        />
                        <p className="fontA4">Nhấn để tải ảnh lên</p>
                        <p className="text-xs mt-1">JPG, PNG, WEBP • Tối đa 5MB</p>
                    </div>
                )}
                <DeleteButton onClick={handleRemoveImage} />
            </label>
        </div>
    );
}

// function PreviewImage() {
//     return (
//         <div>
//             <label className="fontA4">Ảnh bìa tin tức</label>
//             {/* Thêm chức năng upload ảnh bìa nếu cần */}
//         </div>
//     )
// }

function PreviewImage({
    setNotification,
    error,
    oldPreviewThumbnailUrl
}: {
    setNotification: (msg: string) => void,
    error?: string,
    oldPreviewThumbnailUrl?: string
}) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(oldPreviewThumbnailUrl || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { thumbnail, setThumbnail } = useEditNews();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate kích thước
        if (file.size > 5 * 1024 * 1024) {
            setNotification("Ảnh không được lớn hơn 5MB");
            return;
        }

        // Validate định dạng
        if (!file.type.startsWith("image/")) {
            setNotification("Chỉ chấp nhận file ảnh");
            return;
        }

        // Lưu file và tạo preview
        // setImageFile(file);
        setThumbnail && setThumbnail(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // setImageFile(null);
        setThumbnail && setThumbnail(undefined);
        setPreviewUrl(prev => {
            if (prev) URL.revokeObjectURL(prev); // giải phóng bộ nhớ
            return null;
        });

        // Reset input file
        const input = document.getElementById("previewImage") as HTMLInputElement;
        if (input) input.value = "";
    };

    return (
        <div className="sticky top-0">
            <input
                type="file"
                id="previewImage"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
            />
            <label
                htmlFor="previewImage"
                className={`flex flex-col items-center justify-center cursor-pointer rounded-lg overflow-hidden border-2 border-dashed 
                    transition-all bg-gray-50 aspect-3/2
                    ${isSubmitting ? "pointer-events-none opacity-60" : "hover:border-primary"}
                    ${previewUrl ? "border-primary" : "border-gray-300"}
                `}
            >
                {previewUrl ? (
                    <div className="relative group"
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Image
                            src={previewUrl}
                            alt="Ảnh đánh giá"
                            fill
                            className="w-full h-auto object-cover bg-gray-50"
                        />
                        {/* <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-3 right-3 bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 shadow-lg text-xl font-bold"
                            title="Xóa ảnh"
                        >
                            ×
                        </button> */}
                        <DeleteButton onClick={handleRemoveImage} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <Image
                            src="/icon/camera-up.svg"
                            alt="Upload"
                            width={64}
                            height={64}
                            className="mb-3"
                        />
                        <p className="fontA4">Ảnh đại diện</p>
                        <p className="text-xs mt-1">JPG, PNG, WEBP • Tối đa 5MB</p>
                    </div>
                )}
            </label>
            <p className="italic fontA5 text-red-500 mt-2">{error}</p>
        </div>
    );
}

function DeleteButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
    return (
        <button onClick={onClick} type="button" className="absolute top-2 right-3 opacity-30 hover:opacity-90 transition-all hover:bg-gray-100 rounded-full p-1">
            <Image className="" src="/icon/trash-x-filled.svg" width={24} height={24} alt="change" />
        </button>
    )
}