'use client'

import { useContext, createContext, useState, useEffect } from "react";
import { profileService, TypePersonalData, TypeUserProfile } from "@/service/profile.service";
import { useAuth } from "./AuthContext";
import { useCallback } from "react";
import { useNotificateArea } from "./NotificateAreaContext";
import { useDebounce } from "@/hooks";

interface profileContextType {
    userProfile: TypeUserProfile | undefined;
    setUserProfile: (profile: any) => void;
    isLoadingProfile?: boolean;
    personalData: TypePersonalData | undefined;
    updatePersonalDataField: <K extends keyof TypePersonalData>(field: K, value: TypePersonalData[K]) => Promise<void>;
}

const profileContext = createContext<profileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<TypeUserProfile>();
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

    useEffect(() => {
        async function fetchUserProfile() {
            const user = await profileService.getProfile();
            setUserProfile(user);
        }
        if (user !== null) { fetchUserProfile(); } else { setUserProfile(undefined); }
        setIsLoadingProfile(false);
    }, [user]);

    const [personalData, setPersonalData] = useState<TypePersonalData>();

    async function fetchPersonalData() {
        try {
            const data = await profileService.getPersonalData();
            setPersonalData(data.measurement)
        } catch (error) {
            setIsLoadingProfile(false);
        }
    }

    const setNoti = useNotificateArea().setNotification;
    const updatePersonalDataField = useCallback(
        async <K extends keyof TypePersonalData>(
            field: K,
            value: TypePersonalData[K]
        ) => {
            if (!personalData) return;
            try {
                if (field === "height" && value !== null && typeof value === "number") {
                    if (value < 1 || value > 300)
                        throw new Error("Vui lòng nhập chiều cao hợp lệ");
                }
                if (field === "weight" && value !== null && typeof value === "number") {
                    if (value < 1 || value > 500)
                        throw new Error("Vui lòng nhập cân nặng hợp lệ");
                }

                if (value !== null && typeof value === "number") {
                    // bust, waist, hip
                    if (value < 1 || value > 300)
                        throw new Error("Vui lòng nhập số đo hợp lệ");
                }

                const updatedData = { ...personalData, [field]: value || null };

                setPersonalData(updatedData);
                uploadDataDebounced(updatedData);
                setNoti("Đang cập nhật...");
            } catch (error) {
                setPersonalData(personalData);
                setNoti(error instanceof Error ? error.message : "Cập nhật dữ liệu cá nhân thất bại");
            }
        },
        [personalData]
    );

    const uploadDataDebounced = useDebounce(async (updatedData: TypePersonalData) => {
        try {
            await profileService.updatePersonalData(updatedData);
            setNoti("Cập nhật dữ liệu cá nhân thành công");
        } catch (error) {
            throw error;
        }
    }, 1000);

    useEffect(() => {
        if (user) fetchPersonalData();
    }, [user]);


    return (
        <profileContext.Provider value={{ userProfile, setUserProfile, isLoadingProfile, personalData, updatePersonalDataField }}>
            {children}
        </profileContext.Provider>
    );
}

export const useProfile = () => {
    const context = useContext(profileContext);
    if (!context) {
        throw new Error('useProfile must be used within profileProvider');
    }
    return context;
};