'use client';

import { useAuth } from "@/context/AuthContext";
import Logo from "./components/Logo";
import Navigation from "./components/Navigation";
import SearchBar from "./components/SearchBar";
import User from "./components/User";
import CartButton from "./components/CartButton";
import { usePathname } from "next/navigation";
import Authentication from "./components/Authentication";
import { dividerClass } from "./components/styles";
import "@/app/ui/header/components/style.css";
import { useProfile } from "@/context/ProfileContext";
import { useCart } from "@/context/CartContext";

const wrapperStyle = `flex flex-row items-center gap-2`;

export default function Header() {
  const path = usePathname().split('/').filter(Boolean);
  const secondFirstRoute = path[0] || '';
  const isSettingRoutes = secondFirstRoute === 'customer' || secondFirstRoute === 'admin';
  return (
    <header
      className={`w-full bg-white ${isSettingRoutes && 'shadow-md '}`}>
      <div className={`flex flex-row justify-between items-center ${isSettingRoutes ?
        'container' : 'mx-6'
        }`}>
        <Left secondFirstRoute={secondFirstRoute}></Left>
        <Center></Center>
        <Right></Right>
      </div>

    </header>
  );
}

function Left({ secondFirstRoute }: { secondFirstRoute: string }) {
  return (
    <div className={`${wrapperStyle}`}>
      {(secondFirstRoute !== "customer" && secondFirstRoute !== "admin") ? (
        <>
          <Logo />
          <Navigation />
        </>
      ) : null}

    </div>
  );
}
function Center() {
  return (
    <div className={`${wrapperStyle}`}></div>
  );
}
function Right() {
  const { user } = useAuth();
  const { userProfile } = useProfile();
  const { cart } = useCart();

  return (
    <div className={`${wrapperStyle} p-2`}>
      <SearchBar></SearchBar>
      {user ? (
        <>
          <Divider />
          {user.role === 'customer' &&
            <>
              <CartButton items={cart?.items || []} />
              <Divider />
            </>}

          <User name={userProfile?.full_name || userProfile?.name || userProfile?.email || ""} role={user.role}></User>
        </>
      ) : <Authentication />}
    </div>
  );
}

function Divider() {
  return <div className={`${dividerClass}`}></div>
}