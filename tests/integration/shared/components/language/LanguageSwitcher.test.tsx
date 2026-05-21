import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LanguageSwitcher } from '@/shared/components/language/LanguageSwitcher'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import { messages } from '@/shared/i18n/messages'

const refreshMock = jest.fn()
const setLocaleMock = jest.fn().mockResolvedValue(undefined)
const useRouterMock = jest.fn(() => ({
  refresh: refreshMock,
}))

jest.mock('@/actions/locale.actions', () => ({
  __esModule: true,
  setLocale: setLocaleMock,
}))

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: useRouterMock,
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    refreshMock.mockClear()
    setLocaleMock.mockClear()
    useRouterMock.mockClear()
  })

  it('persists the selected locale and refreshes the page', async () => {
    const user = userEvent.setup()

    render(
      <I18nProvider locale="es" messages={messages.es}>
        <LanguageSwitcher />
      </I18nProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'English' }))

    await waitFor(() => {
      expect(setLocaleMock).toHaveBeenCalledWith('en')
      expect(refreshMock).toHaveBeenCalledTimes(1)
    })
  })
})
