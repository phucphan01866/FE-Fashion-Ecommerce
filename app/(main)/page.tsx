import Image from "next/image";
import BannerCarousel from "@/app/ui/home/BannerCarousel";
import { HomePromotion } from "../ui/home/HomeAuthOnlySections";
import CategoryProductsSection from "@/app/ui/home/CategoryProductsSection";
import { HomeProvider } from "@/context/HomeContext";
import ProductSections from "@/app/ui/home/ProductSections";
import NewsSection from "../ui/home/NewsSections";
import HomeService from "@/service/public.service";

export default function Home() {
  async function fetchHomeData() {
    try {
      const data = await HomeService.fetchHomeProducts();
      const topBrandsData = await HomeService.fetchTopBrands();
      return data;
    } catch (error) {
    }
  }
  fetchHomeData();

  return (
    <HomeProvider>
      <BannerCarousel />
      <ProductSections />
      <NewsSection />
    </HomeProvider>
  );
}
