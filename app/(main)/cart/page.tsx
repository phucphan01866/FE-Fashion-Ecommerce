
import LeftCart from "@/app/ui/cart/LeftCart";
import RightCart from "@/app/ui/cart/RightCart";
import { CartProvider } from "@/context/CartContext";

export default function Cart() {
    return (
        // responsive from LG to above
        <div className="py-4 container flex flex-col lg:grid gap-6 lg:grid-cols-[1fr_30%]">
            <LeftCart />
            <RightCart />
        </div>
    );
}
