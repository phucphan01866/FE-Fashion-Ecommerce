import type { Metadata } from "next";
import "@/app/globals.css";

import { inter } from "@/app/ui/fonts/fonts";
import NotificateAreaProvider from "@/context/NotificateAreaContext";
import NotificateArea from "./ui/notificate/NotificateArea";
import AuthProvider from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { CartProvider } from "@/context/CartContext";
import { PublicProvider } from "@/context/PublicContext";
import { FavoriteProvider } from "@/context/FavoriteContext";
import { ChatBoxArea } from "./ui/loggedOnly/LoggedOnlyComponents";
import ClientSideInit from "./_client-side";

export const metadata: Metadata = {
  title: "HS FASHION STORE",
  description: "HS FASHION STORE - Nơi khởi nguồn phong cách của bạn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClientSideInit />
      <body
        className={`${inter.className} 
        min-h-[100%] antialiased flex flex-col items-center`}
      >
        <NotificateAreaProvider>
          <PublicProvider>
            <AuthProvider>
              <ProfileProvider>
                <CartProvider>
                  <FavoriteProvider>
                    {children}
                  </FavoriteProvider>
                </CartProvider>
                <ChatBoxArea />
              </ProfileProvider>
            </AuthProvider>
          </PublicProvider>
          <NotificateArea />
        </NotificateAreaProvider>
      </body>
    </html>
  );
}
