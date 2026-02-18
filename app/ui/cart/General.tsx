export const blockContainerCSS = "bg-white rounded-xl px-12 py-6"

export function Divider() {
    return (
        <div className="w-full h-[0px] border-1 border-stone-100"></div>
    );
}

export function Title({ children }: { children: string }) {
    return (
        <h2 className="fontA2 font-semibold">{children}</h2>
    );
}