import { AuthRepository, config } from '@synk-cal/core'
import { IAPAuthRepository } from '@synk-cal/google'
import { MockAuthRepository } from '@synk-cal/repository'

export function getAuthRepository(): AuthRepository | undefined {
  if (config.AUTH_PROVIDER === 'google-iap') {
    return new IAPAuthRepository()
  } else if (config.AUTH_PROVIDER === 'mock') {
    const mockEmail = config.AUTH_MOCK_USER || 'test@example.com'
    return new MockAuthRepository({ email: mockEmail })
  }
}
