import { parseISO } from 'date-fns'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CalendarRepository } from '~/domain/calendar'
import type { NotificationRepository } from '~/domain/notification'
import { processReminders } from './process_reminders'

vi.mock('~/config', () => ({
  config: {
    REMINDER_SETTINGS: [
      { target: 'user1@example.com', minutesBefore: 10, notificationType: 'console' },
      { target: 'user2@example.com', minutesBefore: 5, notificationType: 'webhook' },
      { minutesBefore: 8, notificationType: 'sendall' },
    ],
    REMINDER_TEMPLATE: 'Custom reminder: <%= it.title %> in <%= it.minutesBefore %> minutes.',
  },
}))

vi.mock('eta', () => ({
  Eta: vi.fn().mockImplementation(() => ({
    renderString: vi.fn((template, data) => `Custom reminder: ${data.title} in ${data.minutesBefore} minutes.`),
  })),
}))

describe('processReminders', () => {
  let mockCalendarRepository: CalendarRepository
  let mockConsoleNotificationRepository: NotificationRepository
  let mockWebhookNotificationRepository: NotificationRepository
  let mockSendAllNotificationRepository: NotificationRepository

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

    await processReminders(baseTime, [mockCalendarRepository], {
      console: mockConsoleNotificationRepository,
      webhook: mockWebhookNotificationRepository,
      sendall: mockSendAllNotificationRepository,
    })

    expect(mockCalendarRepository.getEvents).toHaveBeenCalledWith(
      parseISO('2023-06-01T10:05:00Z'),
      parseISO('2023-06-01T10:11:00Z'),
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

  it('should not send notifications for events outside the reminder time', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')
    const eventStart = parseISO('2023-06-01T10:20:00Z')

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: eventStart.toISOString(),
        end: parseISO('2023-06-01T11:20:00Z').toISOString(),
        title: 'Event 1',
        people: [{ email: 'user1@example.com', organizer: false }],
      },
    ])

    await processReminders(baseTime, [mockCalendarRepository], {
      console: mockConsoleNotificationRepository,
      webhook: mockWebhookNotificationRepository,
      sendall: mockSendAllNotificationRepository,
    })

    expect(mockCalendarRepository.getEvents).toHaveBeenCalledWith(
      parseISO('2023-06-01T10:05:00Z'),
      parseISO('2023-06-01T10:11:00Z'),
    )
    expect(mockConsoleNotificationRepository.notify).not.toHaveBeenCalled()
    expect(mockWebhookNotificationRepository.notify).not.toHaveBeenCalled()
    expect(mockSendAllNotificationRepository.notify).not.toHaveBeenCalled()
  })

  it('should handle multiple calendar repositories', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')
    const event1Start = parseISO('2023-06-01T10:10:00Z')
    const event2Start = parseISO('2023-06-01T10:05:00Z')

    const mockCalendarRepository1 = {
      getEvents: vi.fn().mockResolvedValue([
        {
          id: '1',
          start: event1Start.toISOString(),
          end: parseISO('2023-06-01T11:10:00Z').toISOString(),
          title: 'Event 1',
          people: [{ email: 'user1@example.com' }],
        },
      ]),
    }

    const mockCalendarRepository2 = {
      getEvents: vi.fn().mockResolvedValue([
        {
          id: '2',
          start: event2Start.toISOString(),
          end: parseISO('2023-06-01T11:05:00Z').toISOString(),
          title: 'Event 2',
          people: [{ email: 'user2@example.com' }],
        },
      ]),
    }

    await processReminders(baseTime, [mockCalendarRepository1, mockCalendarRepository2], {
      console: mockConsoleNotificationRepository,
      webhook: mockWebhookNotificationRepository,
      sendall: mockSendAllNotificationRepository,
    })

    expect(mockCalendarRepository1.getEvents).toHaveBeenCalledWith(
      parseISO('2023-06-01T10:05:00Z'),
      parseISO('2023-06-01T10:11:00Z'),
    )
    expect(mockCalendarRepository2.getEvents).toHaveBeenCalledWith(
      parseISO('2023-06-01T10:05:00Z'),
      parseISO('2023-06-01T10:11:00Z'),
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

  it('should not fetch events if no calendars are available', async () => {
    await processReminders(parseISO('2023-06-01T10:00:00Z'), [], {
      console: mockConsoleNotificationRepository,
      webhook: mockWebhookNotificationRepository,
    })

    expect(mockCalendarRepository.getEvents).not.toHaveBeenCalled()
    expect(mockConsoleNotificationRepository.notify).not.toHaveBeenCalled()
    expect(mockWebhookNotificationRepository.notify).not.toHaveBeenCalled()
  })

  it('should send notifications to all attendees if no notification target is specified', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')
    const eventStart = parseISO('2023-06-01T10:08:00Z')

    vi.mocked(mockCalendarRepository.getEvents).mockResolvedValue([
      {
        id: '1',
        start: eventStart.toISOString(),
        end: parseISO('2023-06-01T11:10:00Z').toISOString(),
        title: 'Event 1',
        people: [
          { email: 'user3@example.com', organizer: false },
          { email: 'user4@example.com', organizer: true },
        ],
      },
    ])

    await processReminders(baseTime, [mockCalendarRepository], {
      console: mockConsoleNotificationRepository,
      webhook: mockWebhookNotificationRepository,
      sendall: mockSendAllNotificationRepository,
    })

    expect(mockConsoleNotificationRepository.notify).not.toHaveBeenCalled()
    expect(mockWebhookNotificationRepository.notify).not.toHaveBeenCalled()
    expect(mockSendAllNotificationRepository.notify).toHaveBeenCalledWith(
      'user3@example.com',
      'Custom reminder: Event 1 in 8 minutes.',
    )
    expect(mockSendAllNotificationRepository.notify).toHaveBeenCalledWith(
      'user4@example.com',
      'Custom reminder: Event 1 in 8 minutes.',
    )
  })
})
