import { Card, CardBody, CardHeader } from '@nextui-org/react'
import { ReminderTarget } from '@synk-cal/usecase'
import { parseISO } from 'date-fns'
import useLocale from '~/hooks/useLocale'

type SerializedReminderTarget = Omit<ReminderTarget, 'sendAt'> & {
  sendAt: string
}

type Props = {
  reminders: SerializedReminderTarget[]
  className?: string
}

export function UpcomingReminders({ reminders, className }: Props) {
  const locale = useLocale()
  const sortedReminders = [...reminders].sort((a, b) => parseISO(a.sendAt).getTime() - parseISO(b.sendAt).getTime())

  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return (
    <Card className={className}>
      <CardHeader>
        <h2 className="text-lg font-semibold">{locale === 'ja' ? '今後のリマインダー' : 'Upcoming Reminders'}</h2>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-4">
          {sortedReminders.length === 0 ? (
            <p className="text-default-500">{locale === 'ja' ? 'リマインダーはありません' : 'No upcoming reminders'}</p>
          ) : (
            sortedReminders.map((reminder, index) => (
              <div key={index} className="flex flex-col gap-1 p-4 border rounded">
                <div className="text-sm text-default-500">
                  {reminder.sendAt}
                  {locale === 'ja'
                    ? `${dateTimeFormatter.format(parseISO(reminder.sendAt))}に通知`
                    : `Notify at ${dateTimeFormatter.format(parseISO(reminder.sendAt))}`}
                </div>
                <div className="text-default-700">{reminder.message}</div>
                <div className="text-xs text-default-400">
                  {locale === 'ja' ? '通知方法：' : 'Notification type: '}
                  {reminder.notificationType}
                </div>
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  )
}
