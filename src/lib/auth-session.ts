interface HasSessionUserChangedParams {
  authenticatedUserId: string
  expectedUserId?: string | null
}

export const hasSessionUserChanged = ({
  authenticatedUserId,
  expectedUserId,
}: HasSessionUserChangedParams) => {
  if (typeof expectedUserId !== 'string') return false

  const normalizedExpectedUserId = expectedUserId.trim()

  if (normalizedExpectedUserId.length === 0) return false

  return authenticatedUserId !== normalizedExpectedUserId
}
