import { Button, ButtonGroup, Select, SelectItem } from '@nextui-org/react'
import { subDays } from 'date-fns'
import { twMerge } from 'tailwind-merge'
import type { CalendarViewType } from '~/components/viewType'

type Props = {
  start?: string
  end?: string // exclusive
  onToday?: () => void
  onNext?: () => void
  onPrev?: () => void
  initialView?: CalendarViewType
  onChangeView?: (viewType: CalendarViewType) => void
  className?: string
}

export const CalendarHeader = ({
  start,
  end,
  onToday,
  onNext,
  onPrev,
  onChangeView,
  initialView,
  className,
}: Props) => {
  return (
    <>
      <div className={twMerge('flex justify-between items-center', className)}>
        <ButtonGroup>
          <Button onClick={onToday} className="px-4">
            {getToday()}
          </Button>
          <Button isIconOnly onClick={onPrev}>
            ◀
          </Button>
          <Button isIconOnly onClick={onNext}>
            ▶
          </Button>
        </ButtonGroup>
        <h1 className="text-lg hidden">{formatRange(start, end)}</h1>
        <div className="w-40">
          <Select
            defaultSelectedKeys={initialView ? [initialView] : undefined}
            disallowEmptySelection
            aria-label="view type"
            onChange={(e) => onChangeView?.(e.target.value as CalendarViewType)}
          >
            <SelectItem key="dayGridMonth">月</SelectItem>
            <SelectItem key="timeGridWeek">週</SelectItem>
            <SelectItem key="timeGridFourDay">4日</SelectItem>
            <SelectItem key="timeGridDay">日</SelectItem>
          </Select>
        </div>
      </div>
      <h1 className="text-lg sm:hidden text-center">{formatRange(start, end)}</h1>
    </>
  )
}

function formatRange(start?: string, end?: string): string {
  const startDate = start ? new Date(start) : new Date()
  const endDate = end ? subDays(new Date(end), 1) : new Date()

  const format = new Intl.DateTimeFormat('ja', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return format.formatRange(startDate, endDate)
}

function getToday() {
  const format = new Intl.DateTimeFormat('ja', {
    month: 'short',
    day: 'numeric',
  })
  return format.format(new Date())
}
