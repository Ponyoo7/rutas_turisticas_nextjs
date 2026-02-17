interface FormErrorProps {
  message: string | null
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null

  return (
    <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 mb-2">
      <span className="material-symbols-outlined text-lg">error</span>
      {message}
    </div>
  )
}
