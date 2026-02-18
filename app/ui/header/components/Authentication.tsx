

import Image from 'next/image';
import { navButtonClass } from './styles';
import Link from 'next/link';

function Button({ isHighlighted = false, children, action }: { isHighlighted?: boolean, children: React.ReactNode, action: string }) {
    switch (isHighlighted) {
        case false: return (<Link href={action} className={`${navButtonClass} bg-gray-100`}>{children}</Link>);
        case true: return (<Link href={action} className={`${navButtonClass} bg-orange-500 hover:bg-orange-400 hover:opacity-95 text-white`}>{children}</Link>);
    };
}

export default function Authentication() {
    return (
        <div className='flex flex-row items-center gap-2'>
            <Button action="/login">Đăng nhập</Button>
            <Button action="/register" isHighlighted={true}>Đăng ký</Button>
        </div>
    );
}