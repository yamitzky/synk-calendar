import { parseISO } from 'date-fns'
import { config } from '~/config'
import type { NotificationRepository } from '~/domain/notification'
import { ConsoleNotificationRepository } from '~/repository/console_notification'
import { GoogleCalendarRepository } from '~/repository/google_calendar'
import { WebhookNotificationRepository } from '~/repository/webhook_notification'
import { processReminders } from '~/usecase/process_reminders'

async function main() {
  /**
   * Usage:
   * pnpm reminder <base-time>
   *
   * Example:
   * pnpm reminder 2023-06-01T10:00:00Z
   *
   * This is a sample implementation of the reminder functionality.
   * To use the feature, you need to periodically call this CLI or deploy a serverless function
   * that calls `processReminders` periodically.
   */
  const args = process.argv.slice(2)
  const baseTimeArg = args[0]
  if (!baseTimeArg) {
    console.error('Usage: pnpm reminder <base-time>')
    process.exit(1)
  }

  const baseTime = parseISO(baseTimeArg)

  const calendarRepositories = config.CALENDAR_IDS.map((id) => new GoogleCalendarRepository(id))
  const notificationRepositories: Record<string, NotificationRepository> = {
    console: new ConsoleNotificationRepository(),
  }
  if (config.WEBHOOK_URL) {
    notificationRepositories.webhook = new WebhookNotificationRepository(config.WEBHOOK_URL)
  }
  await processReminders(baseTime, calendarRepositories, notificationRepositories)
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
