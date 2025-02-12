import { Card, CardBody, CardHeader } from '@nextui-org/react'
import { type ReminderSetting, type User } from '@synk-cal/core'
import { UserInfo } from '~/components/UserInfo'

import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { twMerge } from 'tailwind-merge'
import useLocale from '~/hooks/useLocale'

type Props = {
  user: User
  reminders: readonly ReminderSetting[]
  onChange: (reminders: ReminderSetting[]) => void
  notifyBeforeOptions?: number[]
  className?: string
}

const unitInJapanese = {
  min: '分',
  hour: '時間',
  day: '日',
} as const

export function ReminderSettings({
  user,
  reminders,
  onChange,
  notifyBeforeOptions = [5, 10, 15, 30, 60, 120, 180, 360, 720, 1440],
  className,
}: Props) {
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
                  items={notifyBeforeOptions.map((value) => {
                    if (value < 60) {
                      return { value, unit: 'min' as const, amount: value }
                    } else if (value < 1440) {
                      return { value, unit: 'hour' as const, amount: value / 60 }
                    } else {
                      return { value, unit: 'day' as const, amount: value / 1440 }
                    }
                  })}
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
                  onChange={() => {
                    throw new Error('Not implemented')
                  }}
                  value={reminder.notificationType}
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
