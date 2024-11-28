import type { NotificationRepository } from '@synk-cal/core'

export class ConsoleNotificationRepository implements NotificationRepository<string> {
  /**
   * This is a CLI notification repository for test purposes.
   */

  async notify(target: string, payload: string): Promise<void> {
    console.log('---------')
    console.log(`target: ${target}`)
    console.log(`payload: ${payload}`)
    console.log('---------')
  }
}
