import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import type { User } from '@synk-cal/core'
import { extractUserFromHeader } from '@synk-cal/google-cloud'
import { Settings } from '~/components/Settings'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let user: User | undefined = undefined
  try {
    user = await extractUserFromHeader(request.headers)
  } catch (error) {
    console.log(error)
  }
  return json({ user })
}

export default function SettingsRoute() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <Settings user={user} />
    </div>
  )
}
