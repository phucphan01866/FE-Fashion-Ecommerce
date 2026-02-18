export interface VariantDetail {
  colorName: string;
  colorCode: string;
  size: string;
  price: number;
  stock: number;
  imageSrc: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  category: string;
  description: string;
  variants: VariantDetail[];
}