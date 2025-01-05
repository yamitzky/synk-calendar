import { Card, CardBody, CardHeader, Switch } from '@nextui-org/react'
import type { User } from '@synk-cal/core'
import { UserInfo } from '~/components/UserInfo'

type Props = {
  user: User
}

export function Settings({ user }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex gap-4">
          <UserInfo user={user} />
          <div>
            <p className="text-lg">{user.name || user.email}</p>
            <p className="text-small text-default-500">{user.email}</p>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Notifications</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <div>
                <p>Email Notifications</p>
                <p className="text-small text-default-500">Receive email notifications for events</p>
              </div>
              <Switch defaultSelected />
            </div>
            <div className="flex justify-between">
              <div>
                <p>Desktop Notifications</p>
                <p className="text-small text-default-500">Show desktop notifications for upcoming events</p>
              </div>
              <Switch defaultSelected />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Calendar Display</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <div>
                <p>Show Weekends</p>
                <p className="text-small text-default-500">Display weekend days in calendar view</p>
              </div>
              <Switch defaultSelected />
            </div>
            <div className="flex justify-between">
              <div>
                <p>24-hour Format</p>
                <p className="text-small text-default-500">Use 24-hour time format</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
