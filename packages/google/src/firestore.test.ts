import type { Firestore } from '@google-cloud/firestore'
import type { ReminderSetting } from '@synk-cal/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FirestoreReminderSettingsRepository } from './firestore'

// Create Firestore mocks
vi.mock('@google-cloud/firestore', () => {
  const mockSet = vi.fn()
  const mockGet = vi.fn()
  const mockDoc = vi.fn(() => ({
    get: mockGet,
    set: mockSet,
  }))
  const mockCollection = vi.fn(() => ({
    doc: mockDoc,
  }))

  return {
    Firestore: vi.fn(() => ({
      collection: mockCollection,
    })),
  }
})

describe('FirestoreService', () => {
  let firestoreService: FirestoreReminderSettingsRepository
  const mockUserEmail = 'test@example.com'
  const mockReminders: ReminderSetting[] = [
    {
      minutesBefore: 30,
      notificationType: 'email',
      target: 'test@example.com',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    firestoreService = new FirestoreReminderSettingsRepository()
  })

  describe('getReminderSettings', () => {
    it('should successfully retrieve reminder settings', async () => {
      const mockData = {
        reminders: mockReminders,
      }
      const mockGet = vi.fn().mockResolvedValue({
        data: () => mockData,
      })

      const mockFirestore = firestoreService['firestore'] as Firestore
      const mockCollectionResult = vi.mocked(mockFirestore.collection('users'))
      const mockDocResult = vi.mocked(mockCollectionResult.doc(mockUserEmail))
      vi.mocked(mockDocResult.get).mockImplementation(mockGet)

      const result = await firestoreService.getReminderSettings(mockUserEmail)

      expect(result).toEqual(mockReminders)
      expect(mockFirestore.collection).toHaveBeenCalledWith('users')
      expect(mockCollectionResult.doc).toHaveBeenCalledWith(mockUserEmail)
      expect(mockGet).toHaveBeenCalled()
    })

    it('should return empty array when no reminder settings exist', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: () => ({}),
      })

      const mockFirestore = firestoreService['firestore'] as Firestore
      const mockCollectionResult = vi.mocked(mockFirestore.collection('users'))
      const mockDocResult = vi.mocked(mockCollectionResult.doc(mockUserEmail))
      vi.mocked(mockDocResult.get).mockImplementation(mockGet)

      const result = await firestoreService.getReminderSettings(mockUserEmail)

      expect(result).toEqual([])
    })

    it('should throw error when data retrieval fails', async () => {
      const mockError = new Error('Firestore error')
      const mockGet = vi.fn().mockRejectedValue(mockError)

      const mockFirestore = firestoreService['firestore'] as Firestore
      const mockCollectionResult = vi.mocked(mockFirestore.collection('users'))
      const mockDocResult = vi.mocked(mockCollectionResult.doc(mockUserEmail))
      vi.mocked(mockDocResult.get).mockImplementation(mockGet)

      await expect(firestoreService.getReminderSettings(mockUserEmail)).rejects.toThrow('Firestore error')
    })
  })

  describe('updateReminderSettings', () => {
    it('should successfully update reminder settings', async () => {
      const mockSet = vi.fn().mockResolvedValue(undefined)

      const mockFirestore = firestoreService['firestore'] as Firestore
      const mockCollectionResult = vi.mocked(mockFirestore.collection('users'))
      const mockDocResult = vi.mocked(mockCollectionResult.doc(mockUserEmail))
      vi.mocked(mockDocResult.set).mockImplementation(mockSet)

      await firestoreService.updateReminderSettings(mockUserEmail, mockReminders)

      expect(mockFirestore.collection).toHaveBeenCalledWith('users')
      expect(mockCollectionResult.doc).toHaveBeenCalledWith(mockUserEmail)
      expect(mockSet).toHaveBeenCalledWith({ reminders: mockReminders }, { merge: true })
    })

    it('should throw error when update fails', async () => {
      const mockError = new Error('Firestore error')
      const mockSet = vi.fn().mockRejectedValue(mockError)

      const mockFirestore = firestoreService['firestore'] as Firestore
      const mockCollectionResult = vi.mocked(mockFirestore.collection('users'))
      const mockDocResult = vi.mocked(mockCollectionResult.doc(mockUserEmail))
      vi.mocked(mockDocResult.set).mockImplementation(mockSet)

      await expect(firestoreService.updateReminderSettings(mockUserEmail, mockReminders)).rejects.toThrow(
        'Firestore error',
      )
    })
  })
})
