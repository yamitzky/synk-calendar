import type { MetaFunction } from '@remix-run/node'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { isRouteErrorResponse, useLoaderData, useNavigate, useRouteError } from '@remix-run/react'
import { config } from '@synk-cal/core'
import { GoogleCalendarRepository } from '@synk-cal/repository'
import { addDays, format, parseISO, startOfWeek, subDays } from 'date-fns'
import { Calendar } from '~/components/Calendar'
import { ErrorMessage } from '~/components/ErrorMessage'

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

  const isMobile = request.headers.get('user-agent')?.includes('Mobile/') ?? false

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
    isMobile,
    startDate: startDateStr,
    endDate: endDateStr,
  })
}

export default function Index() {
  const { calendars, startDate, isMobile } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <div className="h-screen w-full p-4">
      <Calendar
        calendars={calendars}
        initialDate={startDate}
        initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
        onChangeDate={(startDate, endDate) => {
          navigate({ search: `startDate=${startDate}&endDate=${endDate}` }, { replace: true })
        }}
      />
    </div>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return <ErrorMessage title={`${error.status} ${error.statusText}`} message={error.data} />
  }
  if (error instanceof Error) {
    return <ErrorMessage title="Error" message={error.message} />
  }
  return <ErrorMessage title="Unknown Error" />
}
