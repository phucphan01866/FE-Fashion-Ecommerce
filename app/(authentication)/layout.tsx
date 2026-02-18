import Header from "@/app/ui/header/Header";
import Image from "next/image";
import "@/app/ui/authentication/style.css";

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
    </>
  );
}
