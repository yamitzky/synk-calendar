import { Button, ButtonGroup, Input, Select, SelectItem } from '@nextui-org/react'
import type { User } from '@synk-cal/core'
import { subDays } from 'date-fns'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { UserInfo } from '~/components/UserInfo'
import type { CalendarViewType } from '~/components/viewType'
import useLocale from '~/hooks/useLocale'

type Props = {
  todayLabel?: string
  user?: User
  start?: string
  end?: string // exclusive
  onToday?: () => void
  onNext?: () => void
  onPrev?: () => void
  onSearch?: (query: string) => void
  initialView?: CalendarViewType
  onChangeView?: (viewType: CalendarViewType) => void
  className?: string
}

export const CalendarHeader = ({
  user,
  start,
  end,
  onToday,
  onNext,
  onPrev,
  onChangeView,
  onSearch,
  initialView,
  todayLabel,
  className,
}: Props) => {
  const locale = useLocale()
  const langCode = locale?.split('-')?.[0]
  const [isEditing, setIsEditing] = useState(false)
  const [query, setQuery] = useState('')
  return (
    <div
      className={twMerge(
        'grid gap-2 grid-cols-[repeat(2,max-content)] sm:grid-cols-[repeat(3,max-content)] justify-between items-center',
        className,
      )}
    >
      <ButtonGroup>
        <Button onClick={onToday} className="px-4" aria-label="Today">
          {todayLabel ?? getToday(locale)}
        </Button>
        <Button isIconOnly onClick={onPrev} aria-label="Previous">
          ◀
        </Button>
        <Button isIconOnly onClick={onNext} aria-label="Next">
          ▶
        </Button>
      </ButtonGroup>
      <h1 className="text-lg text-center col-span-2 sm:col-span-1">{formatRange(locale, start, end)}</h1>
      <div className="row-start-1 col-start-2 sm:col-start-3 flex space-x-1">
        <Select
          defaultSelectedKeys={initialView ? [initialView] : undefined}
          disallowEmptySelection
          aria-label="view type"
          onChange={(e) => onChangeView?.(e.target.value as CalendarViewType)}
          className="w-40"
        >
          <SelectItem key="dayGridMonth" data-testid="dayGridMonth">
            {langCode === 'ja' ? '月' : 'Month'}
          </SelectItem>
          <SelectItem key="timeGridWeek" data-testid="timeGridWeek">
            {langCode === 'ja' ? '週' : 'Week'}
          </SelectItem>
          <SelectItem key="timeGridFourDay" data-testid="timeGridFourDay">
            {langCode === 'ja' ? '4日' : '4 Days'}
          </SelectItem>
          <SelectItem key="timeGridDay" data-testid="timeGridDay">
            {langCode === 'ja' ? '日' : 'Day'}
          </SelectItem>
        </Select>

        {!onSearch ? null : isEditing ? (
          <Input
            isClearable
            startContent="🔍"
            className="w-40"
            autoFocus
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(query)
              }
            }}
            onBlur={() => {
              if (query) {
                onSearch(query)
              } else {
                setIsEditing(false)
              }
            }}
            onClear={() => {
              setQuery('')
              onSearch('')
            }}
          />
        ) : (
          <Button isIconOnly radius="full" onClick={() => setIsEditing(true)} aria-label="Open Search">
            🔍
          </Button>
        )}
        {user && (
          <UserInfo
            user={user}
            onClick={() => {
              setIsEditing(true)
              setQuery(user.email)
              onSearch?.(user.email)
            }}
          />
        )}
      </div>
    </div>
  )
}

function formatRange(locale: string | undefined, start: string | undefined, end: string | undefined): string {
  const startDate = start ? new Date(start) : new Date()
  const endDate = end ? subDays(new Date(end), 1) : new Date()

  const format = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return format.formatRange(startDate, endDate)
}

function getToday(locale: string | undefined) {
  const format = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  })
  return format.format(new Date())
}
