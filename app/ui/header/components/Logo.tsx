import Image from 'next/image';
import Link from 'next/link';

export default function NavButton() {
    return (
        <>
            <Link href="/" className="relative inline-block w-[120px] h-[40px]">
                <Image
                    src="/logo/logo_2.png"
                    alt="Logo"
                    fill
                    priority
                    className="object-contain"
                />
            </Link>
        </>

    );
}