import Image from "next/image";
import Link from "next/link";

import Input from "../general/Input/Input";

const iconSize = 20;

export function Button({ imgSrc, altText, children, onClick }: { imgSrc?: string, altText?: string, children?: React.ReactNode, onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="w-full text-center flex items-center justify-center gap-2 px-4 py-2 border rounded hover:bg-gray-100">
            <Image src={`${imgSrc}`} alt={`${altText}`} width={iconSize} height={iconSize} />
            {children && <span>{children}</span>}
        </button>
    );
}
export function InputField({ id, label, type = "text", placeholder, error, autofill, disabled = false, value, onChange, maxLength, defaultValue }: {
    id: string,
    label: string,
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date',
    placeholder: string,
    error?: string,
    autofill?: string,
    disabled?: boolean,
    value?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    maxLength?: number,
    defaultValue?: string | number,
}) {
    return (
        <div className={`${disabled && "opacity-50"}`}>
            <label className="mb-2 flex! justify-between" htmlFor={id} >
                <p className="fontA4">{label}</p>
                <p className="fontA5 italic text-red-500">{error}</p>
            </label>
            <Input maxLength={maxLength} value={value} onChange={onChange} disabled={disabled} bonusCSS="px-4 py-2 rounded-sm bg-gray-100 w-full" id={id} type={type} placeholder={placeholder} autoComplete={autofill} />
        </div>
    )
};

interface FormProps {
    type: string;
    children?: React.ReactNode;
    socialButtons?: React.ReactNode;
    footerContents?: React.ReactNode;
    formBonusCSS?: string;
}

export default function BaseAuthForm({ type, children, socialButtons, footerContents, formBonusCSS }: FormProps) {
    const textContent = (type === "login" ? {
        title: "Mừng bạn trở lại!",
        description: "Đăng nhập ngay!"
    } : (type === "register") ? {
        title: "Tạo tài khoản",
    } : (type === "forgotPassword") ? {
        title: "Đặt lại mật khẩu",
    } : null)
    return (
        <div className="h-[90dvh] min-h-fit w-[100%] flex flex-row px-12 py-2 bg-white">
            <div className="relative min-h-fit w-1/2 flex justify-center items-center ml-12 my-2">
                <div className={`max-w-[450px] w-full flex flex-col gap-4 ${formBonusCSS}`}>
                    <div className="">
                        <h1 className="text-2xl font-semibold mb-2">{textContent?.title}</h1>
                        <p className="italic">{textContent?.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        {children}
                    </div>
                    {socialButtons ? (
                        <>
                            <div>
                                <p className="w-fit mx-auto fontA5">----- Hoặc -----</p>
                            </div>
                            <div className="flex flex-row gap-3 justify-center">
                                {socialButtons}
                            </div>
                        </>
                    ) : null}
                    <div>
                        {footerContents}
                    </div>

                </div>
            </div>
            <div className="relative flex-1 ml-12 my-2">
                <Image src="/image/BG_1.jpg" alt="/" fill className="rounded-lg"></Image>
            </div>
        </div>
    );

}