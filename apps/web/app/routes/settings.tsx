import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { ReminderSetting, config } from '@synk-cal/core'
import { ReminderTarget, getRemindTargets } from '@synk-cal/usecase'
import { addDays } from 'date-fns'
import { ReminderSettings } from '~/components/Settings'
import { UpcomingReminders } from '~/components/UpcomingReminders'
import { getAuthRepository } from '~/services/getAuthRepository'
import { getCalendarRepository } from '~/services/getCalendarRepository'
import { getGroupRepository } from '~/services/getGroupRepository'
import { getReminderSettingsRepository } from '~/services/getReminderSettingsRepository'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getAuthRepository()?.getUserFromHeader(request.headers)

  const reminderSettingsRepo = getReminderSettingsRepository()

  let reminders: ReminderSetting[] = []
  let upcomingReminders: ReminderTarget[] = []
  if (user) {
    reminders = (await reminderSettingsRepo.getReminderSettings(user.email)) || []

    // Get upcoming reminders for the next 48 hours
    const now = new Date()
    const calendarRepositories = [
      ...config.CALENDAR_IDS.map((id) => getCalendarRepository(id)),
      ...config.PRIVATE_CALENDAR_IDS.map((id) => getCalendarRepository(id)),
    ]

    upcomingReminders = await getRemindTargets({
      startDate: now,
      endDate: addDays(now, 7),
      calendarRepositories,
      groupRepository: getGroupRepository(),
      reminderSettingsRepository: reminderSettingsRepo,
      userEmail: user.email, // Only get reminders for the current user
    })
  }

  return json({
    user,
    isReminderSettingsEnabled: !!reminderSettingsRepo,
    reminders,
    upcomingReminders,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()

  const user = await getAuthRepository()?.getUserFromHeader(request.headers)

  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const remindersJson = formData.get('reminders')
  let reminders = []
  if (typeof remindersJson === 'string') {
    try {
      reminders = JSON.parse(remindersJson)
    } catch (error) {
      return json({ success: false, error: 'Invalid JSON format' }, { status: 400 })
    }
    try {
      await getReminderSettingsRepository().updateReminderSettings(user.email, reminders)
      return json({ success: true, reminders })
    } catch (error) {
      console.error('Error updating reminders:', error)
      return json({ success: false, error: 'Failed to update reminders' }, { status: 500 })
    }
  }

  return json({ success: false, error: 'Invalid action' }, { status: 400 })
}

export default function SettingsRoute() {
  const { user, reminders, upcomingReminders, isReminderSettingsEnabled } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  const handleRemindersChange = (newReminders: ReminderSetting[]) => {
    const formData = new FormData()
    formData.append('reminders', JSON.stringify(newReminders))
    fetcher.submit(formData, { method: 'post' })
  }

  // optimistic ui
  const currentReminders = fetcher.formData ? JSON.parse(fetcher.formData.get('reminders') as string) : reminders

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      {!user ? (
        <div>Please sign in to view settings.</div>
      ) : !isReminderSettingsEnabled ? (
        <div>Reminder settings are not enabled.</div>
      ) : (
        <div className="flex flex-col gap-4">
          <ReminderSettings user={user} reminders={currentReminders} onChange={handleRemindersChange} />
          <UpcomingReminders reminders={upcomingReminders} />
        </div>
      )}
    </div>
  )
}
