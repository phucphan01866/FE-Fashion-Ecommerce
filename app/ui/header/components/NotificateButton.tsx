import Image from 'next/image';
import Link from 'next/link';
import { navButtonClass2 as navButtonClass, dropdownClassCenter, dropdownMenuClass2, itemClass2 as itemClass } from './styles';
import { useState } from 'react';

export default function NotificateButton({
    children, type, customFunction = "",
}: {
    children: React.ReactNode, type: string, customFunction?: string,
}) {
    const [expanded, setExpanded] = useState(false);

    const handleClickInside = () => {
        setExpanded(!expanded);
    };
    const handleClickOutside = () => {
        setExpanded(false);
    };
    const iconSize = 20;
    return (
        <div className='relative'>
            <button onClick={handleClickInside} onBlur={handleClickOutside} className={`${navButtonClass} p-2 rounded-[9999px]`}>
                <Image src={`/icon/${type}.svg`} alt={`${type}`} width={iconSize} height={iconSize} />
            </button>
            <div className={`${dropdownClassCenter} ${expanded ? '' : 'hidden'}`}>
                <ul className={`${dropdownMenuClass2}`}>
                    <li><Link href="/" className={`${itemClass}`}>Profile</Link></li>
                    <li><Link href="/" className={`${itemClass}`}>Settings</Link></li>
                    <li><Link href="/" className={`${itemClass}`}>Logout</Link></li>
                </ul>
            </div>
        </div>
    );
}