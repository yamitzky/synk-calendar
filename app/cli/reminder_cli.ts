import { parseISO } from 'date-fns'
import { config } from '~/config'
import { ConsoleNotificationRepository } from '~/repository/console_notification'
import { GoogleCalendarRepository } from '~/repository/google_calendar'
import { WebhookNotificationRepository } from '~/repository/webhook_notification'
import { processReminders } from '~/usecase/process_reminders'

async function main() {
  const args = process.argv.slice(2)
  const baseTimeArg = args[0]
  if (!baseTimeArg) {
    console.error('Usage: pnpm reminder <base-time>')
    process.exit(1)
  }

  const baseTime = parseISO(baseTimeArg)

  const calendarRepositories = config.CALENDAR_IDS.map((id) => new GoogleCalendarRepository(id))
  const notificationRepositories = {
    webhook: new WebhookNotificationRepository(process.env.WEBHOOK_URL || ''),
    console: new ConsoleNotificationRepository(),
  }
  await processReminders(baseTime, calendarRepositories, notificationRepositories)
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
