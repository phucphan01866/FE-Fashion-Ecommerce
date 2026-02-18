import Link from "next/link";

const buttonMdCSS = "px-3 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition fontA5 !font-medium";

export function ButtonMd({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={`${buttonMdCSS}`}>{children}</button>
    )
}

export function LinkMd({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className={`${buttonMdCSS}`}>{children}</Link>
    )
}

