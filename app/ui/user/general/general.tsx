import Link from "next/link";

export const sectionCSS = "px-4 py-6 rounded-xl bg-white border-2 border-gray-200";
export const sectionCSS_sub = "px-5 py-4 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-between";
export const sectionGridCSS = "grid gap-6";
export const inputCSS = "mt-2 mb-4 bg-gray-100 px-4 py-2 rounded-md min-w-24";

export function Title({ children, additionalCSS }: { children: React.ReactNode, additionalCSS?: string }) {
    return (
        <h2 className={`fontA2 ${sectionCSS_sub} ${additionalCSS}`}>{children}</h2>
    )
}
export function BaseUserPageLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="px-4 py-4 flex flex-col gap-4">
            {children}
        </div>
    );
}

export function Divider() {
    return (
        <div className="Divider border-1 border-gray-100 w-full"></div>
    );
}

// Cách dùng: 
// <div className="relative h-4 bg-gray-200 rounded-full"
//     onMouseEnter={() => setIsTooltipHovered(true)}
//     onMouseLeave={() => setIsTooltipHovered(false)}>
//     {isTooltipHovered && 
//     <ToolTip><p>Nội dung bên trong</p></ToolTip>}
// </div>
export function ToolTip({ children }: { children: React.ReactNode }) {
    return (
        <div className="
        transition-all duration-300 ease-in-out
        w-max absolute top-full mt-2 left-1/2 -translate-x-1/2 fontA6 bg-stone-800 text-nowrap text-white px-1.5 py-1 opacity-75 rounded-md pointer-events-none">{children}</div>
    )
}

const baseCSS = `cursor-pointer
            transition-all duration-250 ease-in-out`;
const generalButtonCSS = `px-3.5 py-2  fontA3 bg-orange-500 rounded-lg text-white
            hover:bg-orange-600`;

export function GeneralButton({ children, onClick, href, additionalCSS, type = "button" }: { children: React.ReactNode, onClick?: () => void, href?: string, additionalCSS?: string, type?: "button" | "submit" | "reset" }) {

    if (href) {
        return (
            <Link className={`${baseCSS} ${generalButtonCSS} ${additionalCSS}`} href={href}>{children}</Link>
        )
    } else if (onClick) {
        return (
            <button type={type} className={`${baseCSS} ${generalButtonCSS} ${additionalCSS}`} onClick={onClick}>{children}</button>
        )
    } else return null;
}
export function VoidGeneralButton() {
    return (
        <button type="button" disabled={true} className={`${baseCSS} bg-transparent hover:bg-transparent text-transparent select-none`}>No content</button>
    )
}

const seeMoreButtonCSS = `px-3 py-2.5 rounded-lg fontA4 group bg-gray-100 hover:bg-orange-400 text-gray-700 hover:text-white`;
export function SeeMoreButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
    return (
        <button type="button" onClick={onClick}
            className={`${baseCSS} ${seeMoreButtonCSS}`} >
            <p className="">{children}</p>
        </button>
    )
}

export function Pagination({ current, total, onPageChange }: { current: number, total: number, onPageChange: (page: number) => void }) {
    return (
        <div className="PaginationSection flex gap-2 justify-center">
            {Array.from({ length: total }, (_, i) => (
                <PaginationButton key={i} current={current} page={i + 1} onClick={() => onPageChange(i + 1)} />
            ))}
        </div>
    )
}

function PaginationButton({ current, page, onClick }: { current: number, page: number, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
            px-2 py-2 rounded-md bg-gray-100 cursor-pointer
        hover:bg-gray-200
        ${current === page ? 'font-bold underline' : ''}
        `}>
            <p className="min-w-[2ch]">{page}</p>
        </button>
    )
}

export const formatIntoDDMMYYYY = (input: string) => {
    if (input.length === 0) return '';
    if (!/^[\d/]*$/.test(input)) {
        return; // không cho nhập ký tự lạ
    }
    const numbers = input.replace(/\D/g, '');
    if (numbers.length > 8) return;
    const formatted = formatDDMMYYYY(numbers);
    return formatted;
}
const formatDDMMYYYY = (numbers: string) => {
    if (numbers.length === 0) return '';
    let day = '';
    let month = '';
    let year = '';
    if (numbers.length <= 2) {
        day = numbers;
    } else if (numbers.length <= 4) {
        day = numbers.slice(0, 2);
        month = numbers.slice(2);
    } else {
        day = numbers.slice(0, 2);
        month = numbers.slice(2, 4);
        year = numbers.slice(4, 8);
    }
    let formatted = (Number(day) > 31 ? '31' : day);
    if (month) formatted += '/' + (Number(month) > 12 ? '12' : month);
    if (year) formatted += '/' + year;
    return formatted;
}