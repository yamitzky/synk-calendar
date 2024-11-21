export type CalendarEvent = {
  id: string
  start: string
  end: string
  title?: string
  location?: string
  people?: string[]
  description?: string
  calendarId?: string
}

export interface CalendarRepository {
  getEvents: (minDate: Date, maxDate: Date) => Promise<CalendarEvent[]>
}
