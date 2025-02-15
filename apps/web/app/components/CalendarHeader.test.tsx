import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CalendarHeader } from './CalendarHeader'

describe('CalendarHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders correctly', () => {
    vi.setSystemTime(new Date('2023-05-01'))
    const { container } = render(<CalendarHeader todayLabel="Today" />)
    expect(container).toMatchSnapshot()
  })

  it('calls onToday when today button is clicked', () => {
    const onToday = vi.fn()
    render(<CalendarHeader onToday={onToday} />)
    fireEvent.click(screen.getByLabelText('Today'))
    expect(onToday).toHaveBeenCalledTimes(1)
  })

  it('calls onNext and onPrev when navigation buttons are clicked', () => {
    const onNext = vi.fn()
    const onPrev = vi.fn()
    render(<CalendarHeader onNext={onNext} onPrev={onPrev} />)
    fireEvent.click(screen.getByLabelText('Next'))
    expect(onNext).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByLabelText('Previous'))
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  it('displays custom todayLabel when provided', () => {
    const customLabel = 'navigate to today'
    render(<CalendarHeader todayLabel={customLabel} />)
    expect(screen.getByText(customLabel)).toBeInTheDocument()
  })

  it('calls onChangeView when view type is changed', () => {
    const onChangeView = vi.fn()
    render(<CalendarHeader onChangeView={onChangeView} initialView="timeGridDay" />)
    fireEvent.click(screen.getByLabelText('view type'))
    fireEvent.click(screen.getByTestId('timeGridWeek'))
    expect(onChangeView).toHaveBeenCalledWith('timeGridWeek')
  })

  it('displays correct date range', () => {
    render(<CalendarHeader start="2023-05-01" end="2023-06-01" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('May 1 – 31, 2023')
  })

  it('displays correct date range when start and end are the same', () => {
    render(<CalendarHeader start="2023-05-01" end="2023-05-02" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('May 1, 2023')
  })

  it('calls onSearch when search input changes', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<CalendarHeader onSearch={onSearch} />)

    const searchButton = screen.getByLabelText('Open Search')
    await user.click(searchButton)
    // autofocus
    await user.keyboard('meeting{Enter}')

    expect(onSearch).toHaveBeenCalledWith('meeting')
  })
})
