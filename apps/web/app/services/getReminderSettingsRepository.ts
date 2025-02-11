import { ReminderSettingsRepository, config } from '@synk-cal/core'
import { FirestoreReminderSettingsRepository } from '@synk-cal/google'
import { GlobalReminderSettingsRepository } from '@synk-cal/repository'

export function getReminderSettingsRepository(): ReminderSettingsRepository {
  if (config.REMINDER_SETTINGS_PROVIDER === 'firestore') {
    return new FirestoreReminderSettingsRepository({
      databaseId: config.REMINDER_SETTINGS_FIRESTORE_DATABASE_ID,
    })
  } else if (config.REMINDER_SETTINGS_PROVIDER === 'global') {
    return new GlobalReminderSettingsRepository()
  }
  throw new Error('Invalid REMINDER_SETTINGS_PROVIDER')
}
