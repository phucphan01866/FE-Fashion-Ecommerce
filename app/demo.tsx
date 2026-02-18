export const productList = [
  {
    categoryName: "Shirt", products: [
      { imageSrc: "asian-man-face-mask.jpg", name: "Premium Cotton Polo Premium Cotton Polo ", priceFrom: 180000, priceTo: 320000 },
      { imageSrc: "man-beige-shirt-pants-casual-wear-fashion.jpg", name: "Classic Business Shirt", priceFrom: 250000, priceTo: 450000 },
      { imageSrc: "man-wearing-blue-shirt-with-equal-sign-design.jpg", name: "Casual Graphic Tee", priceFrom: 120000, priceTo: 280000 },
      { imageSrc: "asian-man-face-mask.jpg", name: "Vintage Denim Shirt", priceFrom: 300000, priceTo: 500000 },
      { imageSrc: "man-wearing-blue-shirt-with-equal-sign-design.jpg", name: "Sports Performance Shirt", priceFrom: 160000, priceTo: 350000 },
      { imageSrc: "man-beige-shirt-pants-casual-wear-fashion.jpg", name: "Luxury Silk Shirt", priceFrom: 400000, priceTo: 650000 },
    ]
  },
  {
    categoryName: "Short", products: [
      { imageSrc: "man-beige-shirt-pants-casual-wear-fashion.jpg", name: "Summer Beach Shorts", priceFrom: 140000, priceTo: 240000 },
      { imageSrc: "asian-man-face-mask.jpg", name: "Athletic Training Shorts", priceFrom: 200000, priceTo: 380000 },
      { imageSrc: "man-wearing-blue-shirt-with-equal-sign-design.jpg", name: "Casual Chino Shorts", priceFrom: 180000, priceTo: 320000 },
      { imageSrc: "man-beige-shirt-pants-casual-wear-fashion.jpg", name: "Denim Cargo Shorts", priceFrom: 220000, priceTo: 420000 },
      { imageSrc: "asian-man-face-mask.jpg", name: "Running Sport Shorts", priceFrom: 160000, priceTo: 300000 },
      { imageSrc: "man-wearing-blue-shirt-with-equal-sign-design.jpg", name: "Board Swimming Shorts", priceFrom: 190000, priceTo: 350000 },
    ]
  },
  {
    categoryName: "Sock", products: [
      { imageSrc: "asian-man-face-mask.jpg", name: "Cotton Crew Socks", priceFrom: 50000, priceTo: 120000 },
      { imageSrc: "man-wearing-blue-shirt-with-equal-sign-design.jpg", name: "Wool Hiking Socks", priceFrom: 80000, priceTo: 180000 },
      { imageSrc: "man-beige-shirt-pants-casual-wear-fashion.jpg", name: "Compression Sports Socks", priceFrom: 120000, priceTo: 220000 },
      { imageSrc: "asian-man-face-mask.jpg", name: "Bamboo Ankle Socks", priceFrom: 60000, priceTo: 140000 },
      { imageSrc: "man-beige-shirt-pants-casual-wear-fashion.jpg", name: "Thermal Winter Socks", priceFrom: 90000, priceTo: 190000 },
      { imageSrc: "man-wearing-blue-shirt-with-equal-sign-design.jpg", name: "Dress Business Socks", priceFrom: 70000, priceTo: 160000 },
    ]
  },
];



export const productDemo = {
  id: "1",
  name: "Casual White Blouse",
  category: "T-Shirt",
  description: "This casual white blouse is perfect for everyday wear. Made from soft, breathable fabric, it offers comfort and style. The classic design features a button-down front and a relaxed fit, making it versatile for various occasions. Pair it with jeans for a laid-back look or dress it up with a skirt for a more polished appearance.",
  variants: [
    { colorName: "White", colorCode: "#FFFFFF", size: "S", price: 250000, stock: 10, imageSrc: "white_shirt_img_1.jpg" },
    { colorName: "White", colorCode: "#FFFFFF", size: "L", price: 300000, stock: 5, imageSrc: "white_shirt_img_3.jpeg" },
    { colorName: "Black", colorCode: "#000000", size: "M", price: 280000, stock: 12, imageSrc: "black_shirt_img_1.jpg" },
    { colorName: "Black", colorCode: "#000000", size: "L", price: 310000, stock: 4, imageSrc: "black_shirt_img_2.jpg" },
    { colorName: "Teal", colorCode: "#008080", size: "S", price: 270000, stock: 6, imageSrc: "teal_shirt_img_1.jpg" },
    { colorName: "Red", colorCode: "#FF0000", size: "S", price: 270000, stock: 6, imageSrc: "red_shirt_img_1.jpg" },
  ],
}

export const internationalSizes = ["XS", "S", "M", "L", "XL", "XXL","KHÁC"];

export const userInfo = {
  fullName: "Nguyễn Văn A",
  phoneNumber: "0987654321",
  email: "nguyenvanA@gmail.com"
}

export interface UserInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
}


export const useraddressList = [
  { addressName: "Nơi làm việc", receiverName: "", receiverPhone: "", province: "Hồ Chí Minh", village: "Phường Tăng Nhơn Phú", detailaddress: "97 Man Thiện", isDefault: false },
  { addressName: "Nhà riêng", receiverName: "", receiverPhone: "", province: "Hồ Chí Minh", village: "Phường Tăng Nhơn Phú", detailaddress: "123 Lạc Long Quân", isDefault: true },
  { addressName: "Em trai", receiverName: "Nam", receiverPhone: "0123456778", province: "Tây Ninh", village: "Xã Tây Ninh", detailaddress: "97 Tây Ninh", isDefault: false },
]

