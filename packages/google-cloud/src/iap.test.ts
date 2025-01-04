import { describe, expect, it, vi } from 'vitest'
import { extractUserFromHeader } from './iap'

describe('extractUserFromHeader', () => {
  it('should return undefined when no assertion header is present', async () => {
    const headers = new Headers()
    const user = await extractUserFromHeader(headers)
    expect(user).toBeUndefined()
  })

  it('should return user when valid assertion is present', async () => {
    const headers = new Headers({
      'x-goog-iap-jwt-assertion': 'valid.jwt.token',
    })

    // Mock validateAssertion internal function result
    vi.mock('google-auth-library', () => ({
      OAuth2Client: vi.fn().mockImplementation(() => ({
        getIapPublicKeys: vi.fn().mockResolvedValue({ pubkeys: {} }),
        verifySignedJwtWithCertsAsync: vi.fn().mockResolvedValue({
          getPayload: () => ({ email: 'test@example.com' }),
        }),
      })),
    }))

    const user = await extractUserFromHeader(headers)
    expect(user).toEqual({ email: 'test@example.com' })
  })
})
