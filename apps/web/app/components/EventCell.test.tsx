import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventCell } from './EventCell'

describe('EventCell', () => {
  it('aaaaa', () => {
    expect('asasfa').toMatchSnapshot()
  })
  it('renders correctly for dayGridMonth view', () => {
    render(
      <EventCell
        title="Test Event"
        timeText="10:00"
        viewType="dayGridMonth"
        color="#053B48"
        start="2023-05-01T10:00:00"
        end="2023-05-01T11:00:00"
      />,
    )
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('renders correctly for timeGrid view', () => {
    render(
      <EventCell
        title="Test Event"
        timeText="10:00 - 11:00"
        viewType="timeGridDay"
        color="#053B48"
        start="2023-05-01T10:00:00"
        end="2023-05-01T11:00:00"
      />,
    )
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument()
  })

  it('displays dot for same day events in dayGridMonth view', () => {
    const { container } = render(
      <EventCell
        title="Test Event"
        viewType="dayGridMonth"
        color="#053B48"
        start="2023-05-01T10:00:00"
        end="2023-05-01T11:00:00"
      />,
    )
    expect(container.querySelector('.rounded-full')).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { container } = render(
      <EventCell
        title="Test Event"
        timeText="10:00 - 11:00"
        viewType="timeGridDay"
        color="#053B48"
        start="2023-05-01T10:00:00"
        end="2023-05-01T11:00:00"
      />,
    )
    expect(container).toMatchSnapshot()
  })
})
