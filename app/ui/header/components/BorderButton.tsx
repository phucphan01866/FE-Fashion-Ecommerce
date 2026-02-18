import Image from 'next/image';
import Link from 'next/link';
import { navButtonClass2 as navButtonClass } from './styles';

export default function BorderButton({
    children, type, customFunction="",
}: {
    children: React.ReactNode, type: string, customFunction?: string,
}) {
    const iconSize = 20;
    return (
        <button className={`${navButtonClass} p-2 rounded-[9999px]`}> 
            <Image src={`icon/${type}.svg`} alt={`${type}`} width={iconSize} height={iconSize} />
        </button>
        
    );
}