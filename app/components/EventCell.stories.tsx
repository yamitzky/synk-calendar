import type { Meta, StoryObj } from '@storybook/react'
import { EventCell } from './EventCell'

const meta = {
  component: EventCell,
  tags: ['autodocs'],
} satisfies Meta<typeof EventCell>

export default meta
type Story = StoryObj<typeof meta>

export const TimeEvent: Story = {
  args: {
    title: 'Meeting',
    timeText: '10:00 - 11:00',
    viewType: 'timeGridDay',
    color: '#1ea7fd',
    start: '2023-01-01T10:00:00',
    end: '2023-01-01T11:00:00',
  },
}

export const DayEvent: Story = {
  args: {
    title: 'Meeting',
    viewType: 'timeGridDay',
    color: '#1ea7fd',
    start: '2023-01-01',
    end: '2023-01-02',
  },
}

export const DayGridMonthSameDay: Story = {
  args: {
    title: 'Meeting',
    timeText: '10:00 - 11:00',
    viewType: 'dayGridMonth',
    color: '#1ea7fd',
    start: '2023-01-01T10:00:00',
    end: '2023-01-01T11:00:00',
  },
}

export const DayGridMonthDifferentDay: Story = {
  args: {
    title: 'Meeting',
    timeText: '10:00 - 11:00',
    viewType: 'dayGridMonth',
    color: '#1ea7fd',
    start: '2023-01-01T10:00:00',
    end: '2023-01-02T11:00:00',
  },
}
