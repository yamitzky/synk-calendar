import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { UserInfoMenu } from './UserInfoMenu'

describe('UserInfoMenu', () => {
  it('should show dropdown menu when avatar is clicked', async () => {
    const user = userEvent.setup()
    render(<UserInfoMenu user={{ email: 'test@example.com' }} />)

    const avatar = screen.getByRole('button', { name: 'User avatar' })
    await user.click(avatar)

    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should navigate to settings page when Settings is clicked', async () => {
    const user = userEvent.setup()
    render(<UserInfoMenu user={{ email: 'test@example.com' }} />)

    const avatar = screen.getByRole('button', { name: 'User avatar' })
    await user.click(avatar)
    await screen.findByText('Settings')

    const settingsLink = screen.getByText('Settings')
    expect(settingsLink.closest('a')).toHaveAttribute('href', '/settings')
  })

  it('should show My Events option only when onClickShowMyEvents is provided', async () => {
    const user = userEvent.setup()
    const onClickShowMyEvents = vi.fn()

    // First render without the callback
    const userInfo = { email: 'test@example.com' }
    const { rerender } = render(<UserInfoMenu user={userInfo} />)
    const avatar = screen.getByRole('button', { name: 'User avatar' })
    await user.click(avatar)
    expect(screen.queryByText('My Events')).not.toBeInTheDocument()

    // Re-render with the callback
    rerender(<UserInfoMenu user={userInfo} onClickShowMyEvents={onClickShowMyEvents} />)
    await user.click(avatar)
    await screen.findByText('My Events')
    expect(screen.getByText('My Events')).toBeInTheDocument()
  })

  it('should call onClickShowMyEvents when My Events is clicked', async () => {
    const user = userEvent.setup()
    const onClickShowMyEvents = vi.fn()
    render(<UserInfoMenu user={{ email: 'test@example.com' }} onClickShowMyEvents={onClickShowMyEvents} />)

    const avatar = screen.getByRole('button', { name: 'User avatar' })
    await user.click(avatar)

    const searchOption = screen.getByText('My Events')
    await user.click(searchOption)
    expect(onClickShowMyEvents).toHaveBeenCalledTimes(1)
  })
})
