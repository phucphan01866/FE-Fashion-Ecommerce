import Link from "next/link";


function BreadcrumbItem({ link, content, isDisabled = false }: { link: string, content: string, isDisabled?: boolean }) {
    return (
        isDisabled ? (
            <p className="">
                {content}
            </p>
        ) : (
            <Link href={link} className="font-semibold">
                {content}
            </Link>
        )
    );
}

export interface BreadcrumbItem {
    link: string;
    text: string;
}

export default function Breadcrumb({ breadcrumbItems }: { breadcrumbItems: BreadcrumbItem[] }) {
    const maxIndex = breadcrumbItems.length - 1;
    return (
        <div className="flex gap-2 w-full">
            {breadcrumbItems.map((item, index) => (
                item.text !== '' && (
                    <div className="flex gap-2 fontA4" key={index}>
                        <BreadcrumbItem
                            key={index}
                            link={item.link}
                            content={item.text}
                            isDisabled={index === maxIndex ? true : false} />
                        {index !== maxIndex ? (<span>{`>`}</span>) : null}
                    </div>
                )
            ))}
        </div>
    );
}