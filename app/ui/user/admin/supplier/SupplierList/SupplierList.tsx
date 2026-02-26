import Image from "next/image";
import { sectionCSS } from "@/app/ui/user/general/general";
import { TypeSupplier } from "@/service/supplier.service";
import { useAdminSupplierContext } from "@/context/AdminContexts/AdminSupplierContext";
import { removeSupplier } from "@/service/supplier.service";
import { useNotificateArea } from "@/context/NotificateAreaContext";

export default function SupplierList() {
    return (
        <div className={`SupplierTable ${sectionCSS} flex-1 flex flex-col gap-4`}>
            <TableArea />
        </div>
    )
}
function FilterArea() {
    return (
        <div className={`FilterArea`}>
            Filter Area
        </div>
    )
}
function TableArea() {
    const { supplierList } = useAdminSupplierContext();
    return (
        <table className={`TableArea border-separate border-spacing-4`}>
            <thead className="">
                <tr>
                    <th className="">Logo</th>
                    <th className="">Tên nhà cung cấp</th>
                    <th className="">Email liên hệ</th>
                    <th className="">Số điện thoại</th>
                    <th className="">Lựa chọn</th>
                </tr>
            </thead>
            <tbody className="">
                {supplierList.sort((a, b) => (a.name.localeCompare(b.name, 'vi'))).map((brand) => (
                    <BrandItem key={brand.id} brand={brand} />
                ))}
            </tbody>
        </table>
    )
}
function BrandItem({ brand }: { brand: TypeSupplier }) {
    const { fetchSuppliers, selectedSupplier, setSelectedSupplier, isEditing, setIsEditing } = useAdminSupplierContext();
    const { setNotification } = useNotificateArea();
    async function handleRemoveSupplier(id: string) {
        try {
            if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này không?")) {
                const result = await removeSupplier(brand.id);
                fetchSuppliers();
                setNotification(result || "Xóa thành công");
            }
        } catch (error) {
            if (error instanceof Error) {
                setNotification(error.message);
            }
        }
    }
    function toggleEdit(id: string) {
        if (selectedSupplier?.id === id && isEditing) {
            setIsEditing(false);
        } else {
            setIsEditing(true);
            setSelectedSupplier(brand);
        }
    }
    return (
        <tr className="" key={brand.id}>
            <td className="text-center">
                {brand.logo_url && (<Image src={brand.logo_url} alt={`${brand.name}'s logo`} width={24} height={24} className="mx-auto" />)}
            </td>
            <td className="py-4 px-2 text-center">{brand.name}</td>
            <td className="py-4 px-2 text-center">{brand.contact_email ?? "N/A"}</td>
            <td className="py-4 px-2 text-center">{brand.phone ?? "N/A"}</td>
            <td className="flex justify-center gap-3">
                <button type="button" onClick={() => toggleEdit(brand.id)} className="py-4 hover:text-orange-500 hover:cursor-pointer ">Sửa</button>
                <button type="button" onClick={() => handleRemoveSupplier(brand.id)} className="py-4 hover:text-orange-500 hover:cursor-pointer ">Xóa</button>
            </td>
        </tr>
    );
}
