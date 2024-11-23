import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { addDays, addHours, addMinutes, format, set, subDays } from 'date-fns'
import type { CalendarEvent } from '~/domain/calendar'
import { Calendar } from './Calendar'

const meta = {
  component: Calendar,
  tags: ['autodocs'],
  args: {
    onChangeDate: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

const now = new Date().toISOString()
const oneHourLater = addHours(now, 1).toISOString()
const tonight = set(now, { hours: 22, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString()
const tomorrowMorning = set(addDays(now, 1), { hours: 8, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString()

const today = format(now, 'yyyy-MM-dd')
const yesterday = format(subDays(today, 1), 'yyyy-MM-dd')
const nextWeek = format(addDays(today, 7), 'yyyy-MM-dd')
const threeDaysAfterNextWeek = format(addDays(today, 10), 'yyyy-MM-dd')

const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: now,
    end: oneHourLater,
    description: 'Discussing project progress',
    location: 'Meeting Room A',
    conference: {
      name: 'Zoom Meeting',
      url: 'https://zoom.us/j/1234567890',
    },
    people: [
      { displayName: 'John Doe', email: 'john@example.com', organizer: true },
      { displayName: 'Jane Smith', email: 'jane@example.com', organizer: false },
    ],
  },
  {
    id: '2',
    title: 'All Night Event',
    start: tonight,
    end: tomorrowMorning,
    description: 'Special event for the night',
    location: 'Club 143',
    people: [
      { displayName: 'Alice Johnson', email: 'alice@example.com', organizer: true },
      { displayName: 'Bob Brown', email: 'bob@example.com', organizer: false },
    ],
  },
  {
    id: '3',
    title: 'Deadline: Expense Reimbursement',
    start: yesterday,
    end: today, // exclusive
    description: 'Deadline for expense reimbursement. Please submit your expenses by the due date.',
    people: [
      { displayName: 'Charlie Davis', email: 'charlie@example.com', organizer: true },
      { displayName: 'Diana Evans', email: 'diana@example.com', organizer: false },
    ],
  },
  {
    id: '4',
    title: 'The FYI Conference',
    start: nextWeek,
    end: threeDaysAfterNextWeek,
    description: 'A large conference spanning three days.',
    location: 'Conference Center',
    people: [
      { displayName: 'Eve Frank', email: 'eve@example.com', organizer: true },
      { displayName: 'Frank Garcia', email: 'frank@example.com', organizer: false },
    ],
  },
]

export const Default: Story = {
  args: {
    calendars: [
      {
        calendarId: 'primary',
        events: sampleEvents,
      },
    ],
  },
}

export const MonthView: Story = {
  args: {
    ...Default.args,
    initialView: 'dayGridMonth',
  },
}

export const WeekView: Story = {
  args: {
    ...Default.args,
    initialView: 'timeGridWeek',
  },
}

export const DayView: Story = {
  args: {
    ...Default.args,
    initialView: 'timeGridDay',
  },
}

export const FourDayView: Story = {
  args: {
    ...Default.args,
    initialView: 'timeGridFourDay',
  },
}

export const MultipleCalendars: Story = {
  args: {
    calendars: [
      {
        calendarId: 'work',
        events: sampleEvents,
      },
      {
        calendarId: 'personal',
        events: [
          {
            id: 'personal-1',
            title: 'Gym Session',
            start: set(today, { hours: 8 }).toISOString(),
            end: set(today, { hours: 9 }).toISOString(),
            description: 'Weekly workout',
            location: 'Local Gym',
          },
        ],
      },
      ...Array.from({ length: 10 }).map((_, i) => ({
        calendarId: `team-${i}`,
        events: [
          {
            id: `team-${i}`,
            title: `Team #${i} Lunch`,
            start: set(now, { hours: 12 }).toISOString(),
            end: set(now, { hours: 13 }).toISOString(),
            location: `Restaurant #${i}`,
          },
        ],
      })),
    ],
    initialDate: today,
    initialView: 'timeGridDay',
  },
}

export const OverlappingEvents: Story = {
  args: {
    calendars: [
      {
        calendarId: 'personal',
        events: Array.from({ length: 10 }).map((_, i) => ({
          id: `personal-${i}`,
          title: `Gym Session ${i}`,
          start: addMinutes(now, 15 * i).toISOString(),
          end: addHours(addMinutes(now, 15 * i), 1).toISOString(),
          description: 'Weekly workout',
          location: 'Local Gym',
        })),
      },
    ],
    initialDate: today,
    initialView: 'timeGridFourDay',
  },
}
