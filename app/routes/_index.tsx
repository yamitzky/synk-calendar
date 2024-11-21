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

  const repositories = config.CALENDAR_IDS.map((id) => new GoogleCalendarRepository(id))
  const calendars = await Promise.all(
    repositories.map(async (calendar) => ({
      calendarId: calendar.calendarId,
      events: await calendar.getEvents(minDate, maxDate),
    })),
  )
  return json({
    calendars,
    startDate: startDateStr,
    endDate: endDateStr,
  })
}

export default function Index() {
  const { calendars, startDate } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <div className="h-screen w-full p-4">
      <Calendar
        calendars={calendars}
        initialDate={startDate}
        onChangeDate={(startDate, endDate) => {
          navigate({ search: `startDate=${startDate}&endDate=${endDate}` }, { replace: true })
        }}
      />
    </div>
  )
}
