import { NotificationRepository, config } from '@synk-cal/core'
import { ConsoleNotificationRepository, WebhookNotificationRepository } from '@synk-cal/repository'

export function getNotificationRepositories() {
  const notificationRepositories: Record<string, NotificationRepository> = {
    console: new ConsoleNotificationRepository(),
  }
  if (config.WEBHOOK_URL) {
    notificationRepositories.webhook = new WebhookNotificationRepository(config.WEBHOOK_URL)
  }
  return notificationRepositories
}
