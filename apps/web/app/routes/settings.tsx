import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import type { User } from '@synk-cal/core'
import { extractUserFromHeader } from '@synk-cal/google-cloud'
import { useState } from 'react'
import { type ReminderSetting, ReminderSettings } from '~/components/Settings'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let user: User | undefined = undefined
  try {
    user = await extractUserFromHeader(request.headers)
  } catch (error) {
    console.log(error)
  }
  user = { email: 'negiga@gmail.com' }
  return json({ user })
}

export default function SettingsRoute() {
  const { user } = useLoaderData<typeof loader>()

  const [reminders, setReminders] = useState<ReminderSetting[]>([])

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      {user ? (
        <ReminderSettings user={user} reminders={reminders} onChange={setReminders} />
      ) : (
        <div>Please sign in to view settings.</div>
      )}
    </div>
  )
}
