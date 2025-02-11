import { CalendarRepository, config } from '@synk-cal/core'
import { GoogleCalendarRepository } from '@synk-cal/google'

export function getCalendarRepository(id: string): CalendarRepository {
  if (config.CALENDAR_PROVIDER === 'google') {
    return new GoogleCalendarRepository(id)
  }
  throw new Error(`Invalid calendar provider: ${config.CALENDAR_PROVIDER}`)
}
