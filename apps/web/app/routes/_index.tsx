import type { MetaFunction } from '@remix-run/node'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { type User, config } from '@synk-cal/core'
import { GoogleCalendarRepository } from '@synk-cal/repository'
import { addDays, format, parseISO, startOfWeek, subDays } from 'date-fns'
import metadata from 'gcp-metadata'
import { OAuth2Client } from 'google-auth-library'
import { Calendar } from '~/components/Calendar'

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

const oAuth2Client = new OAuth2Client()

// Cache externally fetched information for future invocations
let _aud = ''

async function audience(): Promise<string> {
  if (!_aud && (await metadata.isAvailable())) {
    const project_number = await metadata.project('numeric-project-id')
    const project_id = await metadata.project('project-id')

    _aud = `/projects/${project_number}/apps/${project_id}`
  }

  return _aud
}

async function validateAssertion(assertion: string | null) {
  if (!assertion) {
    return {}
  }

  const aud = await audience()

  const response = await oAuth2Client.getIapPublicKeys()
  const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(assertion, response.pubkeys, aud, [
    'https://cloud.google.com/iap',
  ])
  const payload = ticket.getPayload()

  return {
    email: payload?.email,
    sub: payload?.sub,
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)

  const isMobile = request.headers.get('user-agent')?.includes('Mobile/') ?? false

  // Verify IAP JWT and get user info
  const assertion = request.headers.get('x-goog-iap-jwt-assertion')
  let user: User | undefined = undefined
  try {
    const info = await validateAssertion(assertion)
    if (info.email) {
      user = { email: info.email }
    }
  } catch (error) {
    console.log(error)
  }

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
    user,
  })
}

export default function Index() {
  const { calendars, startDate, isMobile, user } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <div className="h-screen w-full p-4">
      <Calendar
        calendars={calendars}
        initialDate={startDate}
        initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
        user={user}
        onChangeDate={(startDate, endDate) => {
          navigate({ search: `startDate=${startDate}&endDate=${endDate}` }, { replace: true })
        }}
      />
    </div>
  )
}
