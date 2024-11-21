import jaLocale from '@fullcalendar/core/locales/ja'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { format } from 'date-fns'
import { useCallback, useRef } from 'react'
import type { CalendarEvent } from '~/domain/calendar'

type Props = {
  events: CalendarEvent[]
  onChangeDate?: (startDate: string, endDate: string) => void
  initialDate?: string
}

export const Calendar = ({ events, onChangeDate, initialDate }: Props) => {
  const prevStartDate = useRef<string>()
  const prevEndDate = useRef<string>()

  const handleDatesSet = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      const newStartDate = format(start, 'yyyy-MM-dd')
      const newEndDate = format(end, 'yyyy-MM-dd')
      if (newStartDate !== prevStartDate.current && newEndDate !== prevEndDate.current) {
        prevStartDate.current = newStartDate
        prevEndDate.current = newEndDate
        onChangeDate?.(newStartDate, newEndDate)
      }
    },
    [onChangeDate],
  )

  return (
    <FullCalendar
      initialDate={initialDate}
      height="100%"
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="timeGridWeek"
      events={events}
      datesSet={handleDatesSet}
      locale="ja"
      locales={[jaLocale]}
      nowIndicator
      firstDay={1}
      views={{
        timeGridFourDay: {
          type: 'timeGrid',
          duration: { days: 4 },
          buttonText: '4日',
        },
      }}
      headerToolbar={{
        center: 'title',
        start: 'today prev,next',
        end: 'dayGridMonth,timeGridWeek,timeGridFourDay,timeGridDay',
      }}
    />
  )
}
