export default function BasicLoadingSkeleton() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="relative mx-auto mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-orange-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-orange-100"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    <div className="h-3 w-36 bg-gray-100 rounded animate-pulse mx-auto"></div>
                </div>
                <div className="flex justify-center gap-2 mt-6">
                    <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}

export function TextLoadingSkeleton() {
    return (
        <div className="space-y-3">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-3 w-36 bg-gray-100 rounded animate-pulse mx-auto"></div>
        </div>
    )
}

export function ContentLoadingSkeleton() {
    return (
        <div className="flex justify-center gap-2">
            <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce"></div>
        </div>
    )
}

export function SpinLoadingSkeleton({customSpinnerCSS} : {customSpinnerCSS ?: string}) {
    return (
        <div className="relative mx-auto mb-6">
            <div className={`animate-spin rounded-full mx-auto h-16 w-16 border-4 border-gray-200 border-t-orange-600 ${customSpinnerCSS}`}></div>
        </div>
    )
}