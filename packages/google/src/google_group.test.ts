import { google } from 'googleapis'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GoogleGroupRepository } from './google_group'

vi.mock('googleapis', async () => {
  const actual = await vi.importActual('googleapis')
  return {
    ...actual,
    google: {
      // @ts-expect-error
      ...actual.google,
      auth: {
        GoogleAuth: vi.fn().mockImplementation(() => ({
          getClient: vi.fn().mockResolvedValue({}),
        })),
      },
      cloudidentity: vi.fn(),
    },
  }
})

describe('GoogleGroupRepository', () => {
  let repository: GoogleGroupRepository

  beforeEach(() => {
    repository = new GoogleGroupRepository()
    repository.clearCloudIdentityClient()
    vi.clearAllMocks()
  })

  it('should get the same Cloud Identity client instance', async () => {
    const client1 = await repository.getCloudIdentityClient()
    const client2 = await repository.getCloudIdentityClient()

    expect(client1).toBe(client2)
  })

  it('should get groups', async () => {
    const mockGroupsList = vi.fn().mockResolvedValue({
      data: {
        groups: [
          {
            name: 'group1',
            groupKey: { id: 'group1@example.com' },
            displayName: 'Group 1',
            description: 'Description 1',
          },
        ],
      },
    })
    // @ts-expect-error
    google.cloudidentity.mockReturnValue({
      groups: {
        list: mockGroupsList,
      },
    })

    const groups = await repository.getGroups()

    expect(groups).toEqual([
      {
        id: 'group1',
        email: 'group1@example.com',
        name: 'Group 1',
        description: 'Description 1',
      },
    ])
    expect(mockGroupsList).toHaveBeenCalledWith({
      parent: expect.any(String),
      view: 'BASIC',
      pageSize: 1000,
    })
  })

  it('should get group members', async () => {
    const mockMembershipsList = vi.fn().mockResolvedValue({
      data: {
        memberships: [
          {
            name: 'member1',
            preferredMemberKey: { id: 'member1@example.com' },
            type: 'USER',
          },
        ],
      },
    })
    // @ts-expect-error
    google.cloudidentity.mockReturnValue({
      groups: {
        memberships: {
          list: mockMembershipsList,
        },
      },
    })

    const members = await repository.getGroupMembers('group1')

    expect(members).toEqual([
      {
        id: 'member1',
        email: 'member1@example.com',
        type: 'USER',
      },
    ])
    expect(mockMembershipsList).toHaveBeenCalledWith({
      parent: 'group1',
      pageSize: 1000,
    })
  })
})
