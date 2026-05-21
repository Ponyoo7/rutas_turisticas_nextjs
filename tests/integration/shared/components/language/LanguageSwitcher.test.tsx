import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as localeActions from '@/actions/locale.actions'
import { LanguageSwitcher } from '@/shared/components/language/LanguageSwitcher'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import { messages } from '@/shared/i18n/messages'
import * as nextNavigation from 'next/navigation'

const refreshMock = jest.fn()

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    refreshMock.mockClear()
    jest.spyOn(localeActions, 'setLocale').mockResolvedValue(undefined)
    jest.spyOn(nextNavigation, 'useRouter').mockReturnValue({
      refresh: refreshMock,
    } as ReturnType<typeof nextNavigation.useRouter>)
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
      expect(localeActions.setLocale).toHaveBeenCalledWith('en')
      expect(refreshMock).toHaveBeenCalledTimes(1)
    })
  })
})
