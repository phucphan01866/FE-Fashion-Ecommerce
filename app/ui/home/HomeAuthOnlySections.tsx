'use client'

import { useState, useEffect } from "react"

import HomePromotionSection from "@/app/ui/home/PromotionSection";
import { useAuth } from "@/context/AuthContext";

export function HomePromotion() {
    const { user } = useAuth();
    if (user && user.role === 'customer') {
        return <HomePromotionSection />
    }
    return null;
}