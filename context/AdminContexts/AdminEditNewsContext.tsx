'use client'

import { useContext, createContext, useState, ReactNode, useEffect } from "react";
import { useNotificateArea } from "../NotificateAreaContext";
import { TextBlock, ImageBlock, newsService, NewsResponse, UpdateNewsRequest } from "@/service/news.service";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import { useParams, useRouter } from "next/navigation";

export type FileImageBlock = {
    type: 'image';
    files: Array<File>;
};
export type NewsBlock = TextBlock | ImageBlock | FileImageBlock;

interface NewsContextType {
    blocks: NewsBlock[];
    addBlock: (type: 'text' | 'image') => void;
    removeBlock: (index: number) => void;
    updateBlock: (index: number, updatedBlock: NewsBlock) => void;
    setBlocks: (blocks: NewsBlock[]) => void; //dùng khi load từ server hoặc reset
    submitNews: () => Promise<void>;
    title?: string;
    thumbnail?: File;
    setTitle?: (title: string) => void;
    setThumbnail?: (file: File | undefined) => void;
    errors?: NewsErrrors;
    isSubmitting?: boolean;


    oldNewsData?: NewsResponse;
    isLoadingOldData?: boolean;
    oldPreviewThumbnailUrl?: string;
}

interface NewsErrrors {
    title?: string;
    thumbnail?: string;
    blocks?: string;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsEditProvider({ children }: { children: ReactNode }) {
    const { setNotification } = useNotificateArea();
    const [oldNewsData, setOldNewsData] = useState<NewsResponse>(); // Dữ liệu news cũ từ server
    const [isLoadingOldData, setIsLoadingOldData] = useState<boolean>(true);
    const params = useParams();
    const router = useRouter();

    const EmptyTextBlock: TextBlock = { type: 'text', text: '' };
    const EmptyImageBlock: ImageBlock = { type: 'image', urls: [] };
    const EmptyFileImageBlock: FileImageBlock = { type: 'image', files: [] };
    const [blocks, setBlocks] = useState<NewsBlock[]>([EmptyTextBlock, EmptyFileImageBlock, EmptyTextBlock, EmptyFileImageBlock, EmptyTextBlock]);
    const [title, setTitle] = useState<string>('');
    const [thumbnail, setThumbnail] = useState<File>();
    const [oldPreviewThumbnailUrl, setOldPreviewThumbnailUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


    useEffect(() => {
        async function fetchOldNews() {
            const id = Array.isArray(params) ? params[0] : params.id;
            try {
                const data = await newsService.admin.getNews(id);
                // console.log('Dữ liệu news lấy về:', data);
                setOldNewsData(data);
                setBlocks(data.content_blocks || []);
                setTitle(data.title || '');
                setIsLoadingOldData(false);
                setOldPreviewThumbnailUrl(data.image || '');
            } catch (error) {
                setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi tải dữ liệu tin tức.');
            }
        }
        fetchOldNews();
    }, [params]);

    // Thêm block mới (text hoặc image)
    const addBlock = (type: 'text' | 'image') => {
        if (type === 'text') {
            setBlocks(prev => [...prev, EmptyTextBlock]);
        } else if (type === 'image') {
            setBlocks(prev => [...prev, EmptyFileImageBlock]);
        }
    };

    // Xóa block tại index
    const removeBlock = (index: number) => {
        if (index < 0 || index >= blocks.length) {
            setNotification("Không thể xóa block: vị trí không hợp lệ");
            return;
        }
        setBlocks(prev => prev.filter((_, i) => i !== index));
    };

    // Cập nhật block tại vị trí index
    const updateBlock = (index: number, updatedBlock: NewsBlock) => {
        if (index < 0 || index >= blocks.length) {
            setNotification("Không thể cập nhật block: vị trí không hợp lệ");
            return;
        }
        setBlocks(prev =>
            prev.map((block, i) => (i === index ? updatedBlock : block))
        );
    };

    const [errors, setErrors] = useState<NewsErrrors>({});

    function validateNews() {
        const newErrors: NewsErrrors = {};
        if (!title || title.trim() === '') {
            newErrors.title = 'Tiêu đề không được để trống';
        }
        if (!thumbnail && !oldPreviewThumbnailUrl) {
            newErrors.thumbnail = 'Ảnh đại diện không được để trống';
        }
        if (blocks.length === 0) {
            newErrors.blocks = 'Phải có ít nhất một block nội dung';
        } else if (blocks.length % 2 === 0) {
            newErrors.blocks = 'Số block nội dung phải là số lẻ';
        } else {
            const hasEmptyBlock = blocks.some((block) => {
                if (block.type === 'text') {
                    const tb = block as TextBlock;
                    return !tb.text || tb.text.trim().length === 0;
                }
                if ('files' in block) {
                    const fb = block as FileImageBlock;
                    return !fb.files || fb.files.length === 0;
                }
                if ('urls' in block) {
                    const ib = block as ImageBlock;
                    return !ib.urls || ib.urls.length === 0;
                }
                return false;
            });
            if (hasEmptyBlock) {
                newErrors.blocks = 'Có ít nhất 1 block chưa điền nội dung';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }


    const submitNews = async () => {
        setIsSubmitting(true);
        setErrors({});

        if (validateNews() !== true) {
            setNotification("Có lỗi trong dữ liệu tin tức. Vui lòng kiểm tra lại.");
            return;
        }

        try {
            // setIsSubmitting(true);
            setNotification("Đang tải ảnh lên...");

            // 1. Upload ảnh bìa (thumbnail)
            let previewImageUrl: string | null = null;
            if (thumbnail instanceof File) {
                const thumbnailFolder = `news/${title}}/thumbnail`;
                previewImageUrl = thumbnail
                    ? (await uploadToCloudinary(thumbnail, thumbnailFolder)).imageUrl
                    : null;
            } else {
                previewImageUrl = oldPreviewThumbnailUrl;
            }


            // 2. Upload tất cả ảnh trong content_blocks (song song, nhanh)
            const blocksFolder = `news/${title}}/images`;
            const uploadPromises = blocks.map(async (block): Promise<TextBlock | ImageBlock> => {
                if (block.type === 'text') {
                    return block as TextBlock;
                }
                if (block.type === 'image' && 'urls' in block) {
                    return block as ImageBlock;
                }
                if (block.type === 'image' && 'files' in block && block.files?.[0]) {
                    const { imageUrl } = await uploadToCloudinary(block.files[0], blocksFolder);
                    return {
                        type: 'image',
                        urls: [{ url: imageUrl }],
                    } as ImageBlock;
                }

                throw new Error("Block ảnh không có file đính kèm");
            });

            const content_blocks = await Promise.all(uploadPromises);

            // 3. Gửi dữ liệu lên server
            setNotification("Đang cập nhật tin tức...");

            const payload: UpdateNewsRequest = {
                title: title!.trim(),
                image: previewImageUrl,
                content_blocks,
            };

            await newsService.admin.updateNews(payload, oldNewsData!.id);


            setNotification("Cập nhật tin tức thành công!");

            // Reset form hoặc redirect
            router.push('/admin/news');

        } catch (error: any) {
            console.error("Lỗi khi cập nhật tin tức:", error);
            setNotification(error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const value: NewsContextType = {
        blocks,
        addBlock,
        removeBlock,
        updateBlock,
        setBlocks,
        submitNews,
        title,
        thumbnail,
        setTitle,
        setThumbnail,
        errors,
        oldNewsData,
        isLoadingOldData,
        oldPreviewThumbnailUrl,
        isSubmitting,
    };

    return (
        <NewsContext.Provider value={value}>
            {children}
        </NewsContext.Provider>
    );
}

export const useEditNews = (): NewsContextType => {
    const context = useContext(NewsContext);
    if (!context) {
        throw new Error('useNews must be used within a NewsProvider');
    }
    return context;
};