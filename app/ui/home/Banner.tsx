import Image from "next/image";
import Link from "next/link";

// interface BannerProps {
//     imageSrc: string;
//     title: string;
//     subtitle: string;
//     buttonText: string;
// }

interface BannerProps {
    src: string;
    id: string;
}

export default function Banner({ data, currentIndex, thisBannerIndex }: { data: BannerProps, currentIndex: number, thisBannerIndex: number }) {
    return (
        <div
            className="absolute h-[520px] w-screen z-0"
            style={{ transform: `translateX(-${(thisBannerIndex - currentIndex) * 100}%)` }}>
            < Image src={data.src} fill sizes="100vw" alt="outer banner"
                className="object-cover blur-sm w-[150%] -ml-[12px] scaleX-[1.5]" />
            <Link href={`/product?category=${data.id}`}>
                < Image src={data.src} fill sizes="100vw" alt="inner banner"
                    className="object-cover scale-[0.95] top-1/2 left-1/2 border-2 border-white rounded-md" />
            </Link>
        </div >
    );
}

// export default function Banner({ data, currentIndex, thisBannerIndex }: { data: string, currentIndex: number, thisBannerIndex: number }) {
//     return (
//         <div
//             className="absolute h-[520px] w-screen z-0"
//             style={{ transform: `translateX(-${(thisBannerIndex - currentIndex) * 100}%)` }}>
//             < Image src={data.imageSrc} fill sizes="100vw" alt="outer banner"
//                 className="object-cover blur-sm w-[150%] -ml-[12px] scaleX-[1.5]" ></Image >
//             < Image src={data.imageSrc} fill sizes="100vw" alt="inner banner"
//                 className="object-cover scale-[0.95] top-1/2 left-1/2 border-2 border-white rounded-md" ></Image >
//             <div className="absolute top-1/2 translate-y-[-50%] left-[10%] flex flex-col gap-4 p-5 ">
//                 <h1 className="text-white text-4xl font-bold">{data.title}</h1>
//                 <h2 className="text-white text-xl italic">{data.subtitle}</h2>
//                 <Link href={"/"} className="text-white p-2 bg-orange-500 w-fit">{data.buttonText}</Link>
//             </div>
//         </div >
//     );
// }