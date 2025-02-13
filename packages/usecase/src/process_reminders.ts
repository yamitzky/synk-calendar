import type {
  CalendarRepository,
  GroupRepository,
  NotificationRepository,
  ReminderSetting,
  ReminderSettingsRepository,
} from '@synk-cal/core'
import { config } from '@synk-cal/core'
import { addDays, isSameMinute, parseISO, subMinutes } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { Eta } from 'eta'
import { getEvents } from './get_events'

const DEFAULT_TEMPLATE = `Reminder: "<%= it.title %>" starts <%= 
  it.minutesBefore !== undefined 
    ? \`in \${it.minutesBefore} minutes\` 
    : \`tomorrow at \${String(it.hour).padStart(2, '0')}:\${String(it.minute).padStart(2, '0')}\` 
%>.`

const getReminderTime = (eventStart: Date, setting: ReminderSetting) => {
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

type ProcessReminderParams = {
  baseTime: Date
  calendarRepositories: CalendarRepository[]
  groupRepository?: GroupRepository
  notificationRepositories: Record<string, NotificationRepository>
  reminderSettingsRepository: ReminderSettingsRepository
}

export async function processReminders({
  baseTime,
  calendarRepositories,
  groupRepository,
  notificationRepositories,
  reminderSettingsRepository,
}: ProcessReminderParams): Promise<void> {
  const eta = new Eta()

  // Get all events first
  const events = (
    await Promise.all(
      calendarRepositories.map((calendarRepository) =>
        // FIXME: consider reminder settings
        getEvents({ calendarRepository, groupRepository, minDate: baseTime, maxDate: addDays(baseTime, 1) }),
      ),
    )
  ).flat()
  console.debug('Fetched events', events.map((e) => `${e.title} (${e.start})`).join('\n'))

  const notifications: Array<{ repository: NotificationRepository; target: string; message: string }> = []
  const reminderSettingsCache = new Map<string, ReminderSetting[]>()

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
        const notificationRepository = notificationRepositories[setting.notificationType]
        if (!notificationRepository) {
          console.error(`No notification repository found for type: ${setting.notificationType}`)
          continue
        }

        const reminderTime = getReminderTime(parseISO(event.start), setting)
        const isTimeMatch = isSameMinute(reminderTime, baseTime)
        if (!isTimeMatch) {
          console.debug(
            `Event "${event.title}" reminder time ${reminderTime} does not match current time ${baseTime} for ${attendee.email}`,
          )
          continue
        }

        const message = eta.renderString(config.REMINDER_TEMPLATE ?? DEFAULT_TEMPLATE, { ...setting, ...event })
        notifications.push({ repository: notificationRepository, target: attendee.email, message })
      }
    }
  }

  // Send all notifications
  await Promise.all(
    notifications.map(async ({ repository, target, message }) => {
      try {
        await repository.notify(target, message)
      } catch (e) {
        // suppress exception
        console.error(e)
      }
    }),
  )
}
