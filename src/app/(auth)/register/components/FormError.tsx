interface FormErrorProps {
    message: string | null
}

export const FormError = ({ message }: FormErrorProps) => {
    if (!message) return null

    return (
        <div className="p-3 text-sm text-red-500 bg-red-100 border border-red-200 rounded-md">
            {message}
        </div>
    )
}
