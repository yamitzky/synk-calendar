import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventDetail } from './EventDetail'

describe('EventDetail', () => {
  it('renders correctly with all props', () => {
    const { container } = render(
      <EventDetail
        title="Test Event"
        start="2023-05-01T10:00:00"
        end="2023-05-01T11:00:00"
        description="This is a test event"
        location="Test Location"
        people={[{ displayName: 'John Doe', email: 'john@example.com', organizer: false }]}
        conference={{ name: 'Zoom Meeting', url: 'https://zoom.us/j/123456789' }}
      />,
    )

    expect(container).toMatchSnapshot()
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('renders correctly with minimal props', () => {
    const { container } = render(
      <EventDetail title="Minimal Event" start="2023-05-01T10:00:00" end="2023-05-01T11:00:00" />,
    )

    expect(container).toMatchSnapshot()
    expect(screen.getByText('Minimal Event')).toBeInTheDocument()
  })

  it('renders location as a link when it is a URL', () => {
    const { container } = render(
      <EventDetail
        title="URL Event"
        start="2023-05-01T10:00:00"
        end="2023-05-01T11:00:00"
        location="https://example.com"
      />,
    )

    const locationLink = screen.getByText('example.com')
    expect(locationLink).toHaveAttribute('href', 'https://example.com')
    expect(container).toMatchSnapshot()
  })
})
