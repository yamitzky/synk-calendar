import type { Meta, StoryObj } from '@storybook/react'
import { EventDetail } from './EventDetail'

const meta = {
  component: EventDetail,
  tags: ['autodocs'],
} satisfies Meta<typeof EventDetail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Team Meeting',
    start: '2023-06-15T10:00:00',
    end: '2023-06-15T11:00:00',
    description: 'Discussing project progress.',
    location: 'Meeting Room A',
    people: [
      { displayName: 'John Smith', email: 'john.smith@example.com', organizer: true },
      { displayName: 'Jane Doe', email: 'jane.doe@example.com', organizer: false },
    ],
  },
}

export const WithConference: Story = {
  args: {
    title: 'Online Meeting',
    start: '2023-06-16T14:00:00',
    end: '2023-06-16T15:00:00',
    description: 'Online meeting using Zoom.',
    conference: {
      name: 'Zoom Meeting',
      url: 'https://zoom.us/j/1234567890',
    },
    people: [
      { displayName: 'Alice Johnson', email: 'alice.johnson@example.com', organizer: true },
      { displayName: 'Bob Williams', email: 'bob.williams@example.com', organizer: false },
    ],
  },
}

export const LongEvent: Story = {
  args: {
    title: 'Annual Conference',
    start: '2023-07-01T09:00:00',
    end: '2023-07-03T17:00:00',
    description: 'Three-day company annual conference with various sessions and networking opportunities.',
    location: 'New York Convention Center',
    people: [
      { displayName: 'Charlie Brown', email: 'charlie.brown@example.com', organizer: false },
      { displayName: 'Diana Clark', email: 'diana.clark@example.com', organizer: false },
      { displayName: 'Edward Davis', email: 'edward.davis@example.com', organizer: false },
    ],
  },
}

export const WithOnlineLocation: Story = {
  args: {
    title: 'Webinar',
    start: '2023-06-20T13:00:00',
    end: '2023-06-20T14:30:00',
    description: 'Online webinar about our new product.',
    location: 'https://webinar.example.com/product-launch',
    people: [{ displayName: 'Fiona Evans', email: 'fiona.evans@example.com', organizer: false }],
  },
}
