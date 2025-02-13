import type {
  CalendarRepository,
  NotificationRepository,
  ReminderSetting,
  ReminderSettingsRepository,
} from '@synk-cal/core'
import { parseISO } from 'date-fns'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { processReminders } from './process_reminders'

vi.mock('@synk-cal/core', () => ({
  config: {
    REMINDER_TEMPLATE:
      'Custom reminder: <%= it.title %> <%= it.minutesBefore ? `in ${it.minutesBefore} minutes` : `tomorrow at ${String(it.hour).padStart(2, "0")}:${String(it.minute).padStart(2, "0")}` %>.',
    TIMEZONE: 'UTC',
  },
}))

vi.mock('eta', () => ({
  Eta: vi.fn().mockImplementation(() => ({
    renderString: vi.fn(
      (template, data) =>
        `Custom reminder: ${data.title} ${
          'minutesBefore' in data
            ? `in ${data.minutesBefore} minutes`
            : `tomorrow at ${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`
        }.`,
    ),
  })),
}))

describe('processReminders', () => {
  let mockCalendarRepository: CalendarRepository
  let mockConsoleNotificationRepository: NotificationRepository
  let mockWebhookNotificationRepository: NotificationRepository
  let mockSendAllNotificationRepository: NotificationRepository
  let mockReminderSettingsRepository: ReminderSettingsRepository

  beforeEach(() => {
    mockCalendarRepository = {
      getEvents: vi.fn(),
    }

    mockConsoleNotificationRepository = {
      notify: vi.fn(),
    }

    mockWebhookNotificationRepository = {
      notify: vi.fn(),
    }

    mockSendAllNotificationRepository = {
      notify: vi.fn(),
    }

    mockReminderSettingsRepository = {
      getReminderSettings: vi.fn(),
      updateReminderSettings: vi.fn(),
    }
  })

  it('should send notifications for events with matching reminder times', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')
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

    await processReminders({
      baseTime,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      notificationRepositories: {
        console: mockConsoleNotificationRepository,
        webhook: mockWebhookNotificationRepository,
        sendall: mockSendAllNotificationRepository,
      },
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(mockReminderSettingsRepository.getReminderSettings).toHaveBeenCalledWith('user1@example.com')
    expect(mockReminderSettingsRepository.getReminderSettings).toHaveBeenCalledWith('user2@example.com')

    expect(mockCalendarRepository.getEvents).toHaveBeenCalledWith(
      baseTime,
      parseISO('2023-06-02T10:00:00Z'), // 1440分（24時間）後
    )

    expect(mockConsoleNotificationRepository.notify).toHaveBeenCalledWith(
      'user1@example.com',
      'Custom reminder: Event 1 in 10 minutes.',
    )

    expect(mockWebhookNotificationRepository.notify).toHaveBeenCalledWith(
      'user2@example.com',
      'Custom reminder: Event 2 in 5 minutes.',
    )

    expect(mockSendAllNotificationRepository.notify).not.toHaveBeenCalled()
  })

  it('should send notifications for day before at specific hour', async () => {
    const baseTime = parseISO('2023-06-01T19:00:00Z') // UTC 19:00
    const eventStart = parseISO('2023-06-02T10:00:00Z')

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: eventStart.toISOString(),
        end: parseISO('2023-06-02T11:00:00Z').toISOString(),
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

    await processReminders({
      baseTime,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      notificationRepositories: {
        console: mockConsoleNotificationRepository,
      },
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(mockConsoleNotificationRepository.notify).toHaveBeenCalledWith(
      'user1@example.com',
      'Custom reminder: Event 1 tomorrow at 19:00.',
    )
  })

  it('should handle multiple attendees for the same event', async () => {
    const baseTime = parseISO('2023-06-01T19:00:00Z')
    const eventStart = parseISO('2023-06-02T10:10:00Z')

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: eventStart.toISOString(),
        end: parseISO('2023-06-02T11:10:00Z').toISOString(),
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

    await processReminders({
      baseTime,
      calendarRepositories: [mockCalendarRepository],
      notificationRepositories: {
        console: mockConsoleNotificationRepository,
        webhook: mockWebhookNotificationRepository,
      },
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(mockConsoleNotificationRepository.notify).toHaveBeenCalledWith(
      'user1@example.com',
      'Custom reminder: Event 1 tomorrow at 19:00.',
    )

    expect(mockWebhookNotificationRepository.notify).toHaveBeenCalledWith(
      'user2@example.com',
      'Custom reminder: Event 1 tomorrow at 19:00.',
    )
  })

  it('should handle multiple reminder settings for the same user', async () => {
    const baseTime = parseISO('2023-06-01T19:00:00Z')
    const event1Start = parseISO('2023-06-01T19:10:00Z') // For minutesBefore
    const event2Start = parseISO('2023-06-02T10:10:00Z') // For hour/minute

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: event1Start.toISOString(),
        end: parseISO('2023-06-01T20:10:00Z').toISOString(),
        title: 'Event 1',
        people: [{ email: 'user1@example.com', organizer: false }],
      },
      {
        id: '2',
        start: event2Start.toISOString(),
        end: parseISO('2023-06-02T11:10:00Z').toISOString(),
        title: 'Event 2',
        people: [{ email: 'user1@example.com', organizer: false }],
      },
    ])

    const reminderSettingsMap: Record<string, ReminderSetting[]> = {
      'user1@example.com': [
        { minutesBefore: 10, notificationType: 'console' },
        { hour: 19, minute: 0, notificationType: 'webhook' },
      ],
    }

    vi.mocked(mockReminderSettingsRepository.getReminderSettings).mockImplementation(async (userKey) => {
      return reminderSettingsMap[userKey] ?? []
    })

    await processReminders({
      baseTime,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      notificationRepositories: {
        console: mockConsoleNotificationRepository,
        webhook: mockWebhookNotificationRepository,
      },
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(mockConsoleNotificationRepository.notify).toHaveBeenCalledWith(
      'user1@example.com',
      'Custom reminder: Event 1 in 10 minutes.',
    )

    expect(mockWebhookNotificationRepository.notify).toHaveBeenCalledWith(
      'user1@example.com',
      'Custom reminder: Event 2 tomorrow at 19:00.',
    )
  })

  it('should not send notifications for users without reminder settings', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')
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

    await processReminders({
      baseTime,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      notificationRepositories: {
        console: mockConsoleNotificationRepository,
        webhook: mockWebhookNotificationRepository,
      },
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(mockConsoleNotificationRepository.notify).not.toHaveBeenCalled()
    expect(mockWebhookNotificationRepository.notify).not.toHaveBeenCalled()
  })

  it('should not fetch events if no calendars are available', async () => {
    await processReminders({
      baseTime: parseISO('2023-06-01T10:00:00Z'),
      calendarRepositories: [],
      groupRepository: undefined,
      notificationRepositories: {
        console: mockConsoleNotificationRepository,
        webhook: mockWebhookNotificationRepository,
      },
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    expect(mockCalendarRepository.getEvents).not.toHaveBeenCalled()
    expect(mockConsoleNotificationRepository.notify).not.toHaveBeenCalled()
    expect(mockWebhookNotificationRepository.notify).not.toHaveBeenCalled()
  })
})
