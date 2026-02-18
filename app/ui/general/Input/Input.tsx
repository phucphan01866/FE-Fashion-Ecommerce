import "@/app/ui/general/Input/Input.css"
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export const baseInputBlockCSS = `
transition-all ease-in-out duration-100
w-full h-fit flex flex-col gap-2 
rounded-md px-4 py-2 border-2 border-gray-200 bg-white hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent transition-colors`;

interface InputProps {
    id: string;
    name?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'file';
    label?: string;
    placeholder?: string;
    bonusCSS?: string;
    wrapperBonusCSS?: string;
    inputBonusCSS?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    // Validation
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    accept?: string;
    // Value control
    value?: string | number;
    defaultValue?: string | number;
    // Events
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    // Error handling
    error?: string;
    // Accessibility
    autoComplete?: string;
    autoFocus?: boolean;
    inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url' | 'search';
    direction?: 'horizontal' | 'vertical';
    unit?: string;
}

export function InputField({
    id,
    name,
    type = "text",
    label,
    placeholder = "",
    bonusCSS = "",
    wrapperBonusCSS = "",
    inputBonusCSS = "",
    required = false,
    disabled = false,
    readOnly = false,
    min,
    max,
    minLength,
    maxLength,
    pattern,
    accept,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    error,
    autoComplete,
    autoFocus,
    inputMode,
    direction = "vertical",
    unit = ""
}: InputProps) {
    return (
        <div className={`
            flex justify-between ${baseInputBlockCSS} ${disabled ? "pointer-events-none opacity-70" : ""} ${direction === "horizontal" && "flex flex-row gap-1 items-baseline"}  ${error ? 'border-red-500 focus-within:border-red-500' : ''} ${wrapperBonusCSS}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="block fontA5 whitespace-nowrap"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1 ">*</span>}
                </label>
            )}

            <Input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                bonusCSS={bonusCSS}
                inputBonusCSS={inputBonusCSS}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                min={min}
                max={max}
                minLength={minLength}
                maxLength={maxLength}
                pattern={pattern}
                accept={accept}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                onKeyDown={onKeyDown}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                inputMode={inputMode}
            />
            {unit && (<div>{unit}</div>)}

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
}

export function InputWithUnit({
    id,
    name,
    type = "text",
    label,
    placeholder = "",
    bonusCSS = "",
    inputBonusCSS = "",
    required = false,
    disabled = false,
    readOnly = false,
    min,
    max,
    minLength,
    maxLength,
    pattern,
    accept,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    error,
    autoComplete,
    autoFocus,
    inputMode,
    direction = "vertical",
}: InputProps) {
    return (
        <div className={`
            ${baseInputBlockCSS}
            ${disabled ? "pointer-events-none opacity-70" : ""}
         ${direction === "horizontal" && "flex flex-row flex-gap-3 items-baseline"} 
         ${error ? 'border-red-500 focus-within:border-red-500' : ''} ${bonusCSS}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="block fontA5 whitespace-nowrap"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1 ">*</span>}
                </label>
            )}

            <Input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                inputBonusCSS={inputBonusCSS}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                min={min}
                max={max}
                minLength={minLength}
                maxLength={maxLength}
                pattern={pattern}
                accept={accept}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                onKeyDown={onKeyDown}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                inputMode={inputMode}
            />

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
}

export default function Input({
    id,
    name,
    type = "text",
    placeholder = "",
    bonusCSS = "",
    inputBonusCSS = "",
    required = false,
    disabled = false,
    readOnly = false,
    min,
    max,
    minLength,
    maxLength,
    pattern,
    accept,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    autoComplete,
    autoFocus,
    inputMode,
    direction = "vertical",
}: Omit<InputProps, 'label' | 'error'>) {
    return (
        <input
            id={id}
            name={name || id}
            type={type}
            placeholder={placeholder}
            className={` focus-visible:!outline-0 flex-1 w-[inherit] ${type === "number" && direction === "horizontal" && 'text-center'} ${bonusCSS} ${inputBonusCSS}`}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            min={min}
            max={max}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            accept={accept}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            inputMode={inputMode}
        />
    );
}

interface TextAreaProps {
    id: string;
    name?: string;
    label?: string;
    placeholder?: string;
    bonusCSS?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    rows?: number;
    minLength?: number;
    maxLength?: number;
    value?: string;
    defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    error?: string;
    autoComplete?: string;
}

