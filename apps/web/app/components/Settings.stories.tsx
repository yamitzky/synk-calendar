import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ReminderSettings } from './Settings'

const meta = {
  title: 'Components/ReminderSettings',
  component: ReminderSettings,
  parameters: {
    layout: 'centered',
  },
  args: {
    onChange: fn(),
    className: 'w-96',
  },
} satisfies Meta<typeof ReminderSettings>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    user: {
      email: 'test@example.com',
      name: 'Test User',
    },
    reminders: [
      { id: '1', minutes: 5, type: 'webhook' },
      { id: '2', minutes: 30, type: 'webhook' },
    ],
  },
}

export const Empty: Story = {
  args: {
    user: {
      email: 'test@example.com',
    },
    reminders: [],
  },
}
