import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { parseConfig } from './config'

describe('Config', () => {
  it('should parse valid configuration', () => {
    const mockEnv: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      GOOGLE_AUTH_SUBJECT: 'test@example.com',
      CALENDAR_IDS: 'calendar1,calendar2',
      REMINDER_SETTINGS: JSON.stringify([
        { minutesBefore: 10, notificationType: 'email' },
        { hour: 9, minute: 0, notificationType: 'sms', target: '+1234567890' },
      ]),
      REMINDER_TEMPLATE: 'Your event {eventName} starts in {minutesBefore} minutes',
      WEBHOOK_URL: 'https://example.com/webhook',
      CALENDAR_PROVIDER: 'google',
      REMINDER_SETTINGS_FIRESTORE_DATABASE_ID: 'test',
      REMINDER_SETTINGS_PROVIDER: 'firestore',
      AUTH_PROVIDER: 'google-iap',
    }

    const parsedConfig = parseConfig(mockEnv)

    expect(parsedConfig).toEqual({
      GOOGLE_AUTH_SUBJECT: 'test@example.com',
      CALENDAR_IDS: ['calendar1', 'calendar2'],
      TIMEZONE: 'UTC',
      REMINDER_SETTINGS: [
        { minutesBefore: 10, notificationType: 'email' },
        { hour: 9, minute: 0, notificationType: 'sms', target: '+1234567890' },
      ],
      REMINDER_TEMPLATE: 'Your event {eventName} starts in {minutesBefore} minutes',
      WEBHOOK_URL: 'https://example.com/webhook',
      REMINDER_SETTINGS_PROVIDER: 'firestore',
      REMINDER_SETTINGS_FIRESTORE_DATABASE_ID: 'test',
      CALENDAR_PROVIDER: 'google',
      AUTH_PROVIDER: 'google-iap',
    })
  })

  it('should handle missing optional values', () => {
    const mockEnv: NodeJS.ProcessEnv = {
      CALENDAR_IDS: 'calendar1',
      NODE_ENV: 'test',
    }

    const parsedConfig = parseConfig(mockEnv)

    expect(parsedConfig).toEqual({
      GOOGLE_AUTH_SUBJECT: undefined,
      CALENDAR_IDS: ['calendar1'],
      TIMEZONE: 'UTC',
      REMINDER_SETTINGS: [],
      REMINDER_TEMPLATE: undefined,
      WEBHOOK_URL: undefined,
      REMINDER_SETTINGS_PROVIDER: 'global',
      REMINDER_SETTINGS_FIRESTORE_DATABASE_ID: undefined,
      AUTH_PROVIDER: undefined,
      CALENDAR_PROVIDER: 'google',
    })
  })

  it('should throw an error for invalid WEBHOOK_URL', () => {
    const mockEnv: NodeJS.ProcessEnv = {
      WEBHOOK_URL: 'invalid-url',
      NODE_ENV: 'test',
    }

    expect(() => parseConfig(mockEnv)).toThrow(v.ValiError)
  })

  it('should throw an error for invalid REMINDER_SETTINGS', () => {
    const mockEnv = {
      NODE_ENV: 'test',
      REMINDER_SETTINGS: JSON.stringify([
        { minutesBefore: 'invalid', notificationType: 'email' },
        { hour: 25, minute: 0, notificationType: 'email' },
      ]),
    } as NodeJS.ProcessEnv

    expect(() => parseConfig(mockEnv)).toThrow(v.ValiError)
  })

  it('should throw an error for invalid REMINDER_SETTINGS JSON', () => {
    const mockEnv = {
      REMINDER_SETTINGS: 'invalid-json',
      NODE_ENV: 'test',
    } as NodeJS.ProcessEnv

    expect(() => parseConfig(mockEnv)).toThrow('Invalid REMINDER_SETTINGS JSON')
  })
})
