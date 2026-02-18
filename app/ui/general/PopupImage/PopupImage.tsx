import Image from 'next/image';

import { useRef } from 'react';

export function PopupImage({ imageUrl, isOpen, close, open }: { imageUrl: string, toggleOpen?: boolean, isOpen: boolean, close: () => void, open: () => void }) {

    const divRef = useRef<HTMLDivElement>(null);
    if (!imageUrl || imageUrl.length === 0 || !isOpen) {
        return null;
    }
    function handleClose(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
        close();
    }
    function handleImageClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
    }

    return (
        <div ref={divRef} onClick={handleClose} className='flex justify-center-safe fixed top-0 left-0 w-full h-full z-99 bg-gray-900/75 bg-opacity-100'>
            <div className='relative block aspect-1/1 w-fit mx-auto my-auto h-[80%]'>
                <Image
                    src={imageUrl}
                    alt="Logo"
                    fill
                    priority
                    className="object-contain rounded-md"
                    onClick={handleImageClick}
                />
                <button type='button' onClick={close} className='group hover:scale-110 hover:bg-gray-500/50 transition-all duration-150 ease-in-out flex justify-center-safe items-center-safe w-8 h-8 aspect-square cursor-pointer absolute top-3.5 right-4.5 rounded-full bg-gray-400/25'>
                    <p className='group-hover:text-gray-900 group-hover:scale-110 transition-all duration-150 ease-in-out aspect-square w-auto h-auto'>
                        X
                    </p>
                </button>
            </div>
        </div>
    )
}