import type { MetaFunction } from '@remix-run/node'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { addDays, parseISO, startOfWeek, subDays } from 'date-fns'
import { config } from '~/config'
import { GoogleCalendarRepository } from '~/repository/google_calendar'

export const meta: MetaFunction = () => {
  return [{ title: 'Synk Calendar' }, { name: 'description', content: 'Calendar viewer' }]
}

function getStartDate(searchParams: URLSearchParams) {
  const startDate = searchParams.get('startDate')
  if (startDate) {
    return parseISO(startDate)
  }
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const startDate = getStartDate(url.searchParams)

  // 前の週から次の週まで
  const minDate = subDays(startDate, 7)
  const maxDate = addDays(startDate, 13)

  try {
    const calendars = config.CALENDAR_IDS.map((id) => new GoogleCalendarRepository(id))
    const calendarEvents = await Promise.all(calendars.map((calendar) => calendar.getEvents(minDate, maxDate)))
    const events = calendarEvents.flat()
    return json({ events, error: null })
  } catch (error) {
    console.error('Error fetching events:', error)
    return json({ events: null, error })
  }
}

export default function Index() {
  const { events, error } = useLoaderData<typeof loader>()
  return (
    <div>
      {events?.map((event) => (
        <div key={event.id}>
          <div>{event.title}</div>
          <div>{event.start}</div>
          <div>{event.end}</div>
        </div>
      ))}
    </div>
  )
}
