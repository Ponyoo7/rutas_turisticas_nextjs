'use client'

import { login } from '@/actions/user.actions'
import { emitLoginSync } from '@/lib/auth-sync'
import { Button } from '@/shared/components/ui/button'
import { useI18n } from '@/shared/i18n/I18nProvider'
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
  const { t } = useI18n()
  const { setIsLoading, setUser } = useUserStore((state) => ({
    setUser: state.setUser,
    setIsLoading: state.setIsLoading,
  }))

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

    setIsLoading(false)
    setUser(result.user)
    emitLoginSync(result.user)
    router.push('/')
  }

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          {t('common.email')}
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t('auth.login.emailPlaceholder')}
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="h-14 rounded-xl border-artis-primary px-6 text-lg focus:ring-artis-primary focus:border-artis-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          {t('common.password')}
        </label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder={t('auth.login.passwordPlaceholder')}
          value={formData.password}
          onChange={handleChange}
          className="h-14 rounded-xl border-artis-primary px-6 text-lg focus:ring-artis-primary focus:border-artis-primary"
        />
      </div>

      <Button
        type="submit"
        className="mt-2 h-12 w-full rounded-xl border-none bg-artis-primary font-bold text-white shadow-lg transition-all hover:bg-artis-primary/90"
      >
        {t('auth.login.submit')}
      </Button>
    </form>
  )
}
