import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AppRouterContext,
  type AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime'

import { LanguageSwitcher } from '@/shared/components/language/LanguageSwitcher'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import { messages } from '@/shared/i18n/messages'

const refreshMock = jest.fn()
const setLocaleMock = jest.fn().mockResolvedValue(undefined)

jest.mock('@/actions/locale.actions', () => ({
  __esModule: true,
  setLocale: setLocaleMock,
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    refreshMock.mockClear()
    setLocaleMock.mockClear()
  })

  it('persists the selected locale and refreshes the page', async () => {
    const user = userEvent.setup()
    const router = {
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      push: jest.fn(),
      refresh: refreshMock,
      replace: jest.fn(),
      hmrRefresh: jest.fn(),
    } as AppRouterInstance

    render(
      <AppRouterContext.Provider value={router}>
        <I18nProvider locale="es" messages={messages.es}>
          <LanguageSwitcher />
        </I18nProvider>
      </AppRouterContext.Provider>,
    )

    await user.click(screen.getByRole('button', { name: 'English' }))

    await waitFor(() => {
      expect(setLocaleMock).toHaveBeenCalledWith('en')
      expect(refreshMock).toHaveBeenCalledTimes(1)
    })
  })
})
