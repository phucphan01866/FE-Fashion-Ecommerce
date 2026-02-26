import Image from "next/image";
import BannerCarousel from "@/app/ui/home/BannerCarousel";
import { HomePromotion } from "../ui/home/HomeAuthOnlySections";
import CategoryProductsSection from "@/app/ui/home/CategoryProductsSection";
import { HomeProvider } from "@/context/HomeContext";
import ProductSections from "@/app/ui/home/ProductSections";
import NewsSection from "../ui/home/NewsSections";
import HomeService from "@/service/public.service";

export default async function Home() {
  async function fetchHomeData() {
    try {
      const data = await HomeService.fetchHomeProducts();
      // console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
    const data = await fetchHomeData();

    const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test-connect-be`, {
      method: 'GET',
    });
    const testResult = await testResponse.json();
    console.log("Test BE connection:", testResult);

    return (
      <HomeProvider data={data}>
        <BannerCarousel />
        <ProductSections />
        <NewsSection />
      </HomeProvider>
    );
  }
}