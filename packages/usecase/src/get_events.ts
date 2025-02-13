import { type CalendarEvent, type CalendarRepository, Group, GroupMember, type GroupRepository } from '@synk-cal/core'

interface GetEventsUseCaseParams {
  calendarRepository: CalendarRepository
  groupRepository?: GroupRepository
  attendeeEmail?: string
  minDate: Date
  maxDate: Date
}

export const getEvents = async ({
  calendarRepository,
  groupRepository,
  attendeeEmail,
  minDate,
  maxDate,
}: GetEventsUseCaseParams): Promise<CalendarEvent[]> => {
  const events = await calendarRepository.getEvents(minDate, maxDate)

  let expandedEvents: CalendarEvent[] = []

  const groupCache: Record<string, { group: Group; members?: GroupMember[] }> = {}
  if (groupRepository) {
    const groups = await groupRepository.getGroups()
    for (const group of groups) {
      // members are fetched lazily
      groupCache[group.email] = { group }
    }
  }

  for (const event of events) {
    const expandedAttendees = []
    for (const attendee of event.people) {
      const cachedGroup = attendee.email ? groupCache[attendee.email] : undefined
      if (cachedGroup && groupRepository) {
        try {
          let groupMembers: GroupMember[]
          if (cachedGroup.members) {
            groupMembers = cachedGroup.members
          } else {
            groupMembers = await groupRepository.getGroupMembers(cachedGroup.group.id)
            groupCache[cachedGroup.group.email] = { ...cachedGroup, members: groupMembers }
          }
          for (const member of groupMembers) {
            expandedAttendees.push({
              email: member.email,
              responseStatus: attendee.responseStatus,
              organizer: false,
            })
          }
        } catch (error) {
          // fallback
          console.error(`Error expanding group ${attendee.email}:`, error)
          expandedAttendees.push(attendee)
        }
      } else {
        expandedAttendees.push(attendee)
      }
    }

    expandedEvents.push({
      ...event,
      people: expandedAttendees,
    })
  }

  if (attendeeEmail) {
    expandedEvents = expandedEvents.filter((e) => e.people.some((p) => p.email === attendeeEmail))
  }

  return expandedEvents
}
