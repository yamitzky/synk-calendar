import parse from 'html-react-parser'
import { twMerge } from 'tailwind-merge'
import type { CalendarEvent } from '~/domain/calendar'
import useLocale from '~/hooks/useLocale'

type Props = {
  className?: string
} & Pick<CalendarEvent, 'title' | 'start' | 'end' | 'description' | 'location' | 'people' | 'conference'>

export const EventDetail = ({ title, start, end, description, location, people, conference, className }: Props) => {
  const locale = useLocale()
  return (
    <div className={twMerge('space-y-2', className)}>
      <p className="font-bold text-lg">{title}</p>
      <p>{formatRange(locale, start, end)}</p>
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

function formatRange(locale: string | undefined, start: string | null, end: string | null): string {
  const format = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  })

  if (start && end) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return format.formatRange(startDate, endDate)
  }
  if (start) {
    const startDate = new Date(start)
    return format.format(startDate)
  }
  return ''
}
