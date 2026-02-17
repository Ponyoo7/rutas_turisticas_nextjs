'use client'

import { login } from '@/actions/user.actions'
import { Button } from '@/shared/components/ui/button'
import { useUserStore } from '@/shared/stores/useUserStore'
import { UserCredentials } from '@/shared/types/user'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const defaultFormLogin: UserCredentials = {
  email: '',
  password: '',
}

export const LoginForm = () => {
  const router = useRouter()

  const setUser = useUserStore((state) => state.setUser)

  const [formData, setFormData] = useState<UserCredentials>({
    ...defaultFormLogin,
  })

  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value,
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
    <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
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
          className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-base transition-all focus:outline-none focus:ring-2 focus:ring-artis-primary/20 focus:border-artis-primary dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="********"
          value={formData.password}
          onChange={handleChange}
          className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-base transition-all focus:outline-none focus:ring-2 focus:ring-artis-primary/20 focus:border-artis-primary dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 mt-2 bg-artis-primary hover:bg-artis-primary/90 text-white font-bold rounded-xl shadow-lg shadow-artis-primary/20 transition-all"
      >
        Acceder
      </Button>
    </form>
  )
}
