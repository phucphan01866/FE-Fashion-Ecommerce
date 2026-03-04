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
import { FaUserCircle } from 'react-icons/fa';
import SideMenu from "./components/SideMenu";
import { Dialog, DialogPanel, Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { useState } from "react";
import { IoMenu } from "react-icons/io5";

const wrapperStyle = `flex flex-row items-center gap-6 lg:gap-2`;

export default function Header({ isSideBarOpen, setIsSideBarOpen }: { isSideBarOpen: boolean, setIsSideBarOpen: (isOpen: boolean) => void }) {
  const path = usePathname().split('/').filter(Boolean);
  const secondFirstRoute = path[0] || '';
  const isSettingRoutes = secondFirstRoute === 'customer' || secondFirstRoute === 'admin';

  return (
    <header
      className={`w-full bg-white ${isSettingRoutes && 'shadow-md '}`}>
      <div className={`grid lg:grid-cols-[auto_1fr] grid-cols-[1fr_auto_1fr] justify-between items-center ${isSettingRoutes ?
        'container' : 'container-tablet-above lg:mx-6'} my-1`}>
        <Left secondFirstRoute={secondFirstRoute} isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen}></Left>
        <Center></Center>
        <Right></Right>
      </div>
    </header>
  );
}
function Left({ secondFirstRoute, isSideBarOpen, setIsSideBarOpen }: { secondFirstRoute: string, isSideBarOpen: boolean, setIsSideBarOpen: (isOpen: boolean) => void }) {
  return (
    <div className="h-fit">
      <div className={`${wrapperStyle} hidden lg:flex items-center`}>
        {(secondFirstRoute !== "customer" && secondFirstRoute !== "admin") && (
          <>
            <Logo />
            <Navigation />
          </>
        )}
      </div>
      {(secondFirstRoute === "customer" || secondFirstRoute === "admin") && (
        <div className="flex-row items-center gap-2 justify-start px-4 py-2 flex lg:hidden">
          <button onClick={() => setIsSideBarOpen(!isSideBarOpen)}><IoMenu className="text-2xl" /></button>
        </div>
      )}
    </div>
  );
}
function Center() {
  // async function test() {
  //   try {
  //     const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test`, {
  //       method: 'GET',
  //     });
  //     const testResult = await testResponse.json();
  //     console.log("Test BE connection:", testResult);
  //   } catch (error) {
  //     console.error("Error testing BE connection:", error);
  //   }
  // }
  // test();
  // async function testDB() {
  //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test-db`, {
  //     method: 'GET',
  //   });
  //   const data = await res.json();
  //   console.log("Test DB connection:", data);
  // }
  // testDB();
  return (
    <div className={`flex items-center lg:hidden`}>
      <Logo />
    </div>
  );
}
function Right() {
  const { user } = useAuth();
  const { userProfile } = useProfile();
  const { cart } = useCart();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <div>
      <div className={`${wrapperStyle} justify-end p-2 hidden lg:flex`}>
        <SearchBar />
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
        ) : <div className="">
          <Authentication />
        </div>}
      </div>
      <div className={`${wrapperStyle} justify-end px-4 py-2 flex lg:hidden`}>
        <CartButton items={cart?.items || []} />
        <button onClick={() => setIsSideMenuOpen(true)}><FaUserCircle className="text-gray-900 text-2xl" /></button>
        <Dialog open={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} as="div">
          <Transition show={true} appear={true}>
            <div className="transition data-closed:opacity-50 fixed flex justify-end-safe left-0 top-0 w-screen h-screen bg-black/75 z-100">
              <DialogPanel transition={true} className={'transition data-closed:translate-x-[30px]'}>
                <div
                  className="w-fit h-screen bg-white p-4"
                  style={{ minWidth: 'min(400px, 100vw)' }}>
                  <SideMenu user={user} closeMenu={() => setIsSideMenuOpen(false)} />
                </div>
              </DialogPanel>
            </div>
          </Transition>
        </Dialog>
      </div>
    </div>
  );
}

function Divider() {
  return <div className={`${dividerClass}`}></div>
}