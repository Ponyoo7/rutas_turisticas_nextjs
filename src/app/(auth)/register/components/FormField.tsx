import { InputHTMLAttributes } from "react"

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    id: string
    error?: string
}

export const FormField = ({ label, id, error, className, ...props }: FormFieldProps) => {
    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor={id}
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
                {label}
            </label>
            <input
                id={id}
                className={`flex h-10 w-full rounded-md border ${error ? 'border-red-500' : 'border-slate-200'} bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    )
}
