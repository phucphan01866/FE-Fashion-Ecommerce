'use client'

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { sectionCSS } from "@/app/ui/user/general/general";
import { Divider } from "@/app/ui/user/general/general";
import OrderService from "@/service/order.service";
import { useSearchParams } from "next/navigation";
import { TextArea } from "@/app/ui/general/Input/Input";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import uploadToCloudinary from "@/helper/uploadToCloudinaryHelper";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { TypeProduct, productService } from "@/service/product.service";
import BasicLoadingSkeleton from "@/app/ui/general/skeletons/LoadingSkeleton";
import ReviewService, { ReviewUpdateInput } from "@/service/review.service";
import { useRouter } from "next/navigation";


export default function Page() {
    return (
        <Suspense fallback={<div className="font-a5 italic text-center mt-4">Đang tải thông tin đánh giá...</div>}>
            <SuspenseWrapper />
        </Suspense>
    );
}

function SuspenseWrapper() {
    const { setNotification } = useNotificateArea();
    const [product, setProduct] = useState<TypeProduct | null>(null);
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const variantId = searchParams.get("variantId");
    const reviewID = searchParams.get("reviewID");

    const [oldReview, setOldReview] = useState<any>(null);

    async function fetchOrder() {
        const data = ReviewService.getReviewById(reviewID || "");
        setOldReview(await data);
    }

    useEffect(() => {
        fetchOrder();
    }, []);


    async function fetchProduct(variantId: string) {
        try {
            const data = await productService.user.getProductFromVariant(variantId);
            setProduct(data);
        } catch (error) {
            setNotification(error instanceof Error ? error.message : "Lỗi khi lấy thông tin sản phẩm để đánh giá");
        }
    }
    useEffect(() => {
        if (orderId && variantId) {
            fetchProduct(variantId);
        }
    }, [orderId, variantId]);
    return (
        product ? (
            <PageContent product={product} variantId={variantId || ""} orderId={orderId || ""} oldReview={oldReview} />
        ) : (
            <BasicLoadingSkeleton />
        )
    );
}

interface PreviewProductProps {
    product: TypeProduct | null;
    variantId?: string;
}

function PreviewProduct({ product, variantId }: PreviewProductProps) {
    if (!product) {
        return (
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
                <div className="w-24 h-24 bg-gray-200 border-2 border-dashed rounded-lg" />
                <div>
                    <p className="text-gray-500">Đang tải thông tin sản phẩm...</p>
                </div>
            </div>
        );
    }

    const prod: any = product;
    const mainImage = prod.product_images && prod.product_images[0].url || "/placeholder.jpg";

    return (
        <div className="flex items-center gap-6 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl">
            {/* Ảnh sản phẩm */}
            <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-lg border">
                <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>

            {/* Thông tin cơ bản */}
            <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {product.name}
                </h3>
                {variantId && (
                    <p className="text-sm text-gray-500 mt-1">
                        Phân loại: {product.variants.find(v => v.id === variantId)?.sku || "Đang chọn"}
                    </p>
                )}
            </div>
        </div>
    );
}

function PageContent({ product, variantId, orderId, oldReview }: { product: TypeProduct, variantId: string, orderId: string, oldReview: any }) {
    return (
        <div className="container px-4 py-8 flex flex-col gap-6 mx-auto">
            <div className={`addressInfoSection ${sectionCSS} flex flex-col gap-6`}>
                <div className="flex justify-between items-center">
                    <Title>Chỉnh sửa đánh giá</Title>
                </div>
                <Divider />
                <PreviewProduct product={product} variantId={variantId} />
                <Divider />
                <UserInputReview product={product} variantId={variantId} orderId={orderId} oldReview={oldReview} />
            </div>
        </div>
    );
}

