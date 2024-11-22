import parse from 'html-react-parser'
import type { CalendarEvent } from '~/domain/calendar'

type Props = Pick<CalendarEvent, 'title' | 'start' | 'end' | 'description' | 'location' | 'people' | 'conference'>

export const EventDetail = ({ title, start, end, description, location, people, conference }: Props) => {
  return (
    <div className="space-y-2">
      <p className="font-bold text-lg">{title}</p>
      <p>{formatRange(start, end)}</p>
      {conference && (
        <p>
          <a href={conference.url} target="_blank" rel="noreferrer" className="">
            {conference.name}
          </a>
        </p>
      )}
      {location && <Location location={location} />}
      {people && (
        <div>
          {people.map((attendee) => (
            <p key={`${attendee.displayName}-${attendee.email}`}>
              {attendee.displayName} &lt;{attendee.email}&gt;
            </p>
          ))}
        </div>
      )}
      {description && <p>{parse(description)}</p>}
    </div>
  )
}

const Location = ({ location }: { location: string }) => {
  let innerContent: React.ReactNode = location
  if (location.startsWith('https://') || location.startsWith('http://')) {
    const domain = new URL(location).hostname
    innerContent = (
      <a href={location} target="_blank" rel="noreferrer">
        {domain}
      </a>
    )
  }
  return <p className="overflow-ellipsis whitespace-nowrap overflow-x-hidden">{innerContent}</p>
}

function formatRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const format = new Intl.DateTimeFormat('ja', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  })
  return format.formatRange(startDate, endDate)
}