export function TextArea({
    id,
    name,
    label,
    placeholder = "",
    bonusCSS = "",
    required = false,
    disabled = false,
    readOnly = false,
    rows = 4,
    minLength,
    maxLength,
    value,
    defaultValue,
    onChange,
    onBlur,
    error,
    autoComplete,
}: TextAreaProps) {
    return (
        <div className={` ${baseInputBlockCSS} ${error ? 'border-red-500 focus-within:border-red-500' : ''} ${bonusCSS}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="block fontA5"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <textarea
                id={id}
                name={name || id}
                placeholder={placeholder}
                className="block w-full h-full focus-visible:!outline-0 resize-y"
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                rows={rows}
                minLength={minLength}
                maxLength={maxLength}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                onBlur={onBlur}
                autoComplete={autoComplete}
            />

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}

            {maxLength && (
                <p className="text-gray-500 text-sm text-right">
                    {value?.toString().length || defaultValue?.length || 0}/{maxLength}
                </p>
            )}
        </div>
    );
}

export interface TypeInputSelect { label: string, content: string };
export function InputSelect({
    id,
    name,
    label,
    items,
    defaultItem,
    error,
    bonusCSS,
    bonusMainBTNCSS,
    required = false,
    onChange,
    children,
    disabled,
    isAdditionalButton = false,
    showDirection = "vertical",
    maxWidth,
    hiddenItems
}: {
    id: string,
    name?: string,
    label?: string,
    items: TypeInputSelect[],
    defaultItem?: string,
    error?: string,
    bonusCSS?: string,
    bonusMainBTNCSS?: string,
    required?: boolean,
    onChange?: (value: string) => void,
    children?: React.ReactNode,
    disabled?: boolean,
    isAdditionalButton?: boolean,
    showDirection?: "vertical" | "horizontal",
    maxWidth?: string,
    hiddenItems?: string[],
}) {
    const [currentValue, setCurrentValue] = useState<TypeInputSelect>(
        defaultItem ? (items.find(item => item.content === defaultItem) || items[0]) : items[0]
    );
    const [listShow, setListShow] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    function toggleList() {
        setListShow(!listShow);
    }

    function handleItemClick(item: TypeInputSelect) {
        if (onChange) onChange(item.content);
        setCurrentValue(item);
        toggleList();
        // console.log(currentValue);
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setListShow(false);
            }
        };
        if (listShow) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [listShow])
    // console.log("Rendering InputSelect with items:", items, "and currentValue:", currentValue);
    if (items.length < 1) return (<div></div>);
    return (
        <div ref={dropdownRef} className={`${maxWidth} relative ${disabled ? "transition-all pointer-events-none opacity-80" : ""}`}>
            <div onClick={toggleList} className={`${baseInputBlockCSS} ${showDirection === 'horizontal' && 'flex-row items-baseline'} ${listShow ? "border-gray-300" : ""} opacity-95 ${error ? 'border-red-500 focus-within:!border-red-500' : ''} ${bonusCSS}`}>
                {label &&
                    <label htmlFor={id} className="fontA5">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>}
                <button type="button" className={`fontA4 !font-medium text-left !leading-6 line-clamp-2 flex justify-between gap-3 ${bonusMainBTNCSS}`}>
                    <p className="flex-1">{currentValue.label}</p>
                    <Image src="/icon/chevron-down.svg" width={16} height={16} alt="dropdown icon" className="inline-block" />
                </button>
            </div>
            {listShow && (
                <div className="transition-all max-h-[max(35dvh,400px)] min-h-[fit] w-full overflow-y-scroll z-10 px-0 p-4 flex flex-col items-start rounded-md border-2 border-gray-200 absolute top-full left-0 mt-1 bg-white shadow-sm">
                    {items.filter(item => !hiddenItems?.some(hiddenItem => hiddenItem === item.content)).map((item, index) => (
                        <button
                            className="capitalize px-4 py-1.5 w-full text-left hover:bg-gray-100"
                            key={index}
                            type="button"
                            onClick={() => handleItemClick(item)}
                        >
                            {!isAdditionalButton && children ? children : item.label}
                        </button>
                    ))}
                    {isAdditionalButton && children ? children : null}
                </div>
            )}
            <input disabled={disabled} name={name ?? id} id={id} className="!hidden" value={currentValue.content} readOnly />
        </div>
    )
}

// show theo currentValue, change bằng cashc truyền value vào onClick
export function ControllableInputSelect({
    id,
    name,
    label,
    items,
    currentValue,
    onClick,
    error,
    bonusCSS,
    bonusMainBTNCSS,
    required = false,
    onChange,
    children,
    disabled,
    isAdditionalButton = false,
    showDirection = "vertical",
    maxWidth,
    hiddenItems,
    centerMainBtn = false,
}: {
    id: string,
    name?: string,
    label?: string,
    items: TypeInputSelect[],
    currentValue?: string,
    onClick: (value: string) => void,
    error?: string,
    bonusCSS?: string,
    bonusMainBTNCSS?: string,
    required?: boolean,
    onChange?: (value: string) => void,
    children?: React.ReactNode,
    disabled?: boolean,
    isAdditionalButton?: boolean,
    showDirection?: "vertical" | "horizontal",
    maxWidth?: string,
    hiddenItems?: string[],
    centerMainBtn?: boolean,
}) {
    const [listShow, setListShow] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    function toggleList() {
        setListShow(!listShow);
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setListShow(false);
            }
        };
        if (listShow) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [listShow])
    // console.log("Rendering InputSelect with items:", items, "and currentValue:", currentValue);
    if (items.length < 1) return (<div></div>);
    return (
        <div ref={dropdownRef} className={`${maxWidth} relative ${disabled ? "transition-all pointer-events-none opacity-80" : ""}`}>
            <div onClick={toggleList} className={`${baseInputBlockCSS} ${showDirection === 'horizontal' && 'flex-row items-baseline'} ${listShow ? "border-gray-300" : ""} opacity-95 ${error ? 'border-red-500 focus-within:!border-red-500' : ''} ${bonusCSS}`}>
                {label &&
                    <label htmlFor={id} className="fontA5">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>}
                <button type="button" className={`fontA4 !font-medium text-left !leading-6 line-clamp-2 flex justify-between gap-3 ${bonusMainBTNCSS}`}>
                    <p className={`${centerMainBtn && 'text-center'} flex-1`}>{items.find(item => item.content === currentValue)?.label || ""}</p>
                    <Image src="/icon/chevron-down.svg" width={16} height={16} alt="dropdown icon" className="inline-block" />
                </button>
            </div>
            {listShow && (
                <div className="transition-all max-h-[max(35dvh,400px)] min-h-[fit] w-full overflow-y-scroll z-10 px-0 py-2 flex justify-between flex-col items-start rounded-md border-2 border-gray-200 absolute top-full mt-1 bg-white shadow-sm">
                    {items.filter(item => !hiddenItems?.some((hiddenItem) => hiddenItem === item.content)).map((item, index) => (
                        <button
                            className="capitalize px-4 py-1.5 w-full text-left hover:bg-gray-100"
                            key={index}
                            type="button"
                            onClick={() => { toggleList(); onClick(item.content); }}
                        >
                            {!isAdditionalButton && children ? children : item.label}
                        </button>
                    ))}
                    {isAdditionalButton && children ? children : null}
                </div>
            )}
            <input disabled={disabled} name={name ?? id} id={id} className="!hidden" value={currentValue} readOnly />
        </div>
    )
}

export function InputToggle({
    id,
    name,
    value = false,
    label,
    bonusCSS,
    inputBonusCSS,
    onChange,
    toggleOnly = false,
    activeOnlyCSS = "",
    inactiveOnlyCSS = "",
}: {
    id?: string;
    name?: string;
    value?: boolean;
    label?: string;
    bonusCSS?: string,
    inputBonusCSS?: string,
    onChange: () => void,
    toggleOnly?: boolean,
    activeOnlyCSS?: string,
    inactiveOnlyCSS?: string,
}) {
    return (
        toggleOnly ? (
            <ToggleButton
                isActive={value}
                toggleActive={onChange}
                activeOnlyCSS={activeOnlyCSS}
                inactiveOnlyCSS={inactiveOnlyCSS}
                toggleOnly={true}
            />
        ) : (
            <div className={`${baseInputBlockCSS} py-3 flex-row gap-3 !w-fit self-end-safe ${bonusCSS}`}>
                {label && (
                    <label
                        htmlFor={id}
                        className="block fontA5"
                    >
                        {label}
                    </label>
                )}
                <input
                    type="checkbox"
                    id={id}
                    name={name || id}
                    className="!hidden"
                    checked={value}
                    readOnly
                />
                <ToggleButton
                    isActive={value}
                    toggleActive={onChange}
                    activeOnlyCSS={activeOnlyCSS}
                    inactiveOnlyCSS={inactiveOnlyCSS}
                    toggleOnly={false}
                />
            </div>
        )
    )

}

export function ToggleButton({ isActive, toggleActive, activeOnlyCSS, inactiveOnlyCSS, toggleOnly }: {
    isActive: boolean,
    toggleActive: () => void,
    activeOnlyCSS?: string,
    inactiveOnlyCSS?: string,
    toggleOnly: boolean,
}) {
    return (
        <div
            onClick={toggleActive}
            className={`
                flex gap-3 items-center 
                p-1 
                rounded-full w-[32px] 
                outline-1 
                cursor-pointer
                transition-all duration-300 ease-in-out
                hover:shadow-md
                ${isActive
                    ? "bg-amber-500 outline-amber-400 "
                    : "bg-white outline-stone-300 "
                }
                ${toggleOnly ? "" : "self-center-safe"}
            `}
        >
            <div
                className={`
                    rounded-full w-[12px] h-[12px]
                    transition-all duration-300 ease-in-out
                    ${isActive ? "bg-white translate-x-[12px]" : "bg-gray-400"}
                    ${isActive ? activeOnlyCSS : inactiveOnlyCSS}
                `}
            />
        </div>
    )
}