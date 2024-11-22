import { isSameDay } from 'date-fns'
import { twMerge } from 'tailwind-merge'
import type { CalendarViewType } from '~/components/viewType'

type Props = {
  title: string
  timeText: string
  viewType: CalendarViewType
  color: string
  start: string
  end: string
  className?: string
}

export const EventCell = ({ title, timeText, viewType, color, start, end, className }: Props) => {
  const isDayGridMonth = viewType === 'dayGridMonth'
  const displaysDot = isDayGridMonth && isSameDay(start, end)
  return (
    <div className={twMerge('h-full p-0.5 overflow-hidden', className)}>
      {isDayGridMonth ? (
        <div className="flex items-center space-x-1">
          {displaysDot && <div style={{ backgroundColor: color }} className="w-2.5 h-2.5 rounded-full" />}
          {timeText && <p>{timeText}</p>}
          <p className="text-nowrap font-bold">{title}</p>
        </div>
      ) : (
        <div>
          <p>{title}</p>
          <p className="text-xs">{timeText}</p>
        </div>
      )}
    </div>
  )
}
