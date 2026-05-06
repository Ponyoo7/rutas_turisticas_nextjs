'use client'

import { createUser } from '@/actions/user.actions'
import { Button } from '@/shared/components/ui/button'
import { useI18n } from '@/shared/i18n/I18nProvider'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormField } from './FormField'
import { FormError } from './FormError'

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
  repassword: '',
}

export const RegisterForm = () => {
  const router = useRouter()
  const { t } = useI18n()

  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const validateField = (name: string, value: string) => {
    let error = ''

    if (name === 'fullname' && !value) {
      error = t('auth.validation.fullnameRequired')
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) error = t('auth.validation.emailRequired')
      else if (!emailRegex.test(value)) error = t('auth.validation.invalidEmail')
    }

    if (name === 'password') {
      if (value.length < 8) error = t('auth.validation.minPassword')
      else if (!/[A-Z]/.test(value))
        error = t('auth.validation.uppercasePassword')
      else if (!/[0-9]/.test(value)) error = t('auth.validation.numberPassword')
    }

    if (name === 'repassword' && value !== formData.password) {
      error = t('auth.validation.passwordsDoNotMatch')
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return error
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value,
    })

    validateField(name, value)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setServerError(null)

    const { password, repassword, email, fullname } = formData

    const e1 = validateField('fullname', fullname)
    const e2 = validateField('email', email)
    const e3 = validateField('password', password)
    const e4 = validateField('repassword', repassword)

    if (e1 || e2 || e3 || e4) return

    const profileImage = `https://ui-avatars.com/api/?name=${fullname}&rounded=true`

    const result = await createUser({
      fullname,
      email,
      password,
      image: profileImage,
    })

    if (!result.ok) {
      setServerError(result.error)
      return
    }

    router.push('/login')
  }

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <FormError message={serverError} />
      <FormField
        label={t('auth.register.fullname')}
        id="fullname"
        name="fullname"
        placeholder={t('auth.register.fullnamePlaceholder')}
        value={formData.fullname}
        onChange={handleChange}
        error={errors.fullname}
      />

      <FormField
        label={t('common.email')}
        id="email"
        type="email"
        name="email"
        placeholder={t('auth.login.emailPlaceholder')}
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <FormField
        label={t('common.password')}
        id="password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <FormField
        label={t('auth.register.repeatPassword')}
        id="repassword"
        type="password"
        name="repassword"
        value={formData.repassword}
        onChange={handleChange}
        error={errors.repassword}
      />

      <Button
        type="submit"
        className="mt-2 h-12 w-full rounded-xl border-none bg-artis-primary font-bold text-white shadow-lg transition-all hover:bg-artis-primary/90"
      >
        {t('auth.register.submit')}
      </Button>
    </form>
  )
}
