import type { CalendarRepository, NotificationRepository, ReminderSettingsRepository } from '@synk-cal/core'
import { config } from '@synk-cal/core'
import { addMinutes, isSameMinute, parseISO, subMinutes } from 'date-fns'
import { Eta } from 'eta'

const DEFAULT_TEMPLATE = 'Reminder: "<%= it.title %>" starts in <%= it.minutesBefore %> minutes.'

export async function processReminders(
  baseTime: Date,
  calendarRepositories: CalendarRepository[],
  notificationRepositories: Record<string, NotificationRepository>,
  reminderSettingsRepository: ReminderSettingsRepository,
): Promise<void> {
  const eta = new Eta()

  // Get all events first
  const maxMinutesBefore = Math.max(...config.REMINDER_MINUTES_BEFORE_OPTIONS)
  const events = (
    await Promise.all(
      calendarRepositories.map((calendarRepository) =>
        calendarRepository.getEvents(baseTime, addMinutes(baseTime, maxMinutesBefore)),
      ),
    )
  ).flat()
  console.debug('Fetched events', events.map((e) => `${e.title} (${e.start})`).join('\n'))

  const notifications: Array<{ repository: NotificationRepository; target: string; message: string }> = []
  const reminderSettingsCache = new Map<string, Array<{ minutesBefore: number; notificationType: string }>>()

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
        // Skip if minutesBefore is not in the allowed options
        if (!config.REMINDER_MINUTES_BEFORE_OPTIONS.includes(setting.minutesBefore)) {
          console.debug(`Invalid minutesBefore value: ${setting.minutesBefore} for ${attendee.email}`)
          continue
        }

        const notificationRepository = notificationRepositories[setting.notificationType]
        if (!notificationRepository) {
          console.error(`No notification repository found for type: ${setting.notificationType}`)
          continue
        }

        const reminderTime = subMinutes(parseISO(event.start), setting.minutesBefore)
        if (!isSameMinute(reminderTime, baseTime)) {
          console.debug(
            `Event "${event.title}" is not within ${setting.minutesBefore} minutes of ${baseTime} for ${attendee.email}`,
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
