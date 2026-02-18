import Image from "next/image";
import BannerCarousel from "@/app/ui/home/BannerCarousel";
import { HomePromotion } from "../ui/home/HomeAuthOnlySections";
import CategoryProductsSection from "@/app/ui/home/CategoryProductsSection";
import { HomeProvider } from "@/context/HomeContext";
import ProductSections from "@/app/ui/home/ProductSections";
import NewsSection from "../ui/home/NewsSections";

export default function Home() {
  return (
    <HomeProvider>
      <BannerCarousel />
      <ProductSections />
      <NewsSection />
    </HomeProvider>
  );
}
