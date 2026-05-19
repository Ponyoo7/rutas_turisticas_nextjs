import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { setLocale } from '@/actions/locale.actions'
import { LanguageSwitcher } from '@/shared/components/language/LanguageSwitcher'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import { messages } from '@/shared/i18n/messages'

const refreshMock = jest.fn()

jest.mock('@/actions/locale.actions', () => ({
  setLocale: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    refreshMock.mockClear()
    jest.mocked(setLocale).mockClear()
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
      expect(setLocale).toHaveBeenCalledWith('en')
      expect(refreshMock).toHaveBeenCalledTimes(1)
    })
  })
})
