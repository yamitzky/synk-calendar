import { ReminderSetting, config } from '@synk-cal/core'

export class GlobalReminderSettingsRepository {
  async getReminderSettings(userKey: string): Promise<ReminderSetting[]> {
    return config.REMINDER_SETTINGS
  }

  async updateReminderSettings(userKey: string, reminders: ReminderSetting[]): Promise<void> {
    throw new Error('Setting reminders is not supported in global settings')
  }
}