function UserInputReview({ product, variantId, orderId, oldReview }: { product: TypeProduct, variantId: string, orderId: string, oldReview: any }) {
    const { user } = useAuth();
    const router = useRouter();
    const { userProfile } = useProfile();
    const { setNotification } = useNotificateArea();

    const [reviewText, setReviewText] = useState(oldReview?.comment || "");
    const [imageFile, setImageFile] = useState<File | null>(null);        // ← File thật
    const [previewUrl, setPreviewUrl] = useState<string | null>(oldReview?.images[0] || null);    // ← Chỉ để preview
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating, setRating] = useState<number>(oldReview?.rating || 5);

    // Xử lý khi người dùng chọn ảnh
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        if (file.size > 5 * 1024 * 1024) {
            setNotification("Ảnh không được lớn hơn 5MB");
            return;
        }
        if (!file.type.startsWith("image/")) {
            setNotification("Chỉ chấp nhận file ảnh");
            return;
        }

        // Lưu File thật + tạo preview URL
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // Xóa ảnh
    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setImageFile(null);
        setPreviewUrl(null);

        // Reset input file
        const input = document.getElementById("reviewImage") as HTMLInputElement;
        if (input) input.value = "";
    };


    // Gửi đánh giá
    async function handleSubmit() {
        if (!user) {
            setNotification("Vui lòng đăng nhập để đánh giá");
            return;
        }
        if (!product?.id) {
            setNotification("Không xác định được sản phẩm");
            return;
        }
        if (!reviewText.trim()) {
            setNotification("Vui lòng nhập nội dung đánh giá");
            return;
        }
        if (!imageFile && !previewUrl) {
            setNotification("Vui lòng tải lên ít nhất 1 ảnh minh họa");
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // 1. Upload ảnh lên Cloudinary (dùng chính File)
            let imageUrl = "";
            if (previewUrl && imageFile) {
                const folder = `product/${product.name}/reviews/${user.id}`;
                const uploadResult = await uploadToCloudinary(imageFile, folder);
                imageUrl = uploadResult.imageUrl;
            } else if (previewUrl && !imageFile) {
                imageUrl = previewUrl || "";
            }
            // export interface ReviewCreateInput {
            //     variant_id: string;
            //     rating: 1 | 2 | 3 | 4 | 5;
            //     comment?: string;
            //     images?: string[];
            // }
            const reviewPayload: ReviewUpdateInput = {
                comment: reviewText.trim().length > 0 ? reviewText.trim() : oldReview.comment || "",
                images: [imageUrl],
                rating: rating || oldReview.rating || 5, // Giả sử đánh giá 5 sao, có thể thêm UI chọn sao nếu cần
            };
            await ReviewService.updateReview(oldReview.id, reviewPayload);

            console.log("Cập nhật đánh giá thành công:", {
                productId: product.id,
                comment: reviewText.trim(),
                imageUrl,
            });

            setNotification("Cập nhật đánh giá thành công! Cảm ơn bạn");
            router.push(`/customer/order/${orderId}`)

            // Reset form
            setReviewText("");
            setImageFile(null);
            setPreviewUrl(null);
            const input = document.getElementById("reviewImage") as HTMLInputElement;
            if (input) input.value = "";

        } catch (error: any) {
            console.error("Lỗi gửi đánh giá:", error);
            setNotification(error.message || "Gửi đánh giá thất bại, vui lòng thử lại");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            {/* Header */}
            <div className="flex justify-start items-center gap-12 mb-4">
                <div>
                    <p className="font-semibold">Người viết: {userProfile?.full_name || userProfile?.name || user?.email || "Khách hàng"}</p>
                    <p className="text-sm text-gray-500">Đánh giá sản phẩm</p>
                </div>
                <div>

                </div>
            </div>
            <RatingArea
                rating={rating}
                setRating={(val) => setRating(val)} />
            {/* TextArea */}
            <TextArea
                id="currentUserReview"
                label="Đánh giá của bạn"
                placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này... (tối thiểu 10 ký tự)"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                maxLength={1000}
            />

            {/* Upload ảnh (dùng File) */}
            <div>
                <label htmlFor="reviewImage" className="block fontA5 mb-2">
                    Hình ảnh thực tế
                </label>

                <input
                    type="file"
                    id="reviewImage"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isSubmitting}
                />

                <label
                    htmlFor="reviewImage"
                    className={`block cursor-pointer rounded-lg overflow-hidden border-2 border-dashed transition-all
            ${isSubmitting ? "pointer-events-none opacity-60" : "hover:border-primary"}
            ${previewUrl ? "border-primary" : "border-gray-300"}
          `}
                >
                    {previewUrl ? (
                        <div className="relative group">
                            <Image
                                src={previewUrl}
                                alt="Ảnh đánh giá"
                                width={800}
                                height={600}
                                className="w-full h-auto max-h-96 object-contain bg-gray-50"
                            />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-3 right-3 bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 shadow-lg"
                                title="Xóa ảnh"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <div className="py-16 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                            <Image src="/icon/camera-up.svg" alt="Upload" width={64} height={64} className="mb-3" />
                            <p className="fontA4">Nhấn để tải ảnh lên</p>
                            <p className="text-xs mt-1">JPG, PNG, WEBP • Tối đa 5MB</p>
                        </div>
                    )}
                </label>
            </div>

            {/* Nút gửi */}
            <div className="flex justify-end-safe pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!reviewText.trim() || (!imageFile && !previewUrl) || isSubmitting}
                    className={`
            px-10 py-3 rounded-lg font-medium transition-all shadow-md flex items-center gap-2
            ${reviewText.trim() || (imageFile) && !isSubmitting
                            ? "bg-orange-500 text-white "
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }
          `}
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Đang gửi...
                        </>
                    ) : (
                        "Gửi đánh giá"
                    )}
                </button>
            </div>
        </div>
    );
}

function RatingArea({ rating, setRating }: { rating: number, setRating: (rating: number) => void }) {
    const [tempRating, setTempRating] = useState<number>(rating);
    return (
        <div className="flex items-center">
            {Array.from({ length: 5 }, (_, index) => (
                <FullStar key={index} index={index} tempRating={tempRating} handleMouseIn={() => setTempRating(index)} handleMouseOver={() => setTempRating(rating)} onClick={() => setRating(index)} />
            ))}
        </div>
    );
}

function FullStar(
    { index, tempRating, handleMouseIn, handleMouseOver, onClick }: { index: number, tempRating: number, handleMouseIn: () => void, handleMouseOver: () => void, onClick: () => void }
) {
    const iconSize = "24";
    return (
        <div
            onMouseEnter={handleMouseIn}
            onMouseLeave={handleMouseOver}
            onClick={onClick}
            className="relative flex mx-1.5 hover:scale-125 transition-transform ease-in-out cursor-pointer">
            {tempRating >= index ? (
                <Image src="/icon/star_orange_filled.svg" alt="star icon" width={iconSize} height={iconSize} className={`inline-block`} ></Image>
            ) : (
                <Image src="/icon/star_orange.svg" alt="star icon" width={iconSize} height={iconSize} className={`inline-block`} ></Image>
            )}

        </div>
    );
}

function Title({ children }: { children: string }) {
    return <h2 className="text-2xl font-bold text-orange-600">{children}</h2>;
}