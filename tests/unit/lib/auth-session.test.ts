import { hasSessionUserChanged } from '@/lib/auth-session'

describe('hasSessionUserChanged', () => {
  it('returns false when there is no expected user id', () => {
    expect(
      hasSessionUserChanged({
        authenticatedUserId: '12',
      }),
    ).toBe(false)
  })

  it('returns false when both user ids match', () => {
    expect(
      hasSessionUserChanged({
        authenticatedUserId: '12',
        expectedUserId: '12',
      }),
    ).toBe(false)
  })

  it('returns true when the authenticated user differs from the expected one', () => {
    expect(
      hasSessionUserChanged({
        authenticatedUserId: '12',
        expectedUserId: '34',
      }),
    ).toBe(true)
  })
})
