import { User } from '@synk-cal/core'

/**
 * Mock implementation of AuthRepository that returns a dummy user
 * with a specified email address
 */
export class MockAuthRepository {
  email: string
  constructor({ email = 'test@example.com' }: { email: string }) {
    this.email = email
  }

  async getUserFromHeader(_headers: Headers): Promise<User | undefined> {
    // Always return the configured user
    return {
      email: this.email,
      name: `Test User (${this.email})`,
    }
  }
}
