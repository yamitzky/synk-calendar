export type Event = {
  id: string | number
  start: string
  end: string
  title?: string | null
  location?: string | null
  people?: string[] | null
  description?: string | null
  calendarId?: string | null
}

export interface CalendarRepository {
  getEvents: (minDate: Date, maxDate: Date) => Promise<Event[]>
}
