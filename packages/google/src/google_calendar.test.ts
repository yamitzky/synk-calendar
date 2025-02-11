import { google } from 'googleapis'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GoogleCalendarRepository } from './google_calendar'

vi.mock('googleapis')
vi.mock('@synk-cal/config')

describe('GoogleCalendarRepository', () => {
  let repository: GoogleCalendarRepository

  beforeEach(() => {
    vi.resetAllMocks()
    repository = new GoogleCalendarRepository('test-calendar-id')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getCalendarClient', () => {
    it('creates a new calendar client if one does not exist', async () => {
      const mockAuth = {
        getClient: vi.fn().mockResolvedValue({ subject: '' }),
      }
      const mockCalendar = { version: 'v3', auth: {} }

      // biome-ignore lint/suspicious/noExplicitAny: test
      vi.mocked(google.auth.GoogleAuth).mockReturnValue(mockAuth as any)
      // biome-ignore lint/suspicious/noExplicitAny: test
      vi.mocked(google.calendar).mockReturnValue(mockCalendar as any)

      const client = await repository.getCalendarClient()

      expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      })
      expect(mockAuth.getClient).toHaveBeenCalled()
      expect(google.calendar).toHaveBeenCalledWith({ version: 'v3', auth: expect.any(Object) })
      expect(client).toBe(mockCalendar)
    })
  })

  describe('getEvents', () => {
    it('fetches events from Google Calendar API', async () => {
      const mockEvents = [
        {
          id: '1',
          start: { dateTime: '2023-01-01T09:00:00Z' },
          end: { dateTime: '2023-01-01T10:00:00Z' },
          summary: 'Test Event',
          attendees: [{ email: 'test@example.com', displayName: 'Test User', responseStatus: 'accepted' }],
        },
      ]

      const mockListEvents = vi.fn().mockResolvedValue({ data: { items: mockEvents } })
      const mockCalendar = {
        events: { list: mockListEvents },
      }

      // biome-ignore lint/suspicious/noExplicitAny: test
      vi.spyOn(repository, 'getCalendarClient').mockResolvedValue(mockCalendar as any)

      const minDate = new Date('2023-01-01')
      const maxDate = new Date('2023-01-02')
      const events = await repository.getEvents(minDate, maxDate)

      expect(mockListEvents).toHaveBeenCalledWith({
        calendarId: 'test-calendar-id',
        timeMin: minDate.toISOString(),
        timeMax: maxDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 2500,
      })

      expect(events).toHaveLength(1)
      expect(events[0]).toEqual({
        id: '1',
        start: '2023-01-01T09:00:00Z',
        end: '2023-01-01T10:00:00Z',
        title: 'Test Event',
        people: [
          {
            email: 'test@example.com',
            displayName: 'Test User',
            responseStatus: 'accepted',
            organizer: false,
          },
        ],
        calendarId: 'test-calendar-id',
      })
    })
  })
})
