

import Image from 'next/image';
import { navButtonClass } from './styles';
import Link from 'next/link';

function Button({ isHighlighted = false, children, action, mainBtnBonusCss, noBG = false }: { isHighlighted?: boolean, children: React.ReactNode, action: string, mainBtnBonusCss?: string, noBG?: boolean }) {
    // switch (isHighlighted) {
    //     case false: return (<Link href={action} className={`${navButtonClass} ${mainBtnBonusCss || ''} ${noBG ? '' : 'bg-gray-100'}`}>{children}</Link>);
    //     case true: return (<Link href={action} className={`${navButtonClass} ${mainBtnBonusCss || ''} bg-orange-500 hover:bg-orange-400 hover:opacity-95`}>{children}</Link>);
    // };
    return (
        <Link href={action} className={`${navButtonClass} ${mainBtnBonusCss || ''} ${noBG ? '' : isHighlighted ? 'bg-orange-500 hover:bg-orange-400 text-white' : 'bg-gray-100'}`}>{children}</Link>
    )
}

export default function Authentication() {
    return (
        <div className='flex flex-row items-center gap-2 fontA4 h-full'>
            <div>
                <Button action="/login">
                    <span className='block'>Đăng nhập</span>
                </Button>
            </div>
            <div className='block'>
                <Button action="/register" isHighlighted={true} mainBtnBonusCss=''>
                    <span>Đăng ký</span>
                </Button>
            </div>
        </div>
    );
}