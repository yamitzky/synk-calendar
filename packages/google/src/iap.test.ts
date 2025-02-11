import { describe, expect, it, vi } from 'vitest'
import { IAPAuthRepository } from './iap'

describe('IAPAuthRepository', () => {
  it('should return undefined when no assertion header is present', async () => {
    const headers = new Headers()
    const user = await new IAPAuthRepository().getUserFromHeader(headers)
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

    const user = await new IAPAuthRepository().getUserFromHeader(headers)
    expect(user).toEqual({ email: 'test@example.com' })
  })
})
