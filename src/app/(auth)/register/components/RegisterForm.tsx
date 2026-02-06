"use client"

import { createUser } from "@/actions/user.actions"
import { Button } from "@/shared/components/ui/button"
import { useState } from "react"

interface FormData {
    fullname: string
    email: string
    password: string
    repassword: string
}

const initialFormData: FormData = {
    fullname: '',
    email: '',
    password: '',
    repassword: ''
}

export const RegisterForm = () => {
    const [formData, setFormData] = useState<FormData>({
        ...initialFormData
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()

        const { password, repassword, email, fullname } = formData

        if (password !== repassword) return


        createUser({
            fullname, email, password
        })
    }

    return (
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="fullname"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    Nombre completo
                </label>
                <input
                    id="fullname"
                    name="fullname"
                    placeholder="Tu nombre completo"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                />
            </div>
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
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

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="repassword"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    Repite la contraseña
                </label>
                <input
                    id="repassword"
                    type="password"
                    name="repassword"
                    value={formData.repassword}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                />

                <Button type="submit" className="w-full mt-2 bg-[#533d2d]">
                    Crear cuenta
                </Button>
            </div>
        </form>
    )
}