export const config = {
  GOOGLE_AUTH_SUBJECT: process.env.GOOGLE_AUTH_SUBJECT,
  CALENDAR_IDS: process.env.CALENDAR_IDS?.split(',') ?? [],
  REMINDER_SETTINGS: process.env.REMINDER_SETTINGS ? JSON.parse(process.env.REMINDER_SETTINGS) : [],
  REMINDER_TEMPLATE:
    process.env.REMINDER_TEMPLATE || 'Reminder: "<%= it.title %>" starts in <%= it.minutesBefore %> minutes.',
  WEBHOOK_URL: process.env.WEBHOOK_URL,
}
