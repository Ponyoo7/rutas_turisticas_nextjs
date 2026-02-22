'use client'

import { login } from '@/actions/user.actions'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
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

    const result = await login(formData)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setUser(result.user)
    router.push('/')
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
        <Input
          id="email"
          type="email"
          placeholder="ejemplo@correo.com"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="h-14 text-lg border-artis-primary focus:ring-artis-primary focus:border-artis-primary rounded-xl px-6"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="********"
          value={formData.password}
          onChange={handleChange}
          className="h-14 text-lg border-artis-primary focus:ring-artis-primary focus:border-artis-primary rounded-xl px-6"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 mt-2 bg-artis-primary text-white hover:bg-artis-primary/90 font-bold rounded-xl shadow-lg border-none transition-all"
      >
        Acceder
      </Button>
    </form>
  )
}
