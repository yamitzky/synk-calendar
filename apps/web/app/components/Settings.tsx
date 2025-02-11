import { Card, CardBody, CardHeader } from '@nextui-org/react'
import type { ReminderSetting, User } from '@synk-cal/core'
import { UserInfo } from '~/components/UserInfo'

import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { twMerge } from 'tailwind-merge'
import useLocale from '~/hooks/useLocale'

type Props = {
  user: User
  reminders: readonly ReminderSetting[]
  onChange: (reminders: ReminderSetting[]) => void
  className?: string
}

const NOTIFY_BEFORE_OPTIONS = [
  { value: 5, unit: 'min', amount: 5 },
  { value: 10, unit: 'min', amount: 10 },
  { value: 15, unit: 'min', amount: 15 },
  { value: 30, unit: 'min', amount: 30 },
  { value: 60, unit: 'hour', amount: 1 },
  { value: 120, unit: 'hour', amount: 2 },
  { value: 180, unit: 'hour', amount: 3 },
  { value: 360, unit: 'hour', amount: 6 },
  { value: 720, unit: 'hour', amount: 12 },
  { value: 1440, unit: 'day', amount: 1 },
  { value: 2880, unit: 'day', amount: 2 },
  { value: 4320, unit: 'day', amount: 3 },
  { value: 10080, unit: 'day', amount: 7 },
] as const

const unitInJapanese = {
  min: '分',
  hour: '時間',
  day: '日',
} as const

export function ReminderSettings({ user, reminders, onChange, className }: Props) {
  const addReminder = () => {
    const newReminder: ReminderSetting = {
      id: crypto.randomUUID(),
      minutesBefore: 5,
      notificationType: 'webhook',
    }
    onChange([...reminders, newReminder])
  }

  const removeReminder = (id: string | number) => {
    onChange(reminders.filter((reminder) => reminder.id !== id))
  }

  const updateReminder = (id: string | number, minutesBefore: number) => {
    onChange(
      reminders.map((reminder) =>
        reminder.id === id ? ({ ...reminder, minutesBefore } satisfies ReminderSetting) : reminder,
      ),
    )
  }

  const locale = useLocale()

  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
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
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{locale === 'ja' ? 'リマインダー' : 'Reminder Settings'}</h2>
          <Button color="primary" variant="flat" onClick={addReminder} className="px-4">
            ＋
          </Button>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4">
            {reminders.map((reminder, i) => (
              <div key={reminder.id} className="flex items-center gap-4">
                <Select
                  label={locale === 'ja' ? '通知タイミング' : 'Notify before'}
                  isRequired
                  selectedKeys={[reminder.minutesBefore.toString()]}
                  className="max-w-[200px]"
                  onChange={(e) => updateReminder(reminder.id ?? i, Number(e.target.value))}
                  items={NOTIFY_BEFORE_OPTIONS}
                >
                  {({ unit, amount, value }) => {
                    const label = `${amount} ${locale === 'ja' ? unitInJapanese[unit] : unit}`
                    return (
                      <SelectItem key={value.toString()} textValue={label}>
                        {label}
                      </SelectItem>
                    )
                  }}
                </Select>
                <Input
                  label={locale === 'ja' ? '通知タイプ' : 'Notification type'}
                  value="Webhook"
                  isReadOnly
                  className="max-w-[200px]"
                />
                <Button color="danger" variant="flat" size="sm" onClick={() => removeReminder(reminder.id ?? i)}>
                  ❌
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
