import Header from "@/app/ui/header/Header";
import Footer from "@/app/ui/footer/Footer";
import '@/app/globals.css'
import TextSkeleton from "../ui/general/skeletons/TextSkeleton";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}
