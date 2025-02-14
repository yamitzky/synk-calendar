import type {
  CalendarRepository,
  GroupRepository,
  NotificationRepository,
  ReminderSettingsRepository,
} from '@synk-cal/core'
import { addHours, isSameMinute } from 'date-fns'
import { getRemindTargets } from './get_remind_targets'

type ProcessReminderParams = {
  baseTime: Date
  calendarRepositories: CalendarRepository[]
  groupRepository?: GroupRepository
  notificationRepositories: Record<string, NotificationRepository>
  reminderSettingsRepository: ReminderSettingsRepository
}

/**
 * Process reminders by sending notifications to users based on their reminder settings
 * Only sends notifications that match the current time
 *
 * Note: We fetch events for the next 48 hours to ensure we catch all potential reminders.
 * For example, if an event is scheduled for 2/15 23:59 and has a "day before at 10:00" reminder,
 * we need to send that reminder at 2/14 10:00.
 */
export async function processReminders({
  baseTime,
  calendarRepositories,
  groupRepository,
  notificationRepositories,
  reminderSettingsRepository,
}: ProcessReminderParams): Promise<void> {
  // Get reminder targets for the next 48 hours to ensure we catch all potential reminders
  const targets = await getRemindTargets({
    startDate: baseTime,
    endDate: addHours(baseTime, 48), // Get events up to 48 hours ahead
    calendarRepositories,
    groupRepository,
    reminderSettingsRepository,
  })

  // Filter targets that should be sent at the current time
  const currentTargets = targets.filter((target) => isSameMinute(target.sendAt, baseTime))

  // Send notifications for matching targets
  await Promise.all(
    currentTargets.map(async ({ notificationType, target, message }) => {
      const repository = notificationRepositories[notificationType]
      if (!repository) {
        console.error(`No notification repository found for type: ${notificationType}`)
        return
      }

      try {
        await repository.notify(target, message)
      } catch (e) {
        // suppress exception
        console.error(e)
      }
    }),
  )
}
