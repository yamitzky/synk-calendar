import { Firestore, Settings } from '@google-cloud/firestore'
import type { ReminderSetting } from '@synk-cal/core'

export class FirestoreReminderSettingsRepository {
  private firestore: Firestore

  constructor(settings?: Settings) {
    this.firestore = new Firestore(settings)
  }

  async getReminderSettings(userKey: string): Promise<ReminderSetting[]> {
    const doc = await this.firestore.collection('users').doc(userKey).get()
    const data = doc.data()
    return data?.reminders || []
  }

  async updateReminderSettings(userKey: string, reminders: ReminderSetting[]): Promise<void> {
    await this.firestore.collection('users').doc(userKey).set({ reminders }, { merge: true })
  }
}
