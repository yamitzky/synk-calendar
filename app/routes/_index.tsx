import type { MetaFunction } from '@remix-run/node'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { addDays, format, parseISO, startOfWeek, subDays } from 'date-fns'
import { Calendar } from '~/components/Calendar'
import { config } from '~/config'
import { GoogleCalendarRepository } from '~/repository/google_calendar'

export const meta: MetaFunction = () => {
  return [{ title: 'Synk Calendar' }, { name: 'description', content: 'Calendar viewer' }]
}

function getDateRange(searchParams: URLSearchParams) {
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')

  const startDate = startDateParam ? parseISO(startDateParam) : startOfWeek(new Date(), { weekStartsOn: 1 })
  const endDate = endDateParam ? parseISO(endDateParam) : addDays(startDate, 7)
  return { startDate, endDate }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const { startDate, endDate } = getDateRange(url.searchParams)
  const startDateStr = format(startDate, 'yyyy-MM-dd')
  const endDateStr = format(endDate, 'yyyy-MM-dd')

  // バッファーを持って、前の週から次の週まで
  const minDate = subDays(startDate, 7)
  const maxDate = addDays(endDate, 7)

  try {
    const calendars = config.CALENDAR_IDS.map((id) => new GoogleCalendarRepository(id))
    const calendarEvents = await Promise.all(calendars.map((calendar) => calendar.getEvents(minDate, maxDate)))
    const events = calendarEvents.flat()
    return json({
      events,
      error: null,
      startDate: startDateStr,
      endDate: endDateStr,
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return json({ events: null, error, startDate: startDateStr, endDate: endDateStr })
  }
}

export default function Index() {
  const { events, error, startDate } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <div className="h-screen w-full p-4">
      <Calendar
        events={events ?? []}
        initialDate={startDate}
        onChangeDate={(startDate, endDate) => {
          navigate({ search: `startDate=${startDate}&endDate=${endDate}` }, { replace: true })
        }}
      />
    </div>
  )
}
