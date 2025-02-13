import type {
  CalendarRepository,
  NotificationRepository,
  ReminderSettingsRepository,
  ReminderTiming,
} from '@synk-cal/core'
import { config } from '@synk-cal/core'
import { addDays, isSameHour, isSameMinute, parseISO, setHours, setMinutes, subMinutes } from 'date-fns'
import { Eta } from 'eta'

const DEFAULT_TEMPLATE = `Reminder: "<%= it.title %>" starts <%= 
  it.minutesBefore !== undefined 
    ? \`in \${it.minutesBefore} minutes\` 
    : \`tomorrow at \${String(it.hour).padStart(2, '0')}:\${String(it.minute).padStart(2, '0')}\` 
%>.`

const getReminderTime = (eventStart: Date, setting: ReminderTiming) => {
  if ('minutesBefore' in setting) {
    return subMinutes(eventStart, setting.minutesBefore)
  } else {
    return setMinutes(setHours(addDays(eventStart, -1), setting.hour), setting.minute)
  }
}

export async function processReminders(
  baseTime: Date,
  calendarRepositories: CalendarRepository[],
  notificationRepositories: Record<string, NotificationRepository>,
  reminderSettingsRepository: ReminderSettingsRepository,
): Promise<void> {
  const eta = new Eta()

  // Get all events first
  const events = (
    await Promise.all(
      calendarRepositories.map((calendarRepository) => calendarRepository.getEvents(baseTime, addDays(baseTime, 1))),
    )
  ).flat()
  console.debug('Fetched events', events.map((e) => `${e.title} (${e.start})`).join('\n'))

  const notifications: Array<{ repository: NotificationRepository; target: string; message: string }> = []
  const reminderSettingsCache = new Map<string, Array<ReminderTiming & { notificationType: string }>>()

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
        const isTimeMatch =
          'minutesBefore' in setting
            ? isSameMinute(reminderTime, baseTime)
            : isSameHour(baseTime, setHours(baseTime, setting.hour)) &&
              isSameMinute(baseTime, setMinutes(setHours(baseTime, setting.hour), setting.minute))
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
