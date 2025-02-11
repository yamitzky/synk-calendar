import { ReminderSettingsRepository, config } from '@synk-cal/core'
import { FirestoreReminderSettingsRepository } from '@synk-cal/google-cloud'

export function getReminderSettingsRepository(): ReminderSettingsRepository | undefined {
  if (config.REMINDER_SETTINGS_PROVIDER === 'firestore') {
    return new FirestoreReminderSettingsRepository({
      databaseId: config.REMINDER_SETTINGS_FIRESTORE_DATABASE_ID,
    })
  }
}
