export interface ReminderSetting {
  id?: string | number
  minutesBefore: number
  notificationType: string
  target?: string
}

export interface ReminderSettingsRepository {
  getReminderSettings: (userKey: string) => Promise<ReminderSetting[]>
  updateReminderSettings: (userKey: string, reminders: ReminderSetting[]) => Promise<void>
}
