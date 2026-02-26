'use client'
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/app/ui/general/Breadcrumb/Breadcrumb";
import Product from "@/app/ui/general/ProductSection/Product";
import { productDemo } from "@/app/demo";



function SideBar() {
    return (
        <div className="grid gap-2">
            <div className="flex gap-4">
                <SideBarToggleBtn />
                <Tag />
            </div>
            <FilterArea />
        </div>
    )
}

function SideBarToggleBtn() {
    return (
        <button type="button"
            className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
            Lọc sản phẩm ▼
        </button>
    );
}

function Tag() {
    return (
        <div className="flex gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
            <p className="select-none">Áo ba lỗ</p>
            <button type="button">✕</button>
        </div>
    )
}

function FilterArea() {
    return (
        <div className="flex gap-2">
            <FilterItem>Loại</FilterItem>
            <FilterItem>Kích thước</FilterItem>
            <FilterItem>Khoảng giá</FilterItem>
        </div>
    );
}

function FilterItem({ children }: { children: string }) {
    return (
        <div className="relative">
            <button type="button"
                className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">{children}</button>

            <div className="absolute hidden top-full mt-2">
                <div className="grid justify-items-start gap-2 py-2 bg-gray-100 rounded-lg">
                    <FilterSelectButton />
                    <FilterSelectButton />
                    <FilterSelectButton />
                </div>
            </div>

        </div>
    );
}

function FilterSelectButton() {
    return (
        <button type="button" className="px-3 py-1 hover:bg-gray-200">Áo T-shirt</button>
    );
}

function ImageArea() {
    return (
        <div>
            <Image src="/images/sample-product.jpg" alt="Sample Product" width={500} height={500} />
        </div>
    );
}

function ContentArea() {
    const productSampleData = {
        imageSrc: productDemo.variants[0].imageSrc,
        name: productDemo.name,
        priceFrom: 50000,
        priceTo: 150000,
    }
    return (
        <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr_1fr_1fr] lg:grid-cols-[1fr_1fr_1fr_1fr] gap-4">
            <Product data={productSampleData} />
            <Product data={productSampleData} />
            <Product data={productSampleData} />
            <Product data={productSampleData} />
            <Product data={productSampleData} />
            <Product data={productSampleData} />
            <Product data={productSampleData} />
            <Product data={productSampleData} />
            <Product data={productSampleData} />
        </div>
    )
}

function Divider() {
    return (
        <div className="w-full h-[0px] border-1 border-gray-100"></div>
    );
}

function PaginateArea() {
    return (
        <div className="w-full flex gap-2 justify-center">
            <PaginateButton isCurrentPage={true}>1</PaginateButton>
            <PaginateButton>2</PaginateButton>
            <PaginateButton>3</PaginateButton>
            <PaginateButton>...</PaginateButton>
            <PaginateButton>9</PaginateButton>

        </div>
    );
}

function PaginateButton({ children, isCurrentPage = false }: { children: React.ReactNode, isCurrentPage?: boolean }) {
    return (
        <div className={`inline-block px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg mx-1  ${isCurrentPage ? "bg-gray-200" : "bg-gray-100 cursor-pointer"}`}> {children} </div>
    );
}

const breadcrumbItems = [
    { link: "/", text: "Trang chủ" },
    { link: "category", text: "Áo thông dụng" }
]


export default function page() {
    return (
        <div className="container">
            <Breadcrumb breadcrumbItems={breadcrumbItems} />
            <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl ">
                <SideBar />
                <Divider />
                <ContentArea />
                <PaginateArea />
            </div>
        </div>
    );
}       