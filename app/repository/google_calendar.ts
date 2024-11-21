import { type calendar_v3, google } from 'googleapis'
import { config } from '~/config'
import type { CalendarEvent, CalendarRepository } from '~/domain/calendar'

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
    authClient.subject = config.GOOGLE_AUTH_SUBJECT
    // @ts-expect-error
    calendarClient = google.calendar({ version: 'v3', auth: authClient })

    return calendarClient
  }

  async getEvents(minDate: Date, maxDate: Date): Promise<CalendarEvent[]> {
    const calendar = await this.getCalendarClient()

    const response = await calendar.events.list({
      calendarId: this.calendarId,
      timeMin: minDate.toISOString(),
      timeMax: maxDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items || []

    return events
      .map((event) => ({
        id: event.id ?? '',
        start: event.start?.dateTime ?? event.start?.date ?? '',
        end: event.end?.dateTime ?? event.end?.date ?? '',
        title: event.summary ?? undefined,
        location: event.location ?? undefined,
        people: event.attendees?.map((a) => a.displayName || a.email || a.id || 'unknown user') || [],
        description: event.description ?? undefined,
        calendarId: this.calendarId,
      }))
      .filter((event) => event.id && event.start && event.end)
  }
}
