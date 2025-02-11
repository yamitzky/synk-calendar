import { processReminders } from '@synk-cal/usecase'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { action } from '../app/routes/process_reminder'

vi.mock('@synk-cal/usecase', () => ({
  processReminders: vi.fn(),
}))

vi.mock('@synk-cal/core', () => ({
  config: {
    CALENDAR_IDS: ['test_calendar_id'],
    WEBHOOK_URL: 'https://test-webhook.com',
    CALENDAR_PROVIDER: 'google',
    REMINDER_SETTINGS_PROVIDER: 'firestore',
  },
}))

describe('process_reminder action', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return 405 for non-POST requests', async () => {
    const request = new Request('http://localhost/process_reminder', { method: 'GET' })
    const response = (await action({ request, params: {}, context: {} })) as Response
    expect(response.status).toBe(405)
    expect(await response.json()).toEqual({ error: 'Method not allowed' })
  })

  it('should process reminders with X-CloudScheduler-ScheduleTime header', async () => {
    const scheduleTime = new Date().toISOString()
    const request = new Request('http://localhost/process_reminder', {
      method: 'POST',
      headers: { 'X-CloudScheduler-ScheduleTime': scheduleTime },
    })

    vi.mocked(processReminders).mockResolvedValue(undefined)

    const response = (await action({ request, params: {}, context: {} })) as Response
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })

    expect(processReminders).toHaveBeenCalledWith(
      expect.any(Date),
      expect.arrayContaining([expect.any(Object)]),
      expect.objectContaining({
        console: expect.any(Object),
        webhook: expect.any(Object),
      }),
      expect.any(Object),
    )
  })

  it('should process reminders with baseTime in request body', async () => {
    const baseTime = new Date().toISOString()
    const request = new Request('http://localhost/process_reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseTime }),
    })

    vi.mocked(processReminders).mockResolvedValue(undefined)

    const response = (await action({ request, params: {}, context: {} })) as Response
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })

    expect(processReminders).toHaveBeenCalledWith(
      expect.any(Date),
      expect.arrayContaining([expect.any(Object)]),
      expect.objectContaining({
        console: expect.any(Object),
        webhook: expect.any(Object),
      }),
      expect.any(Object),
    )
  })

  it('should return 400 for invalid baseTime', async () => {
    const request = new Request('http://localhost/process_reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseTime: 'invalid-date' }),
    })

    const response = (await action({ request, params: {}, context: {} })) as Response
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid baseTime or X-CloudScheduler-ScheduleTime' })
  })

  it('should return 500 when processReminders throws an error', async () => {
    const request = new Request('http://localhost/process_reminder', {
      method: 'POST',
      headers: { 'X-CloudScheduler-ScheduleTime': new Date().toISOString() },
    })

    vi.mocked(processReminders).mockRejectedValue(new Error('Test error'))

    const response = (await action({ request, params: {}, context: {} })) as Response
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
  })
})