export interface addressType {
  addressName: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  village: string;
  detailaddress: string;
  isDefault: boolean;
}

export const cartItemsList = [
  { id: 1, name: "Áo thun ba lỗ Zalo", category: "Áo thun", imgSrc: "/image/casual-white-blouse-women-rsquo-s-fashion.jpg", color: "Trắng", colorCode: "#FFFFFF", size: "M", price: 1000000, discount: 0, quantity: 12 },
  { id: 2, name: "Áo thun Xiaomi", category: "Áo thun", imgSrc: "/image/black_shirt_img_1.jpg", color: "Đen", colorCode: "#000000", size: "L", price: 350000, discount: 10, quantity: 8 },
  { id: 3, name: "Áo sơ mi Việt Tiệp", category: "Áo sơ mi", imgSrc: "/image/teal_shirt_img.jpg", color: "Xanh ngọc", colorCode: "#20B2AA", size: "M", price: 450000, discount: 15, quantity: 5 },
  { id: 4, name: "Áo trắng basic", category: "Áo basic", imgSrc: "/image/white_shirt_img_1.jpg", color: "Trắng", colorCode: "#F5F5F5", size: "S", price: 300000, discount: 5, quantity: 20 },
  { id: 5, name: "Áo đỏ thể thao Uniqlo", category: "Áo thể thao", imgSrc: "/image/red_shirt_img_1.jpg", color: "Đỏ", colorCode: "#C62828", size: "XL", price: 550000, discount: 20, quantity: 3 },
  { id: 6, name: "Áo thun vàng nam Yallow", category: "Áo thun", imgSrc: "/image/man-yellow-t-shirt.jpg", color: "Vàng", colorCode: "#FFD54F", size: "M", price: 220000, discount: 0, quantity: 15 },
];

export interface CartItemType {
  id: number;
  name: string;
  category: string;
  imgSrc: string;
  color: string;
  colorCode: string;
  size: string;
  price: number;
  discount: number;
  quantity: number;
}

export interface CartItemType {
  id: number;
  name: string;
  category: string;
  imgSrc: string;
  color: string;
  colorCode: string;
  size: string;
  price: number;
  discount: number;
  quantity: number;
}

import { TypeCategory } from "@/service/category.service";

export const categoryDemoList: TypeCategory[] = [
  { id: "1", name: "Áo", parent_id: null, image: "https://res.cloudinary.com/demo/image/upload/v1234567890/categories/ao.jpg" },
  { id: "2", name: "Quần", parent_id: null, image: "https://res.cloudinary.com/demo/image/upload/v1234567890/categories/quan.jpg" },
  { id: "3", name: "Giay dép", parent_id: null, image: "https://res.cloudinary.com/demo/image/upload/v1234567890/categories/giay-dep.jpg" },
  { id: "4", name: "Ao thun", parent_id: "1", image: "https://res.cloudinary.com/demo/image/upload/v1234567890/categories/ao-thun.jpg" },
  { id: "5", name: "Áo sơ mi", parent_id: "1", image: "https://res.cloudinary.com/demo/image/upload/v1234567890/categories/ao-so-mi.jpg" },
  { id: "6", name: "Quần jean", parent_id: "2", image: "https://res.cloudinary.com/demo/image/upload/v1234567890/categories/quan-jean.jpg" },
  { id: "7", name: "Quần short", parent_id: "2", image: "https://res.cloudinary.com/demo/image/upload/v1234567890/categories/quan-short.jpg" },
];

import { TypeSupplier } from "@/service/supplier.service";
export const brandList: TypeSupplier[] = [
  {
    id: "1",
    name: "Routine",
    phone: "0281234567",
    contact_email: "contact@routine.vn",
    logo_url: "https://res.cloudinary.com/demo/image/upload/v1234567890/brands/routine-logo.jpg"
  },
  {
    id: "2",
    name: "Canifa",
    phone: "1900636324",
    contact_email: "support@canifa.com",
    logo_url: "https://res.cloudinary.com/demo/image/upload/v1234567891/brands/canifa-logo.jpg"
  },
  {
    id: "3",
    name: "IVY moda",
    phone: "0246273636",
    contact_email: "info@ivymoda.com.vn",
    logo_url: "https://res.cloudinary.com/demo/image/upload/v1234567892/brands/ivy-moda-logo.jpg"
  },
  {
    id: "4",
    name: "YODY",
    phone: "0246273637",
    contact_email: "hello@yody.vn",
    logo_url: "https://res.cloudinary.com/demo/image/upload/v1234567893/brands/yody-logo.jpg"
  },
  {
    id: "5",
    name: "Coolmate",
    phone: "0901122334",
    contact_email: "contact@coolmate.me",
    logo_url: "https://res.cloudinary.com/demo/image/upload/v1234567894/brands/coolmate-logo.jpg"
  },
  {
    id: "6",
    name: "Owen",
    phone: "0912233445",
    contact_email: "support@owen.vn",
    logo_url: "https://res.cloudinary.com/demo/image/upload/v1234567895/brands/owen-logo.jpg"
  },
  {
    id: "7",
    name: "Aristino",
    phone: "1900633027",
    contact_email: "info@aristino.com",
    logo_url: "https://res.cloudinary.com/demo/image/upload/v1234567896/brands/aristino-logo.jpg"
  },
];