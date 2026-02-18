const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

import Cookies from 'js-cookie';

export interface TypeSupplier {
    id: string;
    name: string;
    contact_email: string;
    phone: string;
    logo_url: string;
}

export async function getSuppliers(): Promise<TypeSupplier[]> {
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/suppliers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        const data = await response.json();
        return data.suppliers;
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
    }
}
export async function createSupplier(inputData: TypeSupplier) {
    try {
        console.log("Creating supplier:", inputData);
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/suppliers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: inputData.name,
                contact_email: inputData.contact_email,
                phone: inputData.phone,
                logo_url: inputData.logo_url,
            })
        })
        if (response.ok) {
            return (`Thêm nhà phân phối thành công`);
        } else {
            const errorText = await response.json();
            console.log(errorText);
            throw new Error(errorText.message || 'Error creating supplier');
        }

    } catch (error) {
        console.error('Error creating suppliers:', error);
        console.log(error);
        if (error instanceof Error && error.message === 'duplicate key value violates unique constraint "unique_supplier_name"') {
            return 'Tên nhà cung cấp đã tồn tại. Vui lòng chọn tên khác.';
        }
    }
}

export async function removeSupplier(id: string) {
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/suppliers/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        if (response.ok) {
            return (`Xóa nhà phân phối thành công`);
        } else {
            const errorText = await response.json();
            console.log(errorText.message);
            throw new Error(errorText.message);
        }
    } catch (error) {
        if (error instanceof Error && error.message === 'Supplier has associated products') {
            throw new Error('Hiện không thể xóa nhà cung cấp vì có sản phẩm liên quan.');
        }
    }
}

export async function editSupplier(inputData: TypeSupplier) {
    try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_URL}/admin/suppliers/${encodeURIComponent(inputData.id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: inputData.name,
                contact_email: inputData.contact_email,
                phone: inputData.phone,
                logo_url: inputData.logo_url,
            })
        })
        if (response.ok) {
            return (`Cập nhật nhà phân phối thành công`);
        } else {
            const errorText = await response.text();
            return (`Error: ${response.status} - ${errorText}`)
        }

    } catch (error) {
        console.error('Error deleting suppliers:', error);
        throw error;
    }
}