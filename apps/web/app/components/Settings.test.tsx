import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReminderSettings } from './Settings'

describe('ReminderSettings', () => {
  const userInfo = {
    email: 'test@example.com',
    name: 'Test User',
  }

  it('renders user information', () => {
    render(<ReminderSettings user={userInfo} reminders={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('displays existing reminders', () => {
    const reminders = [
      { id: '1', minutes: 5, type: 'webhook' },
      { id: '2', minutes: 30, type: 'webhook' },
    ] as const
    render(<ReminderSettings user={userInfo} reminders={reminders} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '5 min Notify before' }))
    expect(screen.getByRole('button', { name: '30 min Notify before' }))
  })

  it('calls onChange when adding a reminder', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReminderSettings user={userInfo} reminders={[]} onChange={onChange} />)

    await user.click(screen.getByText('＋'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        minutes: 5,
        type: 'webhook',
      }),
    ])
  })

  it('calls onChange when removing a reminder', async () => {
    const user = userEvent.setup()

    const reminders = [
      { id: '1', minutes: 5, type: 'webhook' },
      { id: '2', minutes: 30, type: 'webhook' },
    ] as const
    const onChange = vi.fn()
    render(<ReminderSettings user={userInfo} reminders={reminders} onChange={onChange} />)

    const removeButton = screen.getAllByRole('button', { name: '❌' })[0]
    if (removeButton) {
      await user.click(removeButton)
    }

    expect(onChange).toHaveBeenCalledWith([reminders[1]])
  })

  it('calls onChange when updating reminder minutes', async () => {
    const user = userEvent.setup()
    const reminders = [{ id: '1', minutes: 5, type: 'webhook' }] as const
    const onChange = vi.fn()
    render(<ReminderSettings user={userInfo} reminders={reminders} onChange={onChange} />)

    const select = screen.getByRole('button', { name: '5 min Notify before' })
    await user.click(select)
    const option = screen.getByRole('option', { name: '10 min' })
    await user.click(option)

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '1',
        minutes: 10,
        type: 'webhook',
      }),
    ])
  })
})
