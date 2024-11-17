export const config = {
  GOOGLE_AUTH_SUBJECT: process.env.GOOGLE_AUTH_SUBJECT,
  CALENDAR_IDS: process.env.CALENDAR_IDS?.split(',') ?? [],
}
