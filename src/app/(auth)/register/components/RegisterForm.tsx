'use client'

import { createUser } from '@/actions/user.actions'
import { Button } from '@/shared/components/ui/button'
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

/**
 * Componente de formulario para el registro de nuevos usuarios.
 * Maneja internamente el estado del formulario, la validación de campos (email, contraseña)
 * y la llamada a la Server Action `createUser` para registrar la información en la base de datos.
 */
export const RegisterForm = () => {
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  /**
   * Valida un campo en específico (nombre, email, contraseñas...).
   * Retorna el mensaje de error o una cadena vacía si es válido.
   */
  const validateField = (name: string, value: string) => {
    let error = ''

    if (name === 'fullname' && !value) {
      error = 'El nombre es obligatorio'
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) error = 'El email es obligatorio'
      else if (!emailRegex.test(value)) error = 'Email no válido'
    }

    if (name === 'password') {
      if (value.length < 8) error = 'Mínimo 8 caracteres'
      else if (!/[A-Z]/.test(value)) error = 'Al menos una mayúscula'
      else if (!/[0-9]/.test(value)) error = 'Al menos un número'
    }

    if (name === 'repassword') {
      if (value !== formData.password) error = 'Las contraseñas no coinciden'
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

  /**
   * Se ejecuta al enviar el formulario (submit).
   * Vuelve a validar todos los campos y de ser exitoso llama al backend (`createUser`).
   * Por defecto, se autogenera un avatar usando ui-avatars.
   */
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setServerError(null)

    const { password, repassword, email, fullname } = formData

    // Validate all fields before submission
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
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      <FormError message={serverError} />
      <FormField
        label="Nombre completo"
        id="fullname"
        name="fullname"
        placeholder="Tu nombre completo"
        value={formData.fullname}
        onChange={handleChange}
        error={errors.fullname}
      />

      <FormField
        label="Email"
        id="email"
        type="email"
        name="email"
        placeholder="ejemplo@correo.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <FormField
        label="Contraseña"
        id="password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <FormField
        label="Repite la contraseña"
        id="repassword"
        type="password"
        name="repassword"
        value={formData.repassword}
        onChange={handleChange}
        error={errors.repassword}
      />

      <Button
        type="submit"
        className="w-full h-12 mt-2 bg-artis-primary text-white hover:bg-artis-primary/90 font-bold rounded-xl shadow-lg border-none transition-all"
      >
        Crear cuenta
      </Button>
    </form>
  )
}
