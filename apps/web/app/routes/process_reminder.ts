import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { config } from '@synk-cal/core'
import { processReminders } from '@synk-cal/usecase'
import { getCalendarRepository } from '~/services/getCalendarRepository'
import { getGroupRepository } from '~/services/getGroupRepository'
import { getNotificationRepositories } from '~/services/getNotificationRepository'
import { getReminderSettingsRepository } from '~/services/getReminderSettingsRepository'

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

  const calendarRepositories = config.CALENDAR_IDS.map((id) => getCalendarRepository(id))
  const groupRepository = getGroupRepository()
  const notificationRepositories = getNotificationRepositories()
  const reminderSettingsRepository = getReminderSettingsRepository()

  try {
    await processReminders({
      baseTime,
      groupRepository,
      calendarRepositories,
      notificationRepositories,
      reminderSettingsRepository,
    })
    return json({ success: true })
  } catch (error) {
    console.error('Error processing reminders:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
