'use client';

import Product from "@/app/ui/general/ProductSection/Product";
import { useDragScroll } from "@/hooks";
import { TypeProduct } from "@/service/product.service";
import { useAuth } from "@/context/AuthContext";
import { useFavorite } from "@/context/FavoriteContext";

export default function HorizontalProductsList({ products, isLoading = false }: { products: TypeProduct[], isLoading?: boolean }) {
    const dragScrollRef = useDragScroll();
    const { user } = useAuth();
    const { favoriteIdsList } = useFavorite();
    const default_products_count = 5;
    return (
        <div
            className={`gap-6 overflow-hidden flex select-none backdrop-opacity-50`}
            ref={dragScrollRef}
        >
            {!isLoading ? products.map((product) => {
                return (
                    <Product key={product.id} data={product} isCustomer={user?.role === 'customer'} isFavored={favoriteIdsList.includes(product.id)}></Product>
                );
            }) : Array.from({ length: default_products_count }).map((_, index) => (
                <Product data={null} key={index} isLoading={true} />
            ))}
        </div>
    );
}