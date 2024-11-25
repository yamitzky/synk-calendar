import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WebhookNotificationRepository } from './webhook_notification'

// グローバルな fetch をモック化
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('WebhookNotificationRepository', () => {
  let repository: WebhookNotificationRepository

  beforeEach(() => {
    repository = new WebhookNotificationRepository('https://example.com.local/webhook')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should send a POST request to the webhook URL', async () => {
    const mockResponse = { ok: true }
    mockFetch.mockResolvedValueOnce(mockResponse)

    const target = 'user1'
    const payload = 'Test message'

    await repository.notify(target, payload)

    expect(mockFetch).toHaveBeenCalledWith('https://example.com.local/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target,
        message: payload,
      }),
    })
  })

  it('should throw an error if the webhook request fails', async () => {
    const mockResponse = { ok: false, statusText: 'Internal Server Error' }
    mockFetch.mockResolvedValueOnce(mockResponse)

    const target = 'user1'
    const payload = 'Test message'

    await expect(repository.notify(target, payload)).rejects.toThrow(
      'Webhook notification failed: Internal Server Error',
    )
  })
})
