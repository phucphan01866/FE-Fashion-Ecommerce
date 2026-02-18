
import LeftCart from "@/app/ui/cart/LeftCart";
import RightCart from "@/app/ui/cart/RightCart";
import { CartProvider } from "@/context/CartContext";

export default function Cart() {
    return (
        <div className="py-4 container grid gap-6 grid-cols-[1fr_30%]">
            <LeftCart />
            <RightCart />
        </div>
    );
}
