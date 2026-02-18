'use client'

import { useContext, createContext, useState, useEffect } from "react";
import addressService, { TypeAddress } from "@/service/address.service";
import Cookies from "js-cookie";
import { useNotificateArea } from "../NotificateAreaContext";
import { useSearchParams } from "next/navigation";

interface AddressContextType {
    addressList: TypeAddress[];
    setAddressList: (input: TypeAddress[]) => void;
    fetchAddressList: () => Promise<void>;
    isUpdateAddress: { id: string, isUpdate: boolean }[];
    setIsUpdateAddress: (input: { id: string, isUpdate: boolean }[]) => void;
    isCreateAddress: boolean;
    setIsCreateAddress: React.Dispatch<React.SetStateAction<boolean>>;
    toggleCreateAddress: () => void;
    closeForms: () => void;
    toggleUpdateAddress: (id: string) => void;
    returnTo: string;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: React.ReactNode }) {
    const [addressList, setAddressList] = useState<TypeAddress[]>([]);
    const { setNotification } = useNotificateArea();
    const [isUpdateAddress, setIsUpdateAddress] = useState<{ id: string, isUpdate: boolean }[]>(addressList.map((address) => (
        { id: address.id, isUpdate: false }
    )));
    const searchParams = useSearchParams();
    const [isCreateAddress, setIsCreateAddress] = useState(false);
    const [returnTo, setReturnTo] = useState<string>('');
    useEffect(() => {
        const create = searchParams.get('create');
        setIsCreateAddress(create === 'true');
        setReturnTo(searchParams.get('prev') || '');
    }, [searchParams]);

    function toggleUpdateAddress(id: string) {
        const stateBefore = isUpdateAddress.find((item) => item.id === id)?.isUpdate;
        closeForms();
        setIsUpdateAddress(isUpdateAddress.map((item) =>
            item.id === id ? { ...item, isUpdate: !stateBefore && true } : { ...item, isUpdate: !stateBefore && false }
        ));
    }
    function toggleCreateAddress() {
        const stateBefore = isCreateAddress;
        closeForms();
        if (!stateBefore) setIsCreateAddress(true);
    }
    function closeForms() {
        setIsCreateAddress(false);
        setIsUpdateAddress(isUpdateAddress.map((item) => ({ ...item, isUpdate: false })));
    }

    async function fetchAddressList() {
        try {
            const addresses = await addressService.getUserAddresses();
            setAddressList(addresses);
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : 'Đã có lỗi xảy ra khi lấy danh sách địa chỉ người dùng');
        }
    }
    useEffect(() => {
        fetchAddressList();
    }, []);
    useEffect(() => {
        setIsUpdateAddress(addressList.map((address) => (
            { id: address.id, isUpdate: false }
        )))
    }, [addressList]);

    return (
        <AddressContext.Provider
            value={{
                addressList,
                setAddressList,
                fetchAddressList,
                isUpdateAddress,
                setIsUpdateAddress,
                isCreateAddress,
                setIsCreateAddress,
                toggleCreateAddress,
                closeForms,
                toggleUpdateAddress,
                returnTo,
            }}
        >
            {children}
        </AddressContext.Provider>
    );
}

export const useAddress = () => {
    const context = useContext(AddressContext);
    if (!context) {
        throw new Error('useAddress must be used within AddressProvider');
    }
    return context;
};