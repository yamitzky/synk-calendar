import type { CalendarRepository, NotificationRepository, ReminderSetting } from '@synk-cal/core'
import { config } from '@synk-cal/core'
import { addMinutes, isSameMinute, parseISO, subMinutes } from 'date-fns'
import { Eta } from 'eta'

const DEFAULT_TEMPLATE = 'Reminder: "<%= it.title %>" starts in <%= it.minutesBefore %> minutes.'

export async function processReminders(
  baseTime: Date,
  calendarRepositories: CalendarRepository[],
  notificationRepositories: Record<string, NotificationRepository>,
): Promise<void> {
  const reminderSettings: ReminderSetting[] = config.REMINDER_SETTINGS
  const eta = new Eta()

  if (!reminderSettings.length) {
    console.warn('No reminder settings found')
    return
  }

  const minTime = addMinutes(baseTime, Math.min(...reminderSettings.map((setting) => setting.minutesBefore)))
  const maxTime = addMinutes(baseTime, Math.max(...reminderSettings.map((setting) => setting.minutesBefore)) + 1)

  const events = (
    await Promise.all(calendarRepositories.map((calendarRepository) => calendarRepository.getEvents(minTime, maxTime)))
  ).flat()
  console.debug('Fetched events', events.map((e) => `${e.title} (${e.start})`).join('\n'))

  const notifications: Array<{ repository: NotificationRepository; target: string; message: string }> = []

  for (const event of events) {
    for (const setting of reminderSettings) {
      const notificationRepository = notificationRepositories[setting.notificationType]
      if (!notificationRepository) {
        console.error(`No notification repository found for type: ${setting.notificationType}`)
        continue
      }
      const reminderTime = subMinutes(parseISO(event.start), setting.minutesBefore)
      if (!isSameMinute(reminderTime, baseTime)) {
        console.debug(`Event "${event.title}" is not within ${setting.minutesBefore} minutes of ${baseTime}`)
        continue
      }

      const message = eta.renderString(config.REMINDER_TEMPLATE ?? DEFAULT_TEMPLATE, { ...setting, ...event })

      if (setting.target) {
        const isAttendee = event.people?.some((person) => person.email === setting.target)
        if (isAttendee) {
          notifications.push({ repository: notificationRepository, target: setting.target, message })
        } else {
          console.debug(`Event "${event.title}" is not for ${setting.target}`)
        }
      } else {
        for (const attendee of event.people || []) {
          if (attendee.email) {
            notifications.push({ repository: notificationRepository, target: attendee.email, message })
          }
        }
      }
    }
  }

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
