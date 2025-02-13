import * as v from 'valibot'

const reminderSettingSchema = v.union([
  v.object({
    notificationType: v.string(),
    target: v.optional(v.string()),
    minutesBefore: v.number(),
  }),
  v.object({
    notificationType: v.string(),
    target: v.optional(v.string()),
    hour: v.pipe(v.number(), v.minValue(0), v.maxValue(23)),
    minute: v.pipe(v.number(), v.minValue(0), v.maxValue(59)),
  }),
])

export const ConfigSchema = v.object({
  GOOGLE_AUTH_SUBJECT: v.optional(v.string()),
  CALENDAR_PROVIDER: v.optional(v.union([v.literal('google')]), 'google'),
  CALENDAR_IDS: v.pipe(
    v.optional(v.string()),
    v.transform((value) => value?.split(',') ?? []),
  ),
  PRIVATE_CALENDAR_IDS: v.pipe(
    v.optional(v.string()),
    v.transform((value) => value?.split(',') ?? []),
  ),
  TIMEZONE: v.optional(v.string(), 'UTC'),
  REMINDER_SETTINGS: v.pipe(
    v.optional(v.string()),
    v.transform((value) => {
      if (!value) {
        return []
      }
      try {
        return JSON.parse(value)
      } catch {
        throw new Error('Invalid REMINDER_SETTINGS JSON')
      }
    }),
    v.array(reminderSettingSchema),
  ),
  REMINDER_TEMPLATE: v.optional(v.string()),
  REMINDER_SETTINGS_PROVIDER: v.optional(v.union([v.literal('global'), v.literal('firestore')]), 'global'),
  REMINDER_SETTINGS_FIRESTORE_DATABASE_ID: v.optional(v.string()),
  AUTH_PROVIDER: v.optional(v.union([v.literal('google-iap')])),
  WEBHOOK_URL: v.optional(v.pipe(v.string(), v.url())),
  GROUP_PROVIDER: v.optional(v.union([v.literal('google')])),
  GROUP_CUSTOMER_ID: v.optional(v.string()),
})

export type Config = v.InferOutput<typeof ConfigSchema>

export function parseConfig(env: NodeJS.ProcessEnv): Config {
  return v.parse(ConfigSchema, {
    GOOGLE_AUTH_SUBJECT: env.GOOGLE_AUTH_SUBJECT,
    CALENDAR_PROVIDER: env.CALENDAR_PROVIDER,
    CALENDAR_IDS: env.CALENDAR_IDS,
    PRIVATE_CALENDAR_IDS: env.PRIVATE_CALENDAR_IDS,
    REMINDER_SETTINGS: env.REMINDER_SETTINGS,
    REMINDER_SETTINGS_PROVIDER: env.REMINDER_SETTINGS_PROVIDER,
    REMINDER_SETTINGS_FIRESTORE_DATABASE_ID: env.REMINDER_SETTINGS_FIRESTORE_DATABASE_ID,
    REMINDER_TEMPLATE: env.REMINDER_TEMPLATE,
    AUTH_PROVIDER: env.AUTH_PROVIDER,
    WEBHOOK_URL: env.WEBHOOK_URL,
    TIMEZONE: env.TIMEZONE,
    GROUP_PROVIDER: env.GROUP_PROVIDER,
    GROUP_CUSTOMER_ID: env.GROUP_CUSTOMER_ID,
  })
}

export const config = parseConfig(process.env)
