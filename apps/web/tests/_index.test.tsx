import { getEvents } from '@synk-cal/usecase'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loader } from '../app/routes/_index'

vi.mock('@synk-cal/usecase', () => ({
  getEvents: vi.fn(),
}))

vi.mock('@synk-cal/core', () => ({
  config: {
    CALENDAR_IDS: ['public_calendar_id'],
    PRIVATE_CALENDAR_IDS: ['private_calendar_id'],
  },
}))

// getAuthRepository のモックを変数として定義
const mockGetUserFromHeader = vi.fn()
vi.mock('~/services/getAuthRepository', () => ({
  getAuthRepository: vi.fn(() => ({
    getUserFromHeader: mockGetUserFromHeader,
  })),
}))

vi.mock('~/services/getCalendarRepository', () => ({
  getCalendarRepository: vi.fn(() => ({
    getEvents: vi.fn(),
  })),
}))

vi.mock('~/services/getGroupRepository', () => ({
  getGroupRepository: vi.fn(),
}))

describe('_index', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockGetUserFromHeader.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loader', () => {
    it('should load events with default date range', async () => {
      const request = new Request('http://localhost/')
      vi.mocked(getEvents).mockResolvedValue([])

      const response = await loader({ request, params: {}, context: {} })
      const data = await response.json()

      expect(data).toEqual({
        calendars: [
          { calendarId: 'public_calendar_id', events: [] },
          { calendarId: 'private_calendar_id', events: [] },
        ],
        isMobile: false,
        startDate: expect.any(String),
        endDate: expect.any(String),
        user: undefined,
      })
    })

    it('should load events with specified date range', async () => {
      const request = new Request('http://localhost/?startDate=2025-02-14&endDate=2025-02-21')
      vi.mocked(getEvents).mockResolvedValue([])

      const response = await loader({ request, params: {}, context: {} })
      const data = await response.json()

      expect(data).toEqual({
        calendars: [
          { calendarId: 'public_calendar_id', events: [] },
          { calendarId: 'private_calendar_id', events: [] },
        ],
        isMobile: false,
        startDate: '2025-02-14',
        endDate: '2025-02-21',
        user: undefined,
      })
    })

    it('should detect mobile user agent', async () => {
      const request = new Request('http://localhost/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Mobile/123',
        },
      })
      vi.mocked(getEvents).mockResolvedValue([])

      const response = await loader({ request, params: {}, context: {} })
      const data = await response.json()

      expect(data.isMobile).toBe(true)
    })

    it('should load private calendar events for authenticated user', async () => {
      const request = new Request('http://localhost/')
      const mockUser = { email: 'test@example.com' }
      mockGetUserFromHeader.mockResolvedValue(mockUser)
      vi.mocked(getEvents).mockResolvedValue([])

      const response = await loader({ request, params: {}, context: {} })
      const data = await response.json()

      expect(data.user).toEqual(mockUser)
      expect(getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          attendeeEmail: mockUser.email,
        }),
      )
    })
  })
})
