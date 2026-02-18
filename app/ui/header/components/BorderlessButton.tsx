import Image from 'next/image';
import Link from 'next/link';
import { navButtonClass, dropdownClassLeft, itemClass, dropdownMenuClass } from './styles';
import { use, useState } from 'react';

export default function BorderlessButton({
    children,
    type =
    'link',
    href = '/',
    items
}: {
    children: React.ReactNode,
    type?: 'link' | 'list',
    href?: string,
    items?: { href: string, content: string }[]
}) {

    const [expanded, setExpanded] = useState(false);
    const iconSize = 14;

    const handleHoverIn = () => {
        items?.length &&
            setExpanded(true);
    };
    const handleHoverOut = () => {
        setExpanded(false);
    };

    if (type === 'link') {
        return (
            <Link href={href} className={`${navButtonClass}`}>{children}</Link>
        );
    } else if (type === 'list') {
        return (
            <div className={`relative ${navButtonClass}`} onMouseEnter={handleHoverIn} onMouseLeave={handleHoverOut}>
                <Link href={href} className={`list flex flex-row items-center gap-2`}>
                    <p>{children}</p>
                    <Image src="/icon/chevron_down.svg" alt="Arrow down" width={iconSize} height={iconSize} />
                </Link>
                <div className={`${dropdownClassLeft}`}>
                    {expanded && (
                        <ul className={`${dropdownMenuClass}`}>
                            {items?.map((item, index) => (
                                <li key={item.href}><Link href={item.href} className={`${itemClass} nowrap`}>{item.content}</Link></li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }
}