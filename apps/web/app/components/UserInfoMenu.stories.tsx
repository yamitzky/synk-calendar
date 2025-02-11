import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { UserInfoMenu } from './UserInfoMenu'

const meta = {
  component: UserInfoMenu,
  tags: ['autodocs'],
  args: {},
} satisfies Meta<typeof UserInfoMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    user: {
      name: 'Mitsuki',
      email: 'negiga@gmail.com',
    },
  },
}

export const WithClickShowMyEvents: Story = {
  args: {
    user: {
      email: 'john@yamitzky.dev',
    },
    onClickShowMyEvents: fn(),
  },
}
