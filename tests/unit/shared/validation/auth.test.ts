import { isValidEmail } from '@/shared/validation/auth'

describe('isValidEmail', () => {
  it('accepts a well-formed email address', () => {
    expect(isValidEmail('carla@example.com')).toBe(true)
  })

  it('rejects a malformed email address', () => {
    expect(isValidEmail('carla@example')).toBe(false)
  })

  it('ignores surrounding whitespace', () => {
    expect(isValidEmail('  carla@example.com  ')).toBe(true)
  })
})
