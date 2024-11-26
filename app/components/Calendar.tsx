import type { EventContentArg } from '@fullcalendar/core'
import allLocales from '@fullcalendar/core/locales-all'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react'
import { format } from 'date-fns'
import { useCallback, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import type { CalendarEvent } from '~/domain/calendar'
import useLocale from '~/hooks/useLocale'
import { CalendarHeader } from './CalendarHeader'
import { EventCell } from './EventCell'
import { EventDetail } from './EventDetail'
import type { CalendarViewType } from './viewType'

type Props = {
  calendars: Array<{ calendarId: string; events: CalendarEvent[] }>
  onChangeDate?: (startDate: string, endDate: string) => void
  initialView?: CalendarViewType
  initialDate?: string
}

const colors = ['#053B48', '#62420E', '#992F7B', '#0E793C', '#6020A0', '#004493'] as const

function getColor(index: number): string {
  return colors[index % colors.length] ?? colors[0]
}

export const Calendar = ({ calendars, onChangeDate, initialDate, initialView = 'dayGridMonth' }: Props) => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>()

  const locale = useLocale()

  const handleDatesSet = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      const newStartDate = format(start, 'yyyy-MM-dd')
      const newEndDate = format(end, 'yyyy-MM-dd')
      if (newStartDate !== dateRange?.start || newEndDate !== dateRange?.end) {
        if (dateRange) {
          // skip on initial load
          onChangeDate?.(newStartDate, newEndDate)
        }
        setDateRange({ start: newStartDate, end: newEndDate })
      }
    },
    [onChangeDate, dateRange],
  )

  const eventSources = useMemo(() => {
    return calendars.map((cal, index) => ({ events: cal.events, color: getColor(index) }))
  }, [calendars])

  const calendarRef = useRef<FullCalendar>(null)
  const [currentViewType, setViewType] = useState<CalendarViewType | undefined>(initialView)

  return (
    <div className="flex flex-col h-full space-y-2 sm:space-y-4">
      <CalendarHeader
        start={dateRange?.start}
        end={dateRange?.end}
        onToday={() => calendarRef.current?.getApi().today()}
        onNext={() => calendarRef.current?.getApi().next()}
        onPrev={() => calendarRef.current?.getApi().prev()}
        onChangeView={(viewType) => {
          calendarRef.current?.getApi().changeView(viewType)
          setViewType(viewType)
        }}
        initialView={initialView}
      />
      <div className="flex-1 overflow-x-auto">
        <div
          className={twMerge(
            'h-full',
            currentViewType === 'dayGridMonth' || currentViewType === 'timeGridWeek' ? 'min-w-[800px]' : undefined,
          )}
        >
          <FullCalendar
            ref={calendarRef}
            initialDate={initialDate}
            height="100%"
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView={initialView}
            eventSources={eventSources}
            datesSet={handleDatesSet}
            locale={locale}
            locales={allLocales}
            nowIndicator
            firstDay={1}
            views={{
              timeGridFourDay: {
                type: 'timeGrid',
                duration: { days: 4 },
                buttonText: '4日',
              },
            }}
            headerToolbar={false}
            eventContent={renderContent}
          />
        </div>
      </div>
    </div>
  )
}

function renderContent({ event, timeText, view, backgroundColor }: EventContentArg) {
  return (
    <Popover placement={view.type === 'timeGridDay' ? 'bottom-start' : 'right-start'}>
      <PopoverTrigger>
        <div className="h-full cursor-pointer">
          <EventCell
            title={event.title}
            timeText={timeText}
            viewType={view.type as CalendarViewType}
            color={backgroundColor}
            start={event.startStr}
            end={event.endStr}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-4 max-w-2xl max-h-[60vh] overflow-y-auto">
          <EventDetail
            title={event.title}
            start={event.startStr}
            end={event.endStr}
            location={event.extendedProps.location}
            people={event.extendedProps.people}
            description={event.extendedProps.description}
            conference={event.extendedProps.conference}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
