const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// sku, color_name, color_code, sizes, stock_qty, images: variantImages = []

export interface TypeVariantPayload {
    sku: string;
    color_name: string;
    color_code: string;
    sizes: string[];
    stock_qty: number;
    images: string[]| { url: string }[];
    images_files?: Map<number, File>;
}

export interface TypeVariant extends TypeVariantPayload {
    id: string;
}

export interface TypeFetchVariantPayload extends Omit<TypeVariantPayload, 'images'> {
    images: { url: string }[];
}

export interface ParsedSku {
  productName: string;   // Áo thun rản rị
  category: string;      // Áo Polo
  supplier: string;      // Nike
  color: string;         // Đỏ tía
}

export function parseSku(sku: string): ParsedSku {
  const parts = sku.trim().split('-');

  const [productName = '', category = '', supplier = '', color = ''] = parts;

  return {
    productName: productName.trim(),
    category: category.trim(),
    supplier: supplier.trim(),
    color: color.trim(),
  };
}

// export async function getProducts(): Promise<TypeProduct[]> {
//     try {
//         const token = localStorage.getItem('accessToken');
//         const response = await fetch(`${API_URL}/admin/products`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//         })
//         const data = await response.json();
//         return data.products;
//     } catch (error) {
//         console.error('Error fetching suppliers:', error);
//         throw error;
//     }
// }

// export async function createSupplier(inputData: TypeSupplier) {
//     try {
//         const token = localStorage.getItem('accessToken');
//         const response = await fetch(`${API_URL}/admin/suppliers`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//                 name: inputData.name,
//                 contact_email: inputData.contact_email,
//                 phone: inputData.phone,
//                 logo_url: inputData.logo_url,
//             })
//         })
//         if (response.ok) {
//             return (`Thêm nhà phân phối thành công`);
//         } else {
//             const errorText = await response.text();
//             return (`Error: ${response.status} - ${errorText}`)
//         }

//     } catch (error) {
//         console.error('Error creating suppliers:', error);
//         throw error;
//     }
// }

// export async function removeSupplier(id: string) {
//     try {
//         const token = localStorage.getItem('accessToken');
//         const response = await fetch(`${API_URL}/admin/suppliers/${encodeURIComponent(id)}`, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//         })
//         if (response.ok) {
//             return (`Xóa nhà phân phối thành công`);
//         } else {
//             const errorText = await response.text();
//             return (`Error: ${response.status} - ${errorText}`)
//         }

//     } catch (error) {
//         console.error('Error creating suppliers:', error);
//         throw error;
//     }
// }

// export async function editSupplier(inputData: TypeSupplier) {
//     try {
//         const token = localStorage.getItem('accessToken');
//         const response = await fetch(`${API_URL}/admin/suppliers/${encodeURIComponent(inputData.id)}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//                 name: inputData.name,
//                 contact_email: inputData.contact_email,
//                 phone: inputData.phone,
//                 logo_url: inputData.logo_url,
//             })
//         })
//         if (response.ok) {
//             return (`Cập nhật nhà phân phối thành công`);
//         } else {
//             const errorText = await response.text();
//             return (`Error: ${response.status} - ${errorText}`)
//         }

//     } catch (error) {
//         console.error('Error deleting suppliers:', error);
//         throw error;
//     }
// }