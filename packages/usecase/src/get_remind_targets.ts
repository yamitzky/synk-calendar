import type { CalendarRepository, GroupRepository, ReminderSetting, ReminderSettingsRepository } from '@synk-cal/core'
import { config } from '@synk-cal/core'
import { parseISO, setHours, setMinutes, subDays, subMinutes } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { Eta } from 'eta'
import { getEvents } from './get_events'

export const DEFAULT_TEMPLATE = `Reminder: "<%= it.title %>" starts <%= 
  it.minutesBefore !== undefined 
    ? \`in \${it.minutesBefore} minutes\` 
    : \`tomorrow at \${new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: it.timezone }).format(new Date(it.start))}\` 
%>.`

export const getReminderTime = (eventStart: Date, setting: ReminderSetting) => {
  if ('minutesBefore' in setting) {
    return subMinutes(eventStart, setting.minutesBefore)
  } else {
    const zonedDate = toZonedTime(eventStart, config.TIMEZONE)
    const previousDay = subDays(zonedDate, 1)
    const previousDayAt = setMinutes(setHours(previousDay, setting.hour), setting.minute)
    return fromZonedTime(previousDayAt, config.TIMEZONE)
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
  userEmail?: string // Optional: If provided, only return reminders for this user
}

/**
 * Get a list of reminder targets based on calendar events and reminder settings
 * If userEmail is provided, only returns reminders for that specific user
 */
export async function getRemindTargets({
  startDate,
  endDate,
  calendarRepositories,
  groupRepository,
  reminderSettingsRepository,
  userEmail,
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

    // If userEmail is provided, only process that user's reminders
    const targetAttendees = userEmail ? attendees.filter((person) => person.email === userEmail) : attendees

    // Get reminder settings for each attendee
    for (const attendee of targetAttendees) {
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
        const message = eta.renderString(config.REMINDER_TEMPLATE ?? DEFAULT_TEMPLATE, {
          ...setting,
          ...event,
          timezone: config.TIMEZONE,
        })

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
