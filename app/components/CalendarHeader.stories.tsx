import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { CalendarHeader } from './CalendarHeader'

const meta = {
  component: CalendarHeader,
  tags: ['autodocs'],
  args: {
    onToday: fn(),
    onNext: fn(),
    onPrev: fn(),
    onChangeView: fn(),
  },
} satisfies Meta<typeof CalendarHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    todayLabel: 'Today',
    start: '2023-01-01',
    end: '2023-02-01',
    initialView: 'dayGridMonth',
  },
}

export const WeekView: Story = {
  args: {
    start: '2023-01-01',
    end: '2023-01-08',
    initialView: 'timeGridWeek',
  },
}

export const DayView: Story = {
  args: {
    start: '2023-01-01',
    end: '2023-01-02',
    initialView: 'timeGridDay',
  },
}
