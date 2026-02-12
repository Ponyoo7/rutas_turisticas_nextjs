"use client"

import { login } from "@/actions/user.actions"
import { Button } from "@/shared/components/ui/button"
import { useUserStore } from "@/shared/stores/useUserStore"
import { UserCredentials } from "@/shared/types/user"
import { useRouter } from "next/navigation"
import { useState } from "react"

const defaultFormLogin: UserCredentials = {
    email: '',
    password: ''
}

export const LoginForm = () => {
    const router = useRouter()

    const setUser = useUserStore(state => state.setUser)

    const [formData, setFormData] = useState<UserCredentials>({
        ...defaultFormLogin
    })

    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setError(null)

        try {
            const user = await login(formData)
            setUser(user)
            router.push('/')
        } catch (err: any) {
            setError(err.message || 'Email o contraseña incorrectos')
        }
    }

    return (
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-100 border border-red-200 rounded-md">
                    {error}
                </div>
            )}
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >

                    Contraseña
                </label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                />
            </div>

            <Button type="submit" className="w-full mt-2 bg-[#533d2d]">
                Acceder
            </Button>
        </form>
    )
}
