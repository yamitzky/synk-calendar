import {
  type CalendarEvent,
  type CalendarRepository,
  type Group,
  type GroupMember,
  type GroupRepository,
} from '@synk-cal/core'
import { describe, expect, it, vi } from 'vitest'
import { getEvents } from './get_events'

describe('getEvents', () => {
  const mockEvent: CalendarEvent = {
    id: 'event1',
    title: 'Test Event',
    start: '2025-02-13T10:00:00Z',
    end: '2025-02-13T11:00:00Z',
    people: [
      { email: 'user1@example.com', responseStatus: 'accepted', organizer: true },
      { email: 'group1@example.com', responseStatus: 'needsAction', organizer: false },
    ],
  }

  const mockGroup: Group = {
    id: 'group1',
    email: 'group1@example.com',
    name: 'Test Group',
  }

  const mockGroupMembers: GroupMember[] = [
    { id: 'member1', email: 'member1@example.com', type: 'USER' },
    { id: 'member2', email: 'member2@example.com', type: 'USER' },
  ]

  const createMockGroupRepository = (): GroupRepository => ({
    getGroups: vi.fn().mockResolvedValue([mockGroup]),
    getGroupMembers: vi.fn().mockResolvedValue(mockGroupMembers),
  })

  const mockCalendarRepository: CalendarRepository = {
    getEvents: vi.fn().mockResolvedValue([mockEvent]),
  }

  it('should fetch events without group expansion when no groupRepository is provided', async () => {
    const minDate = new Date('2025-02-13T00:00:00Z')
    const maxDate = new Date('2025-02-14T00:00:00Z')

    const events = await getEvents({
      calendarRepository: mockCalendarRepository,
      minDate,
      maxDate,
    })

    expect(mockCalendarRepository.getEvents).toHaveBeenCalledWith(minDate, maxDate)
    expect(events).toHaveLength(1)
    expect(events[0]?.people).toEqual(mockEvent.people)
  })

  it('should expand group members when groupRepository is provided', async () => {
    const minDate = new Date('2025-02-13T00:00:00Z')
    const maxDate = new Date('2025-02-14T00:00:00Z')
    const mockGroupRepository = createMockGroupRepository()

    const events = await getEvents({
      calendarRepository: mockCalendarRepository,
      groupRepository: mockGroupRepository,
      minDate,
      maxDate,
    })

    expect(mockGroupRepository.getGroups).toHaveBeenCalled()
    expect(mockGroupRepository.getGroupMembers).toHaveBeenCalledWith(mockGroup.id)
    expect(events[0]?.people).toEqual([
      mockEvent.people[0],
      ...mockGroupMembers.map((member) => ({
        email: member.email,
        responseStatus: 'needsAction',
        organizer: false,
      })),
    ])
  })

  it('should use cached group members for subsequent events', async () => {
    const minDate = new Date('2025-02-13T00:00:00Z')
    const maxDate = new Date('2025-02-14T00:00:00Z')

    const mockEventWithSameGroup: CalendarEvent = {
      ...mockEvent,
      id: 'event2',
    }

    const mockCalendarRepositoryWithMultipleEvents: CalendarRepository = {
      getEvents: vi.fn().mockResolvedValue([mockEvent, mockEventWithSameGroup]),
    }

    // Create a fresh mock repository for this test
    const mockGroupRepository = createMockGroupRepository()

    await getEvents({
      calendarRepository: mockCalendarRepositoryWithMultipleEvents,
      groupRepository: mockGroupRepository,
      minDate,
      maxDate,
    })

    // getGroupMembers should only be called once despite having two events with the same group
    expect(mockGroupRepository.getGroupMembers).toHaveBeenCalledTimes(1)
  })

  it('should handle errors when expanding group members', async () => {
    const minDate = new Date('2025-02-13T00:00:00Z')
    const maxDate = new Date('2025-02-14T00:00:00Z')

    const mockGroupRepositoryWithError: GroupRepository = {
      getGroups: vi.fn().mockResolvedValue([mockGroup]),
      getGroupMembers: vi.fn().mockRejectedValue(new Error('Failed to fetch group members')),
    }

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation((message) => {
      // Prevent actual console.error from being called during tests
    })

    const events = await getEvents({
      calendarRepository: mockCalendarRepository,
      groupRepository: mockGroupRepositoryWithError,
      minDate,
      maxDate,
    })

    expect(consoleSpy).toHaveBeenCalled()
    // Should fallback to original attendee
    expect(events[0]?.people).toEqual(mockEvent.people)

    consoleSpy.mockRestore()
  })
})
