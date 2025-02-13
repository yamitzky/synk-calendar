export type ReminderTiming =
  | {
      minutesBefore: number
    }
  | {
      hour: number
      minute: number
    }

export type ReminderSetting = {
  id?: string | number
  notificationType: string
  target?: string
} & ReminderTiming

export interface ReminderSettingsRepository {
  getReminderSettings: (userKey: string) => Promise<ReminderSetting[]>
  updateReminderSettings: (userKey: string, reminders: ReminderSetting[]) => Promise<void>
}
