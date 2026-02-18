const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import Cookies from 'js-cookie';

export interface TypeUserProfile {
    email: string;
    full_name?: string;
    name?: string;
    phone?: string;
    address?: string;
}

export interface TypePersonalData {
    gender: string | null;
    height: number | null;
    weight: number | null;
    waist: number | null;
    hip: number | null;
    bust: number | null;
}

export interface TypeProfileUpdate {
    full_name: string, phone: string, name: string;
}

export const profileService = {
    async getProfile(): Promise<TypeUserProfile> {
        const token = Cookies.get('accessToken');
        try {
            const res = await fetch(`${API_URL}/user/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            return await res.json();
        } catch (error) {
            throw error;
        }
    },
    async updateProfile(data: TypeProfileUpdate): Promise<TypeUserProfile> {
        const token = Cookies.get('accessToken');
        try {
            const res = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            return result.user;
        } catch (error) {
            throw error;
        }
    },
    async deleteProfile() {
        const token = Cookies.get('accessToken');
        try {
            const res = await fetch(`${API_URL}/user/profile`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            return await res.json();
        } catch (error) {
            throw error;
        }
    },
    async getPersonalData() {
        const token = Cookies.get('accessToken');
        try {
            const res = await fetch(`${API_URL}/user/measurements`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const result = await res.json();
            // console.log("   Personal data fetched:", result);
            return result;
        } catch (error) {
            throw error;
        }
    },
    async updatePersonalData(data: TypePersonalData) {
        const token = Cookies.get('accessToken');
        console.log("đang gửi: ",data);
        try {
            const res = await fetch(`${API_URL}/user/measurements`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }
            );
            const result = await res.json();
            // console.log("Personal data updated:", result);
            return result;
        } catch (error) {
            throw error;
        }
    },
}