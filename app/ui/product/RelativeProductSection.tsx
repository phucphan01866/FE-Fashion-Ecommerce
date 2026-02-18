import { TypeProduct } from "@/service/product.service";
import ProductListHorizontal from "../general/ProductSection/ProductListHorizontal";
import Link from "next/link";
import { Divider } from "../user/general/general";

export default function RelativeProductSection({ relativeList }: { relativeList: TypeProduct[] }) {
    return (
        relativeList.length > 0 ? (
            <div className="">
                <div className="grid grid-cols-[1fr_auto_1fr] items-baseline-last mb-3">
                    <div></div>
                    <p className="fontA1 justify-self-center self-center w-full">Sản phẩm liên quan</p>
                    <Link className="w-fit ml-auto fontA5 hover:text-orange-600 transition-all duration-100" href={`/product?category_id=${encodeURI(relativeList[0].category_id)}`} >Xem thêm</Link>
                </div>
                <ProductListHorizontal products={relativeList} itemOption="small"></ProductListHorizontal>
            </div>
        ) : null
    );
}
