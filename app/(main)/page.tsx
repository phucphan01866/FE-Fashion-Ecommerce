import Image from "next/image";
import BannerCarousel from "@/app/ui/home/BannerCarousel";
import { HomePromotion } from "../ui/home/HomeAuthOnlySections";
import CategoryProductsSection from "@/app/ui/home/CategoryProductsSection";
import { HomeProvider } from "@/context/HomeContext";
import ProductSections from "@/app/ui/home/ProductSections";
import NewsSection from "../ui/home/NewsSections";
import HomeService from "@/service/public.service";

export default async function Home() {
  let data: any;
  async function fetchHomeData() {
    try {
      const data = await HomeService.fetchHomeProducts();
      console.log(data);
      return data;
    } catch (error) {
    }
  }
  data = await fetchHomeData();

  return (
    <HomeProvider data={data}>
      <BannerCarousel />
      <ProductSections />
      <NewsSection />
    </HomeProvider>
  );
}
