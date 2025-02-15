import type { Meta, StoryObj } from '@storybook/react'
import { UserInfo } from './UserInfo'

const meta = {
  component: UserInfo,
  tags: ['autodocs'],
  args: {},
} satisfies Meta<typeof UserInfo>

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

export const NoGravatar: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john@yamitzky.dev',
    },
  },
}

export const NoGravatarWithEmail: Story = {
  args: {
    user: {
      email: 'john@yamitzky.dev',
    },
  },
}
