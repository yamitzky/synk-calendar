import type {
  CalendarRepository,
  GroupRepository,
  ReminderSetting,
  ReminderSettingsRepository,
} from '@synk-cal/core'
import { config } from '@synk-cal/core'
import { addDays, parseISO, subMinutes } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { Eta } from 'eta'
import { getEvents } from './get_events'

export const DEFAULT_TEMPLATE = `Reminder: "<%= it.title %>" starts <%= 
  it.minutesBefore !== undefined 
    ? \`in \${it.minutesBefore} minutes\` 
    : \`tomorrow at \${String(it.hour).padStart(2, '0')}:\${String(it.minute).padStart(2, '0')}\` 
%>.`

export const getReminderTime = (eventStart: Date, setting: ReminderSetting) => {
  const timezone = config.TIMEZONE

  if ('minutesBefore' in setting) {
    return subMinutes(eventStart, setting.minutesBefore)
  } else {
    // Get the date of the day before the event
    const reminderDateStr = formatInTimeZone(addDays(eventStart, -1), timezone, 'yyyy-MM-dd')
    // Set the specified time
    const reminderTimeStr = `${reminderDateStr}T${String(setting.hour).padStart(2, '0')}:${String(setting.minute).padStart(2, '0')}:00`
    // Convert to UTC considering timezone
    return fromZonedTime(reminderTimeStr, timezone)
  }
}

export type ReminderTarget = {
  sendAt: Date
  notificationType: string
  target: string
  message: string
}

type GetRemindTargetsParams = {
  startDate: Date
  endDate: Date
  calendarRepositories: CalendarRepository[]
  groupRepository?: GroupRepository
  reminderSettingsRepository: ReminderSettingsRepository
}

/**
 * Get a list of reminder targets based on calendar events and reminder settings
 * Returns all potential reminder targets within the specified date range
 */
export async function getRemindTargets({
  startDate,
  endDate,
  calendarRepositories,
  groupRepository,
  reminderSettingsRepository,
}: GetRemindTargetsParams): Promise<ReminderTarget[]> {
  const eta = new Eta()
  const targets: ReminderTarget[] = []
  const reminderSettingsCache = new Map<string, ReminderSetting[]>()

  // Get all events first
  const events = (
    await Promise.all(
      calendarRepositories.map((calendarRepository) =>
        getEvents({ calendarRepository, groupRepository, minDate: startDate, maxDate: endDate }),
      ),
    )
  ).flat()
  console.debug('Fetched events', events.map((e) => `${e.title} (${e.start})`).join('\n'))

  // Process each event
  for (const event of events) {
    const attendees = event.people?.filter((person) => person.email) ?? []
    if (attendees.length === 0) {
      continue
    }

    // Get reminder settings for each attendee
    for (const attendee of attendees) {
      if (!attendee.email) {
        continue
      }

      // Get settings from cache or fetch new ones
      let reminderSettings = reminderSettingsCache.get(attendee.email)
      if (!reminderSettings) {
        reminderSettings = await reminderSettingsRepository.getReminderSettings(attendee.email)
        reminderSettingsCache.set(attendee.email, reminderSettings)
      }

      if (reminderSettings.length === 0) {
        console.debug(`No reminder settings found for ${attendee.email}`)
        continue
      }

      // Check each reminder setting for the attendee
      for (const setting of reminderSettings) {
        const reminderTime = getReminderTime(parseISO(event.start), setting)
        const message = eta.renderString(config.REMINDER_TEMPLATE ?? DEFAULT_TEMPLATE, { ...setting, ...event })
        
        targets.push({
          sendAt: reminderTime,
          notificationType: setting.notificationType,
          target: attendee.email,
          message,
        })
      }
    }
  }

  return targets
}
