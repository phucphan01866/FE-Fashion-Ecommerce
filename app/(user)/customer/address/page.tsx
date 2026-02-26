'use client'

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { sectionCSS, inputCSS, GeneralButton, Title, SeeMoreButton } from "@/app/ui/user/general/general";
import { InputField, InputSelect } from "@/app/ui/general/Input/Input";
// import { useraddressList, userInfo } from "@/app/demo";
import { Divider } from "@/app/ui/user/general/general";
// import { addressType } from "@/app/demo";
import vietnamAddressDB, { Province, Ward } from 'vietnam-address-database';
import addressService, { TypeAddress, TypeAddressPayload } from "@/service/address.service";
import { AddressProvider, useAddress } from "@/context/customer/AddressContext";
import { useNotificateArea } from "@/context/NotificateAreaContext";
import { useRouter } from "next/navigation";

export default function page({ children }: { children?: React.ReactNode }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddressProvider>
                <PageContent />
            </AddressProvider>
        </Suspense>
    );
}

function PageContent() {
    const { isCreateAddress, toggleCreateAddress } = useAddress();
    return (
        <div className="orderPage px-4 py-2 flex flex-col gap-4">
            <div className={`addressInfoSection ${sectionCSS} flex flex-col gap-4`}>
                <Title additionalCSS="border-0! p-0!">
                    <p>Địa Chỉ Nhận Hàng</p>
                    <GeneralButton onClick={toggleCreateAddress} >
                        {isCreateAddress ? "Đóng biểu mẫu" : "+ Thêm địa chỉ"}
                    </GeneralButton>
                </Title>
                <Divider />
                {isCreateAddress ? <AddressCreateSection /> : null}
                <AddressInfoSection />
            </div>
        </div>
    )
}

function AddressCreateSection() {
    return (
        <>
            <AddressForm type="create" />
            <Divider />
        </>
    )
}

function AddressInfoSection() {
    const { addressList } = useAddress();
    return (
        <>{addressList.length === 0 && (
            <p className="fontA4 italic text-center">Chưa có địa chỉ nhận hàng nào được lưu. Vui lòng thêm địa chỉ mới.</p>
        )}
            {addressList && addressList.length > 0 && addressList.map((address, index) => (
                <div className="flex flex-col gap-4" key={index}>
                    {index > 0 ? <Divider /> : null}
                    <AddressItem addressInfo={address} />
                </div>
            ))}

        </>
    )
}

function AddressItem({ addressInfo }: { addressInfo: TypeAddress }) {
    const { isUpdateAddress, toggleUpdateAddress } = useAddress();

    return (
        <div className="AddressItem">
            <PreviewSection addressInfo={addressInfo} toggleShowDetail={() => toggleUpdateAddress(addressInfo.id)} />
            {isUpdateAddress.some((address) => (address.id === addressInfo.id && address.isUpdate === true)) ? <AddressForm addressInfo={addressInfo} /> : null}
        </div>
    )
}

function PreviewSection({ addressInfo, toggleShowDetail }: { addressInfo: TypeAddress, toggleShowDetail: () => void }) {
    const { setNotification } = useNotificateArea();
    const { fetchAddressList } = useAddress();
    async function handleDelete() {
        if (!confirm(`Bạn có chắc chắn muốn xóa địa chỉ: "${addressInfo.tag}" không?`)) return;
        try {
            const result = await addressService.deleteUserAddress(addressInfo.id);
            setNotification(result.message);
            fetchAddressList();
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : "Đã có lỗi xảy ra khi xóa địa chỉ");
        }
    }
    async function handleSetDefault(id: string) {
        try {
            const result = await addressService.setDefaultAddress(id);
            setNotification(result.message);
            fetchAddressList();
        } catch (error) {
            setNotification((error instanceof Error) ? error.message : "Không thể đặt địa chỉ mặc định");
        }
    }
    const iconSize = 20;
    return (
        <div className={`PreviewSection mb-4 grid grid-cols-[auto_auto] justify-between gap-3`}>
            <div className="flex flex-col gap-3">
                <p className="block fontA2 font-semibold!">
                    {addressInfo.tag}
                </p>
                <p className="fontA4 flex">{addressInfo.receive_name} / {addressInfo.phone} / {addressInfo.address}</p>
            </div>
            <div className="flex gap-3 items-end-safe">
                <ButtonSetDefault onClick={() => { addressInfo.is_default || handleSetDefault(addressInfo.id) }} isDefault={addressInfo.is_default || false} />
                <button type="button" onClick={() => toggleShowDetail()} className="w-8 h-8 flex justify-center items-center aspect-square rounded-full hover:bg-gray-100"><Image src="/icon/settings.svg" alt="show" width={iconSize} height={iconSize} /></button>
                <button type="button" onClick={() => handleDelete()} className="w-8 h-8 flex justify-center items-center aspect-square rounded-full hover:bg-gray-100"><Image src="/icon/trash-x-filled.svg" alt="show" width={iconSize} height={iconSize} /></button>
            </div>
        </div>
    );
}

