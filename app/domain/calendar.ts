export type ResponseStatus = 'accepted' | 'declined' | 'needsAction' | 'tentative'
export type CalendarEvent = {
  id: string
  start: string
  end: string
  title?: string
  location?: string
  conference?: {
    name: string
    url: string
  }
  people?: Array<{
    email?: string
    displayName?: string
    responseStatus?: ResponseStatus
    organizer: boolean
  }>
  description?: string
  calendarId?: string
}

export interface CalendarRepository {
  getEvents: (minDate: Date, maxDate: Date) => Promise<CalendarEvent[]>
}
