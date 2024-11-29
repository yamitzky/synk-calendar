import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { parseConfig } from './config'

describe('Config', () => {
  it('should parse valid configuration', () => {
    const mockEnv = {
      GOOGLE_AUTH_SUBJECT: 'test@example.com',
      CALENDAR_IDS: 'calendar1,calendar2',
      REMINDER_SETTINGS: JSON.stringify([
        { minutesBefore: 10, notificationType: 'email' },
        { minutesBefore: 30, notificationType: 'sms', target: '+1234567890' },
      ]),
      REMINDER_TEMPLATE: 'Your event {eventName} starts in {minutesBefore} minutes',
      WEBHOOK_URL: 'https://example.com/webhook',
    }

    const parsedConfig = parseConfig(mockEnv)

    expect(parsedConfig).toEqual({
      GOOGLE_AUTH_SUBJECT: 'test@example.com',
      CALENDAR_IDS: ['calendar1', 'calendar2'],
      REMINDER_SETTINGS: [
        { minutesBefore: 10, notificationType: 'email' },
        { minutesBefore: 30, notificationType: 'sms', target: '+1234567890' },
      ],
      REMINDER_TEMPLATE: 'Your event {eventName} starts in {minutesBefore} minutes',
      WEBHOOK_URL: 'https://example.com/webhook',
    })
  })

  it('should handle missing optional values', () => {
    const mockEnv = {
      CALENDAR_IDS: 'calendar1',
    }

    const parsedConfig = parseConfig(mockEnv)

    expect(parsedConfig).toEqual({
      GOOGLE_AUTH_SUBJECT: undefined,
      CALENDAR_IDS: ['calendar1'],
      REMINDER_SETTINGS: [],
      REMINDER_TEMPLATE: undefined,
      WEBHOOK_URL: undefined,
    })
  })

  it('should throw an error for invalid WEBHOOK_URL', () => {
    const mockEnv = {
      WEBHOOK_URL: 'invalid-url',
    }

    expect(() => parseConfig(mockEnv)).toThrow(v.ValiError)
  })

  it('should throw an error for invalid REMINDER_SETTINGS', () => {
    const mockEnv = {
      REMINDER_SETTINGS: JSON.stringify([{ minutesBefore: 'invalid', notificationType: 'email' }]),
    }

    expect(() => parseConfig(mockEnv)).toThrow(v.ValiError)
  })

  it('should throw an error for invalid REMINDER_SETTINGS JSON', () => {
    const mockEnv = {
      REMINDER_SETTINGS: 'invalid-json',
    }

    expect(() => parseConfig(mockEnv)).toThrow('Invalid REMINDER_SETTINGS JSON')
  })
})
