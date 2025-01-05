import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { UserInfo } from './UserInfo'

describe('UserInfo', () => {
  it('should display user name when provided', () => {
    const user = {
      email: 'test@example.com',
      name: 'Test User',
    }
    render(<UserInfo user={user} />)
    expect(screen.getByText('Tes')).toBeDefined()
  })

  it('should display email username when name is not provided', () => {
    const user = {
      email: 'test@example.com',
    }
    render(<UserInfo user={user} />)
    expect(screen.getByText('test')).toBeDefined()
  })

  it('should apply custom className', () => {
    const user = {
      email: 'test@example.com',
    }
    const { container } = render(<UserInfo user={user} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should set correct Gravatar URL based on email hash', async () => {
    const user = {
      email: 'negiga@gmail.com',
    }
    const { container } = render(<UserInfo user={user} />)

    // Wait for useEffect to complete
    await new Promise((resolve) => setTimeout(resolve, 100))

    const expectedURL =
      'https://www.gravatar.com/avatar/735bcf3bb5319c0f536eee08cedf4845f50f911adc40f917cc7bd284ac7485fb?d=404'
    const avatar = container.querySelector('img')
    expect(avatar?.src).toBe(expectedURL)
  })

  it('should show dropdown menu when avatar is clicked', async () => {
    const user = userEvent.setup()
    render(<UserInfo user={{ email: 'test@example.com' }} />)

    const avatar = screen.getByRole('button', { name: 'User avatar' })
    await user.click(avatar)

    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should navigate to settings page when Settings is clicked', async () => {
    const user = userEvent.setup()
    render(<UserInfo user={{ email: 'test@example.com' }} />)

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
    const { rerender } = render(<UserInfo user={userInfo} />)
    const avatar = screen.getByRole('button', { name: 'User avatar' })
    await user.click(avatar)
    expect(screen.queryByText('My Events')).not.toBeInTheDocument()

    // Re-render with the callback
    rerender(<UserInfo user={userInfo} onClickShowMyEvents={onClickShowMyEvents} />)
    await user.click(avatar)
    await screen.findByText('My Events')
    expect(screen.getByText('My Events')).toBeInTheDocument()
  })

  it('should call onClickShowMyEvents when My Events is clicked', async () => {
    const user = userEvent.setup()
    const onClickShowMyEvents = vi.fn()
    render(<UserInfo user={{ email: 'test@example.com' }} onClickShowMyEvents={onClickShowMyEvents} />)

    const avatar = screen.getByRole('button', { name: 'User avatar' })
    await user.click(avatar)

    const searchOption = screen.getByText('My Events')
    await user.click(searchOption)
    expect(onClickShowMyEvents).toHaveBeenCalledTimes(1)
  })
})
