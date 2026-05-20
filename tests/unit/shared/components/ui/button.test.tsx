import { describe, expect, it } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import { Button } from '@/shared/components/ui/button'

describe('Button', () => {
  it('renders its label and variant metadata', () => {
    render(<Button variant="outline">Guardar</Button>)

    const button = screen.getByRole('button', { name: 'Guardar' })

    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'outline')
  })

  it('supports the disabled state', () => {
    render(<Button disabled>Procesando</Button>)

    expect(
      screen.getByRole('button', { name: 'Procesando' }),
    ).toBeDisabled()
  })
})
