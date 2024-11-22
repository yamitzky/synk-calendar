import { isSameDay } from 'date-fns'

type Props = {
  title: string
  timeText: string
  gridType: 'time' | 'day'
  color: string
  start: string
  end: string
}

export const EventCell = ({ title, timeText, gridType, color, start, end }: Props) => {
  const isDayGridMonth = gridType === 'day'
  const displaysDot = isDayGridMonth && isSameDay(start, end)
  return (
    <div className="h-full p-0.5 overflow-hidden">
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
