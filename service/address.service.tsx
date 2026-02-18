const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import Cookies from 'js-cookie';


export interface TypeAddressPayload {
    receive_name: string;
    phone: string;
    address: string;
    is_default?: boolean;
    tag: string;
};

export interface TypeAddress {
    id: string;
    receive_name: string;
    phone: string;
    address: string;
    is_default?: boolean; // mặc định là false nếu không truyền
    tag: string;
};

export const emptyAdress: TypeAddress = {
    id: '',
    receive_name: '',
    phone: '',
    address: '',
    is_default: true,
    tag: '',
}

export const emptyAdress1: TypeAddress = {
    id: '',
    receive_name: '',
    phone: '',
    address: '',
    is_default: true,
    tag: '',
}

export const addressService = {
    async getUserAddresses() {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/addresses`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error(`Lỗi không lấy được danh sách : ${response.statusText}`);
        }
        const data = await response.json();
        return data.data;
    },

    async addUserAddress(data: TypeAddressPayload) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/addresses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            throw new Error(`Lỗi khi tạo địa chỉ nhận hàng : ${response.statusText}`);
        }
        const result = await response.json();
        console.table("added address:", result);
        return { newAddress: result.address, message: "Đã thêm địa chỉ nhận hàng mới!" };
    },

    async updateUserAddress(addressId: string, addressData: TypeAddressPayload) {
        const token = Cookies.get('accessToken');
        const body = JSON.stringify(addressData);
        const response = await fetch(`${API_URL}/user/addresses/${encodeURIComponent(addressId)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body,
        })
        if (!response.ok) {
            throw new Error(`Lỗi cập nhật địa chỉ nhận hàng : ${response.statusText}`);
        }
        const data = await response.json();
        return { updatedAddress: data.address, message: "Đã cập nhật địa chỉ nhận hàng!" };
    },
    async deleteUserAddress(addressId: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/addresses/${encodeURIComponent(addressId)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Địa chỉ nhận hàng không tồn tại.');
            } else {
                throw new Error(`Lỗi khi xóa địa chỉ nhận hàng : ${response.statusText}`);
            }
        }
        return { message: "Đã xóa địa chỉ nhận hàng!" };
    },
    async setDefaultAddress(addressId: string) {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/user/addresses/${encodeURIComponent(addressId)}/set-default`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Địa chỉ nhận hàng không tồn tại.');
            } else {
                throw new Error(`Lỗi khi đặt địa chỉ mặc định : ${response.statusText}`);
            }
        }
        return { message: "Đã đặt địa chỉ mặc định mới!" };
    },
}

export default addressService;