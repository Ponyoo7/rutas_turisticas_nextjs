import { InputHTMLAttributes } from 'react'
import { Input } from '@/shared/components/ui/input'

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
      <Input
        id={id}
        className={`h-14 text-lg ${error ? 'border-red-500' : 'border-artis-primary'} focus:ring-artis-primary focus:border-artis-primary rounded-xl px-6 ${className ?? ''}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  )
}
