import Image from "next/image";
import BannerCarousel from "@/app/ui/home/BannerCarousel";
import { HomePromotion } from "../ui/home/HomeAuthOnlySections";
import CategoryProductsSection from "@/app/ui/home/CategoryProductsSection";
import { HomeProvider } from "@/context/HomeContext";
import ProductSections from "@/app/ui/home/ProductSections";
import NewsSection from "../ui/home/NewsSections";
import HomeService from "@/service/public.service";
import { Suspend } from "react-wrap-with-suspense";

export default function Page() {
  return (
    <Suspend fallback={<div>Loading...</div>}>
      <Home />
    </Suspend>
  )
}

 async function Home() {
  async function fetchHomeData() {
    try {
      const data = await HomeService.fetchHomeProducts();
      // console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
    const data = await fetchHomeData();

    return (
      <HomeProvider data={data}>
        <BannerCarousel />
        <ProductSections />
        <NewsSection />
      </HomeProvider>
    );
  }
}