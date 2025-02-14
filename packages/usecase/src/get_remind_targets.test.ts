import type { CalendarRepository, ReminderSetting, ReminderSettingsRepository } from '@synk-cal/core'
import { parseISO } from 'date-fns'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getRemindTargets } from './get_remind_targets'

vi.mock('@synk-cal/core', () => ({
  config: {
    REMINDER_TEMPLATE:
      'Custom reminder: <%= it.title %> <%= it.minutesBefore ? `in ${it.minutesBefore} minutes` : `tomorrow at ${it.start.split("T")[1].substring(0, 5)}` %>.',
    TIMEZONE: 'UTC',
  },
}))

describe('getRemindTargets', () => {
  let mockCalendarRepository: CalendarRepository
  let mockReminderSettingsRepository: ReminderSettingsRepository

  beforeEach(() => {
    mockCalendarRepository = {
      getEvents: vi.fn(),
    }

    mockReminderSettingsRepository = {
      getReminderSettings: vi.fn(),
      updateReminderSettings: vi.fn(),
    }
  })

  it('should return reminder targets for events with matching reminder times', async () => {
    const startDate = parseISO('2023-06-01T10:00:00Z')
    const endDate = parseISO('2023-06-02T10:00:00Z')
    const event1Start = parseISO('2023-06-01T10:10:00Z')
    const event2Start = parseISO('2023-06-01T10:05:00Z')

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: event1Start.toISOString(),
        end: parseISO('2023-06-01T11:10:00Z').toISOString(),
        title: 'Event 1',
        people: [{ email: 'user1@example.com', organizer: false }],
      },
      {
        id: '2',
        start: event2Start.toISOString(),
        end: parseISO('2023-06-01T11:05:00Z').toISOString(),
        title: 'Event 2',
        people: [{ email: 'user2@example.com', organizer: false }],
      },
    ])

    const reminderSettingsMap: Record<string, ReminderSetting[]> = {
      'user1@example.com': [{ minutesBefore: 10, notificationType: 'console' }],
      'user2@example.com': [{ minutesBefore: 5, notificationType: 'webhook' }],
    }

    vi.mocked(mockReminderSettingsRepository.getReminderSettings).mockImplementation(async (userKey) => {
      return reminderSettingsMap[userKey] ?? []
    })

    const targets = await getRemindTargets({
      startDate,
      endDate,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(targets).toEqual([
      {
        sendAt: parseISO('2023-06-01T10:00:00Z'),
        notificationType: 'console',
        target: 'user1@example.com',
        message: 'Custom reminder: Event 1 in 10 minutes.',
      },
      {
        sendAt: parseISO('2023-06-01T10:00:00Z'),
        notificationType: 'webhook',
        target: 'user2@example.com',
        message: 'Custom reminder: Event 2 in 5 minutes.',
      },
    ])
  })

  it('should return reminder targets only for specified user when userEmail is provided', async () => {
    const startDate = parseISO('2023-06-01T10:00:00Z')
    const endDate = parseISO('2023-06-02T10:00:00Z')
    const event1Start = parseISO('2023-06-01T10:10:00Z')
    const event2Start = parseISO('2023-06-01T10:05:00Z')

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: event1Start.toISOString(),
        end: parseISO('2023-06-01T11:10:00Z').toISOString(),
        title: 'Event 1',
        people: [{ email: 'user1@example.com', organizer: false }],
      },
      {
        id: '2',
        start: event2Start.toISOString(),
        end: parseISO('2023-06-01T11:05:00Z').toISOString(),
        title: 'Event 2',
        people: [{ email: 'user2@example.com', organizer: false }],
      },
    ])

    const reminderSettingsMap: Record<string, ReminderSetting[]> = {
      'user1@example.com': [{ minutesBefore: 10, notificationType: 'console' }],
      'user2@example.com': [{ minutesBefore: 5, notificationType: 'webhook' }],
    }

    vi.mocked(mockReminderSettingsRepository.getReminderSettings).mockImplementation(async (userKey) => {
      return reminderSettingsMap[userKey] ?? []
    })

    const targets = await getRemindTargets({
      startDate,
      endDate,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      reminderSettingsRepository: mockReminderSettingsRepository,
      userEmail: 'user1@example.com',
    })

    expect(targets).toEqual([
      {
        sendAt: parseISO('2023-06-01T10:00:00Z'),
        notificationType: 'console',
        target: 'user1@example.com',
        message: 'Custom reminder: Event 1 in 10 minutes.',
      },
    ])
  })

  it('should return reminder targets for day before at specific hour', async () => {
    const startDate = parseISO('2023-06-01T10:00:00Z')
    const endDate = parseISO('2023-06-02T10:00:00Z')
    const eventStart = parseISO('2023-06-02T01:00:00Z') // UTC 01:00 = 10:00 JST

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: eventStart.toISOString(),
        end: parseISO('2023-06-02T02:00:00Z').toISOString(),
        title: 'Event 1',
        people: [{ email: 'user1@example.com', organizer: false }],
      },
    ])

    const reminderSettingsMap: Record<string, ReminderSetting[]> = {
      'user1@example.com': [{ hour: 19, minute: 0, notificationType: 'console' }],
    }

    vi.mocked(mockReminderSettingsRepository.getReminderSettings).mockImplementation(async (userKey) => {
      return reminderSettingsMap[userKey] ?? []
    })

    const targets = await getRemindTargets({
      startDate,
      endDate,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(targets).toEqual([
      {
        sendAt: parseISO('2023-06-01T19:00:00Z'),
        notificationType: 'console',
        target: 'user1@example.com',
        message: 'Custom reminder: Event 1 tomorrow at 01:00.',
      },
    ])
  })

  it('should return reminder targets for multiple attendees of the same event', async () => {
    const startDate = parseISO('2023-06-01T10:00:00Z')
    const endDate = parseISO('2023-06-02T10:00:00Z')
    const eventStart = parseISO('2023-06-02T01:00:00Z')

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: eventStart.toISOString(),
        end: parseISO('2023-06-02T02:00:00Z').toISOString(),
        title: 'Event 1',
        people: [
          { email: 'user1@example.com', organizer: false },
          { email: 'user2@example.com', organizer: true },
        ],
      },
    ])

    const reminderSettingsMap: Record<string, ReminderSetting[]> = {
      'user1@example.com': [{ hour: 19, minute: 0, notificationType: 'console' }],
      'user2@example.com': [{ hour: 19, minute: 0, notificationType: 'webhook' }],
    }

    vi.mocked(mockReminderSettingsRepository.getReminderSettings).mockImplementation(async (userKey) => {
      return reminderSettingsMap[userKey] ?? []
    })

    const targets = await getRemindTargets({
      startDate,
      endDate,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(targets).toEqual([
      {
        sendAt: parseISO('2023-06-01T19:00:00Z'),
        notificationType: 'console',
        target: 'user1@example.com',
        message: 'Custom reminder: Event 1 tomorrow at 01:00.',
      },
      {
        sendAt: parseISO('2023-06-01T19:00:00Z'),
        notificationType: 'webhook',
        target: 'user2@example.com',
        message: 'Custom reminder: Event 1 tomorrow at 01:00.',
      },
    ])
  })

  it('should return empty array for users without reminder settings', async () => {
    const startDate = parseISO('2023-06-01T10:00:00Z')
    const endDate = parseISO('2023-06-01T11:00:00Z')
    const eventStart = parseISO('2023-06-01T10:10:00Z')

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: eventStart.toISOString(),
        end: parseISO('2023-06-01T11:10:00Z').toISOString(),
        title: 'Event 1',
        people: [{ email: 'user1@example.com', organizer: false }],
      },
    ])

    vi.mocked(mockReminderSettingsRepository.getReminderSettings).mockResolvedValue([])

    const targets = await getRemindTargets({
      startDate,
      endDate,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(targets).toEqual([])
  })
})
