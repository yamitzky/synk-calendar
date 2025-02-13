import { Card, CardBody, CardHeader } from '@nextui-org/react'
import { type ReminderSetting, ReminderTiming, type User } from '@synk-cal/core'
import { UserInfo } from '~/components/UserInfo'

import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { twMerge } from 'tailwind-merge'
import useLocale from '~/hooks/useLocale'

type Props = {
  user: User
  reminders: readonly ReminderSetting[]
  onChange: (reminders: ReminderSetting[]) => void
  minutesBeforeOptions?: number[]
  previousDayAtOptions?: { hour: number; minute: number }[]
  className?: string
}

const unitInJapanese = {
  min: '分前',
  hour: '時間前',
  day: '日前',
} as const

const getTimingKey = (reminder: ReminderTiming) => {
  if ('minutesBefore' in reminder) {
    return String(reminder.minutesBefore)
  } else {
    return `${String(reminder.hour).padStart(2, '0')}:${String(reminder.minute).padStart(2, '0')}`
  }
}

export function ReminderSettings({
  user,
  reminders,
  onChange,
  minutesBeforeOptions = [5, 10, 15, 30, 60, 120, 180, 360, 720, 1440],
  previousDayAtOptions = Array.from({ length: 24 }).map((_, hour) => ({ hour, minute: 0 })),
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

  const updateReminder = (id: string | number, value: ReminderTiming) => {
    onChange(
      reminders.map((reminder) => {
        if (reminder.id === id) {
          // @ts-expect-error
          const { minutesBefore, hour, minute, ...rest } = reminder
          return { ...rest, ...value }
        }
        return reminder
      }),
    )
  }

  const locale = useLocale()
  const options: { label: string; key: string; value: ReminderTiming }[] = [
    ...minutesBeforeOptions.map((min) => {
      const value = { minutesBefore: min }
      let label = ''
      if (min < 60) {
        label = `${min} ${locale === 'ja' ? unitInJapanese.min : 'min'}`
      } else if (min < 1440) {
        label = `${min / 60} ${locale === 'ja' ? unitInJapanese.hour : 'hour'}`
      } else {
        label = `${min / 1440} ${locale === 'ja' ? unitInJapanese.day : 'day'}`
      }
      return { label, key: getTimingKey(value), value }
    }),
    ...previousDayAtOptions.map((value) => {
      const key = getTimingKey(value)
      return { label: locale === 'ja' ? `前日の ${key}` : `${key} the day before`, key, value }
    }),
  ]

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
                  selectedKeys={[getTimingKey(reminder)]}
                  className="max-w-[200px]"
                  onChange={(e) => {
                    const value = options.find(({ key }) => key === e.target.value)?.value
                    if (value) {
                      updateReminder(reminder.id ?? i, value)
                    }
                  }}
                  items={options}
                >
                  {({ key, label }) => {
                    return (
                      <SelectItem key={key} textValue={label}>
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
