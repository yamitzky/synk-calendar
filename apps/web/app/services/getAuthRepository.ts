import { AuthRepository, config } from '@synk-cal/core'
import { IAPAuthRepository } from '@synk-cal/google'

export function getAuthRepository(): AuthRepository | undefined {
  if (config.AUTH_PROVIDER === 'google-iap') {
    return new IAPAuthRepository()
  }
}
