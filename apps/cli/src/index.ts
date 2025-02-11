import type { NotificationRepository } from '@synk-cal/core'
import { config } from '@synk-cal/core'
import { GoogleCalendarRepository } from '@synk-cal/google'
import {
  ConsoleNotificationRepository,
  GlobalReminderSettingsRepository,
  WebhookNotificationRepository,
} from '@synk-cal/repository'
import { processReminders } from '@synk-cal/usecase'
import { parseISO } from 'date-fns'

async function main() {
  /**
   * Usage:
   * pnpm start <base-time>
   *
   * Example:
   * pnpm start 2023-06-01T10:00:00Z
   *
   * This is a sample implementation of the reminder functionality.
   * To use the feature, you need to periodically call this CLI or deploy a serverless function
   * that calls `processReminders` periodically.
   */
  const args = process.argv.slice(2)
  const baseTimeArg = args[0]
  if (!baseTimeArg) {
    console.error('Usage: pnpm start <base-time>')
    process.exit(1)
  }

  const baseTime = parseISO(baseTimeArg)

  const reminderSettingsRepository = new GlobalReminderSettingsRepository()
  const calendarRepositories = config.CALENDAR_IDS.map((id) => new GoogleCalendarRepository(id))
  const notificationRepositories: Record<string, NotificationRepository> = {
    console: new ConsoleNotificationRepository(),
  }
  if (config.WEBHOOK_URL) {
    notificationRepositories.webhook = new WebhookNotificationRepository(config.WEBHOOK_URL)
  }
  await processReminders(baseTime, calendarRepositories, notificationRepositories, reminderSettingsRepository)
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
