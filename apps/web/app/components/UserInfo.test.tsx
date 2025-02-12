import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UserInfoMenu } from './UserInfoMenu'

describe('UserInfo', () => {
  it('should display user name when provided', () => {
    const user = {
      email: 'test@example.com',
      name: 'Test User',
    }
    render(<UserInfoMenu user={user} />)
    expect(screen.getByText('Tes')).toBeDefined()
  })

  it('should display email username when name is not provided', () => {
    const user = {
      email: 'test@example.com',
    }
    render(<UserInfoMenu user={user} />)
    expect(screen.getByText('test')).toBeDefined()
  })

  it('should apply custom className', () => {
    const user = {
      email: 'test@example.com',
    }
    render(<UserInfoMenu user={user} className="custom-class" />)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('should set correct Gravatar URL based on email hash', async () => {
    const user = {
      email: 'negiga@gmail.com',
    }
    const { container } = render(<UserInfoMenu user={user} />)

    // Wait for useEffect to complete
    await new Promise((resolve) => setTimeout(resolve, 100))

    const expectedURL =
      'https://www.gravatar.com/avatar/735bcf3bb5319c0f536eee08cedf4845f50f911adc40f917cc7bd284ac7485fb?d=404'
    const avatar = container.querySelector('img')
    expect(avatar?.src).toBe(expectedURL)
  })
})
