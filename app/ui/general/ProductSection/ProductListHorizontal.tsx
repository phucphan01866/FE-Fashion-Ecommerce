'use client';

import Product from "@/app/ui/general/ProductSection/Product";
import { useDragScroll } from "@/hooks";
import { TypeProduct } from "@/service/product.service";
import { useAuth } from "@/context/AuthContext";
import { useFavorite } from "@/context/FavoriteContext";

export default function ProductListHorizontal({ products, itemOption = "medium" }: { products: TypeProduct[], itemOption?: "small" | "medium" | "large" }) {
    const dragScrollRef = useDragScroll();
    const { user } = useAuth();
    const { favoriteIdsList } = useFavorite();
    return (
        <div
            className={`gap-6 overflow-hidden flex select-none backdrop-opacity-50`}
            ref={dragScrollRef}
        >
            {products.map((product) => {
                return (
                    <Product key={product.id} data={product} itemOption={itemOption} isCustomer={user?.role === 'customer'} isFavored={favoriteIdsList.includes(product.id)}></Product>
                );
            })}
        </div>
    );
}