function ButtonSetDefault({ isDefault, onClick }: { isDefault: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`ButtonSetDefault fontA4 !font-medium px-2.5 py-2 rounded-md transition-all duration-200 ease-in-out ${isDefault ? "bg-gray-300 text-white opacity-90 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"}`} >
            Mặc định
        </button>
    );
}

function AddressForm({ addressInfo, type = 'update' }: { addressInfo?: TypeAddress, type?: 'update' | 'create' }) {
    const { setNotification } = useNotificateArea();
    const router = useRouter();
    const [error, setError] = useState<{ [key: string]: string } | null>(null);
    const { addressList, fetchAddressList, closeForms, returnTo } = useAddress();

    let provinces: Province[] = [];
    let wards: Ward[] = [];

    vietnamAddressDB.forEach(item => {
        if (item.type === 'table') {
            if (item.name === 'provinces') {
                provinces = item.data as Province[];
            } else if (item.name === 'wards') {
                wards = item.data as Ward[];
            }
        }
    });
    function getProvinces() {
        return provinces;
    }
    function getProvinceByCode(code: string) {
        return provinces.find(p => p.province_code === code);
    }
    function getWardByProvinceCode(provinceCode: string) {
        return wards.filter(w => w.province_code === provinceCode);
    }
    function getProvinceByName(name: string) {
        return provinces.find(p => p.name === name);
    }
    function getWardByName(name: string) {
        return wards.find(w => w.name === name);
    }

    const oldProvinceCode = addressInfo ? provinces.find(p => p.name === addressInfo.address.split(', ').slice(-1)[0])?.province_code : '';
    const oldWardCode = addressInfo ? wards.find(w => w.name === addressInfo.address.split(', ').slice(-2, -1)[0])?.ward_code : '';
    const oldDetailAddress = addressInfo ? addressInfo.address.split(', ').slice(-1).join(', ') : '';

    const [selectedProvince, setSelectedProvince] = useState<string>(addressInfo ? (oldProvinceCode || "") : "");
    const [filteredWards, setFilteredWards] = useState<Ward[]>(addressInfo ? getWardByProvinceCode(oldProvinceCode || "") : []);
    const [selectedWard, setSelectedWard] = useState<string>(addressInfo ? (oldWardCode || "") : "");

    function validateAddressFormData(data: TypeAddressPayload): { [key: string]: string } {
        const errors: { [key: string]: string } = {};
        if (!data.receive_name) errors.receive_name = "Tên người nhận không được để trống";
        if (!data.phone) {
            errors.phone = "Số điện thoại không được để trống";
        } else {
            const cleanPhone = data.phone.replace(/\s/g, '');
            if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
                errors.phone = "Số điện thoại không hợp lệ!";
            }
        }
        if (!data.tag) errors.tag = "Tên địa điểm không được để trống";

        if (!data.address) {
            errors.address = "Địa chỉ cụ thể không được để trống";
        } else {
            const addressLower = data.address.toLowerCase();
            if (addressLower.includes("phường") || addressLower.includes("xã") || addressLower.includes("tỉnh") || addressLower.includes("thành phố")) {
                errors.address = "Vui lòng chọn tỉnh/thành phố và phường/xã ở ô bên trên";
            }
        }
        console.log('errs, ', errors);
        return errors;
    }

    function handleChangeProvince(value: string) {
        setSelectedProvince(value);
    }

    useEffect(() => {
        if (selectedProvince) {
            const filtered = getWardByProvinceCode(selectedProvince);
            setFilteredWards(filtered);
            setSelectedWard(oldWardCode && filtered.some(w => w.ward_code === oldWardCode) ? oldWardCode : (filtered.length > 0 ? filtered[0].ward_code : ''));
        }
    }, [selectedProvince]);
    useEffect(() => {
    }, [filteredWards])
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data: TypeAddressPayload = {
            receive_name: (document.getElementById('receiverName') as HTMLInputElement)?.value.trim(),
            phone: (document.getElementById('receiverPhone') as HTMLInputElement)?.value.trim(),
            address: (document.getElementById('detailaddress') as HTMLInputElement)?.value.trim(),
            is_default: addressList.length > 0 ? false : true,
            tag: (document.getElementById('addressName') as HTMLInputElement)?.value.trim(),
        };
        const provinceName = getProvinceByCode(selectedProvince)?.name || '';
        const wardName = filteredWards.find(w => w.ward_code === selectedWard)?.name || '';

        try {
            const errors = validateAddressFormData(data);
            if (Object.keys(errors).length > 0) {
                setError(errors);
                throw Error('Thông tin địa chỉ không hợp lệ');
            }
            data.address = `${data.address}, ${wardName}, ${provinceName}`;
            console.table(data);
            if (type === "create") {
                const res = await addressService.addUserAddress(data);
                setNotification(res.message);
                fetchAddressList();
                closeForms();
            } else {
                let result;
                if (addressInfo) result = await addressService.updateUserAddress(addressInfo?.id, data);
                setNotification(result?.message || "Cập nhật địa chỉ thành công");
                fetchAddressList();
                closeForms();
            }
            if (returnTo && returnTo.length > 0) {
                router.push(`${returnTo}`);
            }

        } catch (err) {
            console.log(err);
            setNotification((err instanceof Error) ? err.message : 'Lỗi khi gửi thông tin địa chỉ');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`AddressForm flex flex-col gap-4`}>
            <InputField
                id="addressName"
                label="Tên địa điểm"
                placeholder="VD: Nhà riêng, Công ty, ..."
                defaultValue={type === 'update' ? addressInfo?.tag : ''}
                error={error?.tag}
            />
            <InputField
                id="receiverName"
                label="Tên người nhận"
                placeholder="VD: Nguyễn Văn A"
                defaultValue={type === 'update' ? addressInfo?.receive_name : ''}
                error={error?.receive_name}
            />
            <InputField
                id="receiverPhone"
                label="Số điện thoại người nhận"
                type="tel"
                placeholder="VD: 0912345678"
                defaultValue={type === 'update' ? addressInfo?.phone : ''}
                error={error?.phone}
            />
            <div className="flex gap-4">
                <div className="min-w-[20%]">
                    <InputSelect
                        label="Tỉnh/Thành phố"
                        id="province"
                        items={[...getProvinces().map(province => ({ content: province.province_code, label: province.name })), { content: '-1', label: 'Chọn tỉnh/thành phố' }]}
                        defaultItem={type === 'update' ? (oldProvinceCode) : "-1"}
                        onChange={(value) => handleChangeProvince(value)}
                        error={error?.province}
                    />
                </div>
                <div className="min-w-[20%]" key={selectedProvince}>
                    <InputSelect
                        key={filteredWards.length > 0 ? filteredWards[0].province_code : '0'}
                        label="Phường/Xã"
                        id="ward"
                        items={
                            filteredWards.length > 0
                                ? filteredWards.map((ward) => ({
                                    content: ward.ward_code,
                                    label: ward.name,
                                }))
                                : [{ content: '', label: 'Chọn tỉnh/thành phố trước' }]
                        }
                        defaultItem={
                            type === 'update'
                                ? (() => {
                                    const oldWardCode = getWardByName(addressInfo?.address.split(', ').slice(-2, -1)[0] || "")?.ward_code;
                                    if (filteredWards.length === 0) return "";
                                    if (oldWardCode && filteredWards.some(w => w.ward_code === oldWardCode)) {
                                        return oldWardCode || "";
                                    }
                                    return filteredWards[0].ward_code || "";
                                })()
                                : ''
                        }
                        onChange={(value) => setSelectedWard(value)}
                        error={error?.ward}
                    />
                </div>
            </div>
            <InputField
                id="detailaddress"
                label="Địa chỉ chi tiết"
                placeholder="VD: Số 97, đường Man Thiện"
                defaultValue={type === 'update' ? addressInfo?.address.split(', ').slice(0, -2).join(', ') : ''}
                error={error?.address}
            />
            <GeneralButton additionalCSS="py-3" type="submit" onClick={() => { }}>{type === "create" ? "Thêm địa chỉ" : "Cập nhật địa chỉ"}</GeneralButton>
            {/* <button className="p-2 my-2 rounded-md bg-orange-200 border-2 border-orange-300">{type === "create" ? "Thêm địa chỉ" : "Cập nhật địa chỉ"}</button> */}
        </form>
    );
}