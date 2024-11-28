import type { NotificationRepository } from '@synk-cal/core'

export class WebhookNotificationRepository implements NotificationRepository<string> {
  private webhookUrl: string

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async notify(target: string, payload: string): Promise<void> {
    const body = JSON.stringify({
      target: target,
      message: payload,
    })
    console.debug('sending webhook', body, this.webhookUrl)

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`Webhook notification failed: ${response.statusText}`)
    }
  }
}
