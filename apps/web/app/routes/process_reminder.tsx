import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { type NotificationRepository, config } from '@synk-cal/core'
import {
  ConsoleNotificationRepository,
  GoogleCalendarRepository,
  WebhookNotificationRepository,
} from '@synk-cal/repository'
import { processReminders } from '@synk-cal/usecase'

export const loader = () => {
  return json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } })
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  let baseTime: Date

  const scheduleTimeHeader = request.headers.get('X-CloudScheduler-ScheduleTime')
  if (scheduleTimeHeader) {
    baseTime = new Date(scheduleTimeHeader)
  } else {
    const body = await request.json()
    baseTime = new Date(body.baseTime)
  }

  if (Number.isNaN(baseTime.getTime())) {
    return json({ error: 'Invalid baseTime or X-CloudScheduler-ScheduleTime' }, { status: 400 })
  }

  const calendarRepositories = config.CALENDAR_IDS.map((id) => new GoogleCalendarRepository(id))
  const notificationRepositories: Record<string, NotificationRepository> = {
    console: new ConsoleNotificationRepository(),
  }
  if (config.WEBHOOK_URL) {
    notificationRepositories.webhook = new WebhookNotificationRepository(config.WEBHOOK_URL)
  }

  try {
    await processReminders(baseTime, calendarRepositories, notificationRepositories)
    return json({ success: true })
  } catch (error) {
    console.error('Error processing reminders:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
