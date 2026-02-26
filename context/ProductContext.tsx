'use client'
import { useState, createContext, useContext, useEffect, use } from "react";
import { ProductDetail } from "@/app/types/product";
import { internationalSizes } from "@/app/demo";
import { TypeProduct, productService, searchProducts } from "@/service/product.service";
import { TypeVariant } from "@/service/variant.service";
import { useNotificateArea } from "./NotificateAreaContext";
import ReviewService, { ReviewFromListForProduct } from "@/service/review.service";
import { favoriteService } from "@/service/favorite.service";
import track from "@/utils/track";
import HomeService from "@/service/public.service";
import { useHome } from "./HomeContext";
import { usePublic } from "./PublicContext";

interface ProductPageContextType {
    isLoading: boolean;
    product?: TypeProduct;
    setProduct: (product: TypeProduct) => void;
    variantList: TypeVariant[];
    setVariantList: (variants: TypeVariant[]) => void;
    selectedVariant?: TypeVariant;
    setSelectedVariant: (variant: TypeVariant) => void;
    sizeList: string[];
    setSizeList: React.Dispatch<React.SetStateAction<string[]>>;
    selectableSizes: string[];
    setSelectableSizes: (sizes: string[]) => void;
    selectedSize: string;
    setSelectedSize: (size: string) => void;
    fetchProduct: () => Promise<void>;
    updateSelectedColor: (newSKU: string) => void;
    selectedImages: string[];
    quantity: number | undefined;
    setQuantity: (newQuantity: number | undefined) => void;
    fetchReviews: () => Promise<void>;
    reviews: ReviewFromListForProduct[];
    relativeList: TypeProduct[];

}

const ProductPageContext = createContext<ProductPageContextType | undefined>(undefined);

export default function ProductPageProvider({ children, id }: { children: React.ReactNode, id: string }) {
    const { setNotification } = useNotificateArea();
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<TypeProduct>();
    const [variantList, setVariantList] = useState<TypeVariant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<TypeVariant>();
    const [sizeList, setSizeList] = useState<string[]>([]);
    const [selectableSizes, setSelectableSizes] = useState<string[]>([]);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [quantity, setQuantity] = useState<number | undefined>(undefined);
    const [reviews, setReviews] = useState<ReviewFromListForProduct[]>([]);
    const [relativeList, setRelativeList] = useState<TypeProduct[]>([]);

    async function fetchProduct() {
        try {
            const response = await productService.user.getProduct(id);
            setProduct(response);
            setVariantList(response.variants);
            const sizes = internationalSizes.filter(size =>
                response.variants.some((variant) => variant.sizes.some(vsize => vsize === size))
            );
            setSizeList(sizes);
            setSelectedImages(response.images || []);
            setIsLoading(false);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : "Lấy thông tin sản phẩm thất bại");
        }
    }

    async function fetchReviews() {
        try {
            const data = await ReviewService.getReviewByProdID(id);
            setReviews(data.reviews);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : "Lấy đánh giá sản phẩm thất bại");
        }
    }
    const { publicData } = usePublic();
    async function fetchRelativedProducts() {
        if (product && publicData?.categories)
            try {
                const data = await HomeService.fetchProducts({
                    filter: {
                        category_id: publicData.categories.find(cat => cat.name === product.category_name)?.id,
                    },
                    limit: 10,
                    order: 'desc',
                    sort_by: 'created_at',
                });
                // const data = await HomeService.fetchProducts()
                setRelativeList(data.items.filter(item => item.id !== product.id));
                // console.log("data ", data);
            } catch (error) {
                setNotification((error instanceof Error) ? error.message : "Lấy danh sách sản phẩm liên quan thất bại");
            }
    }

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        track('view_product_page', { productId: id });
    }, []);
    useEffect(() => {
        if (product) {
            fetchRelativedProducts();
        }
    }, [product])
    // useEffect(() => {
    //     setIsLoading(false);
    // }, [product]);

    function updateSelectedColor(newSKU: string) {
        const newSelectedVariant = variantList.find(variant => variant.sku === newSKU) || variantList[0];
        // console.log("New selected variant:", newSelectedVariant.id);
        console.log("newSelectedVariant", newSelectedVariant);
        setSelectedVariant(newSelectedVariant);
        const newSelectableSizes = newSelectedVariant ? newSelectedVariant.sizes : [];
        setSelectableSizes(newSelectableSizes);
        setSelectedSize(newSelectableSizes[0] || "");
        setSelectedImages(newSelectedVariant ? newSelectedVariant.images : product?.images || []);
    }

    return (
        <ProductPageContext.Provider value={{
            isLoading,
            product,
            setProduct,
            variantList,
            setVariantList,
            selectedVariant,
            setSelectedVariant,
            sizeList,
            setSizeList,
            selectableSizes,
            setSelectableSizes,
            selectedSize,
            setSelectedSize,
            fetchProduct,
            updateSelectedColor,
            selectedImages,
            quantity,
            setQuantity,
            fetchReviews,
            reviews,
            relativeList,
        }}>
            {children}
        </ProductPageContext.Provider>
    );
}

export function useProductPage() {
    const context = useContext(ProductPageContext);
    if (!context) {
        throw new Error('useProductPageContext must be used within ProductPageProvider!');
    }
    return context;
}