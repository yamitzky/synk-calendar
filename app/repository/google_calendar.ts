import { type calendar_v3, google } from 'googleapis'
import { config } from '~/config'
import type { CalendarEvent, CalendarRepository, ResponseStatus } from '~/domain/calendar'

let calendarClient: calendar_v3.Calendar | null = null

export class GoogleCalendarRepository implements CalendarRepository {
  calendarId: string

  constructor(calendarId: string) {
    this.calendarId = calendarId
  }

  async getCalendarClient() {
    if (calendarClient) {
      return calendarClient
    }

    // Google Calendar API setup
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })

    const authClient = await auth.getClient()
    // @ts-expect-error
    if (!authClient.subject) {
      // @ts-expect-error
      authClient.subject = config.GOOGLE_AUTH_SUBJECT
    }
    // @ts-expect-error
    calendarClient = google.calendar({ version: 'v3', auth: authClient })

    return calendarClient
  }

  async getEvents(minDate: Date, maxDate: Date): Promise<CalendarEvent[]> {
    console.debug(`Fetching events from Google Calendar: ${this.calendarId} from ${minDate} to ${maxDate}`)

    const calendar = await this.getCalendarClient()

    const response = await calendar.events.list({
      calendarId: this.calendarId,
      timeMin: minDate.toISOString(),
      timeMax: maxDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500,
    })

    const events = response.data.items || []

    return events
      .map((event) => {
        const videoUrl = event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri
        const conferenceName = event.conferenceData?.conferenceSolution?.name
        return {
          id: event.id ?? '',
          start: event.start?.dateTime ?? event.start?.date ?? '',
          end: event.end?.dateTime ?? event.end?.date ?? '',
          title: event.summary ?? undefined,
          location: event.location ?? undefined,
          conference: videoUrl && conferenceName ? { name: conferenceName, url: videoUrl } : undefined,
          people:
            event.attendees?.map((attendee) => ({
              email: attendee.email ?? undefined,
              displayName: attendee.displayName ?? undefined,
              responseStatus: attendee.responseStatus as ResponseStatus,
              organizer: attendee.organizer ?? false,
            })) || [],
          description: event.description ?? undefined,
          calendarId: this.calendarId,
        }
      })
      .filter((event) => event.id && event.start && event.end)
  }
}
