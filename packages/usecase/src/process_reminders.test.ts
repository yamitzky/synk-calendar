import type { CalendarRepository, NotificationRepository, ReminderSettingsRepository } from '@synk-cal/core'
import { parseISO } from 'date-fns'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { processReminders } from './process_reminders'

vi.mock('./get_remind_targets', () => ({
  getRemindTargets: vi.fn(),
}))

describe('processReminders', () => {
  let mockCalendarRepository: CalendarRepository
  let mockConsoleNotificationRepository: NotificationRepository
  let mockWebhookNotificationRepository: NotificationRepository
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

    mockReminderSettingsRepository = {
      getReminderSettings: vi.fn(),
      updateReminderSettings: vi.fn(),
    }
  })

  it('should send notifications only for targets matching current time', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')

    vi.mocked(await import('./get_remind_targets')).getRemindTargets.mockResolvedValue([
      {
        sendAt: parseISO('2023-06-01T10:00:00Z'), // Should be sent
        notificationType: 'console',
        target: 'user1@example.com',
        message: 'Custom reminder: Event 1 in 10 minutes.',
      },
      {
        sendAt: parseISO('2023-06-01T10:05:00Z'), // Should not be sent (different time)
        notificationType: 'webhook',
        target: 'user2@example.com',
        message: 'Custom reminder: Event 2 in 5 minutes.',
      },
    ])

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

    // Verify getRemindTargets is called with correct date range (48 hours)
    expect(vi.mocked(await import('./get_remind_targets')).getRemindTargets).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: baseTime,
        endDate: new Date('2023-06-03T10:00:00Z'), // 48 hours after baseTime
      }),
    )

    expect(mockConsoleNotificationRepository.notify).toHaveBeenCalledWith(
      'user1@example.com',
      'Custom reminder: Event 1 in 10 minutes.',
    )

    expect(mockWebhookNotificationRepository.notify).not.toHaveBeenCalled()
  })

  it('should handle day-before reminders for events near the end of the range', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')

    vi.mocked(await import('./get_remind_targets')).getRemindTargets.mockResolvedValue([
      {
        sendAt: parseISO('2023-06-01T10:00:00Z'), // Current time, should be sent
        notificationType: 'console',
        target: 'user1@example.com',
        message: 'Custom reminder: Event 1 tomorrow at 23:59.',
      },
    ])

    await processReminders({
      baseTime,
      calendarRepositories: [mockCalendarRepository],
      groupRepository: undefined,
      notificationRepositories: {
        console: mockConsoleNotificationRepository,
      },
      reminderSettingsRepository: mockReminderSettingsRepository,
    })

    // Verify getRemindTargets is called with correct date range
    expect(vi.mocked(await import('./get_remind_targets')).getRemindTargets).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: baseTime,
        endDate: new Date('2023-06-03T10:00:00Z'), // 48 hours after baseTime
      }),
    )

    expect(mockConsoleNotificationRepository.notify).toHaveBeenCalledWith(
      'user1@example.com',
      'Custom reminder: Event 1 tomorrow at 23:59.',
    )
  })

  it('should handle notification repository errors gracefully', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')

    vi.mocked(await import('./get_remind_targets')).getRemindTargets.mockResolvedValue([
      {
        sendAt: parseISO('2023-06-01T10:00:00Z'),
        notificationType: 'console',
        target: 'user1@example.com',
        message: 'Custom reminder: Event 1 in 10 minutes.',
      },
    ])

    vi.mocked(mockConsoleNotificationRepository.notify).mockRejectedValue(new Error('Notification failed'))

    // Should not throw error
    await expect(
      processReminders({
        baseTime,
        calendarRepositories: [mockCalendarRepository],
        groupRepository: undefined,
        notificationRepositories: {
          console: mockConsoleNotificationRepository,
        },
        reminderSettingsRepository: mockReminderSettingsRepository,
      }),
    ).resolves.not.toThrow()
  })

  it('should handle missing notification repository gracefully', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')

    vi.mocked(await import('./get_remind_targets')).getRemindTargets.mockResolvedValue([
      {
        sendAt: parseISO('2023-06-01T10:00:00Z'),
        notificationType: 'unknown',
        target: 'user1@example.com',
        message: 'Custom reminder: Event 1 in 10 minutes.',
      },
    ])

    // Should not throw error
    await expect(
      processReminders({
        baseTime,
        calendarRepositories: [mockCalendarRepository],
        groupRepository: undefined,
        notificationRepositories: {},
        reminderSettingsRepository: mockReminderSettingsRepository,
      }),
    ).resolves.not.toThrow()
  })

  it('should not send notifications for targets at different times', async () => {
    const baseTime = parseISO('2023-06-01T10:00:00Z')

    vi.mocked(await import('./get_remind_targets')).getRemindTargets.mockResolvedValue([
      {
        sendAt: parseISO('2023-06-01T10:01:00Z'), // One minute later
        notificationType: 'console',
        target: 'user1@example.com',
        message: 'Custom reminder: Event 1 in 10 minutes.',
      },
      {
        sendAt: parseISO('2023-06-01T09:59:00Z'), // One minute earlier
        notificationType: 'webhook',
        target: 'user2@example.com',
        message: 'Custom reminder: Event 2 in 5 minutes.',
      },
    ])

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
})
