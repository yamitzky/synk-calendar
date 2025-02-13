import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { ReminderSetting } from '@synk-cal/core'
import { ReminderSettings } from '~/components/Settings'
import { getAuthRepository } from '~/services/getAuthRepository'
import { getReminderSettingsRepository } from '~/services/getReminderSettingsRepository'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getAuthRepository()?.getUserFromHeader(request.headers)

  const reminderSettingsRepo = getReminderSettingsRepository()

  let reminders: ReminderSetting[] = []
  if (user) {
    reminders = (await reminderSettingsRepo.getReminderSettings(user.email)) || []
  }

  return json({
    user,
    isReminderSettingsEnabled: !!reminderSettingsRepo,
    reminders,
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
  const { user, reminders, isReminderSettingsEnabled } = useLoaderData<typeof loader>()
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
        // FIXME: reminder options config
        <ReminderSettings user={user} reminders={currentReminders} onChange={handleRemindersChange} />
      )}
    </div>
  )
}
