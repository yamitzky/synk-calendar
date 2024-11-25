import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Calendar } from './Calendar'

// vi.mock('@fullcalendar/react', () => ({
//   default: vi.fn(() => null),
// }))

describe('Calendar', () => {
  const mockCalendars = [
    {
      calendarId: 'calendar1',
      events: [
        {
          id: 'event1',
          title: 'Test Event',
          start: '2023-05-01T10:00:00',
          end: '2023-05-01T11:00:00',
        },
      ],
    },
    {
      calendarId: 'calendar2',
      events: [
        {
          id: 'event2',
          title: 'Test Event 2',
          start: '2023-05-02T10:00:00',
          end: '2023-05-02T11:00:00',
        },
      ],
    },
  ]
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders correctly with timeGridDay view', () => {
    vi.setSystemTime(new Date('2023-05-01'))
    const { container } = render(<Calendar calendars={mockCalendars} initialView="timeGridDay" />)
    expect(container).toMatchSnapshot()
  })

  it('renders correctly with dayGridMonth view', () => {
    vi.setSystemTime(new Date('2023-05-01'))
    const { container } = render(<Calendar calendars={mockCalendars} initialView="dayGridMonth" />)
    expect(container).toMatchSnapshot()
  })

  it('renders correctly with timeGridFourDay view', () => {
    vi.setSystemTime(new Date('2023-05-01'))
    const { container } = render(<Calendar calendars={mockCalendars} initialView="timeGridFourDay" />)
    expect(container).toMatchSnapshot()
  })

  it('renders correctly with timeGridWeek view', () => {
    vi.setSystemTime(new Date('2023-05-01'))
    const { container } = render(<Calendar calendars={mockCalendars} initialView="timeGridWeek" />)
    expect(container).toMatchSnapshot()
  })

  it('uses initialDate when provided', () => {
    vi.setSystemTime(new Date('2023-05-01'))
    const { container } = render(
      <Calendar calendars={mockCalendars} initialView="timeGridDay" initialDate="2022-01-01" />,
    )
    expect(container).toMatchSnapshot()
    expect(screen.getByText('2022年1月1日')).toBeInTheDocument()
  })

  it('calls onChangeDate when dates are set', () => {
    vi.setSystemTime(new Date('2023-05-01'))
    const onChangeDate = vi.fn()
    render(
      <Calendar
        calendars={mockCalendars}
        onChangeDate={onChangeDate}
        initialDate="2024-04-01"
        initialView="timeGridDay"
      />,
    )

    // not calls on initial render
    expect(onChangeDate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Next'))
    expect(onChangeDate).toHaveBeenCalledWith('2024-04-02', '2024-04-03')
  })
})
