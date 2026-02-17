import { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  error?: string
}

export const FormField = ({
  label,
  id,
  error,
  className,
  ...props
}: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        {label}
      </label>
      <input
        id={id}
        className={`flex h-12 w-full rounded-xl border ${error ? 'border-red-500' : 'border-gray-200'} bg-white px-4 py-2 text-base transition-all focus:outline-none focus:ring-2 focus:ring-artis-primary/20 focus:border-artis-primary dark:border-gray-700 dark:bg-gray-800 ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  )
}
