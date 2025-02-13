import { type Group, type GroupMember, type GroupRepository, config } from '@synk-cal/core'
import { type cloudidentity_v1, google } from 'googleapis'

let cloudIdentityClient: cloudidentity_v1.Cloudidentity | null = null

export class GoogleGroupRepository implements GroupRepository {
  async clearCloudIdentityClient() {
    cloudIdentityClient = null
  }

  async getCloudIdentityClient() {
    if (cloudIdentityClient) {
      return cloudIdentityClient
    }

    // Google Cloud Identity API setup
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/cloud-identity.groups.readonly',
        'https://www.googleapis.com/auth/cloud-identity.users.readonly',
      ],
    })

    const authClient = await auth.getClient()
    // @ts-expect-error
    cloudIdentityClient = google.cloudidentity({ version: 'v1', auth: authClient })

    return cloudIdentityClient
  }

  async getGroups(): Promise<Group[]> {
    const client = await this.getCloudIdentityClient()

    const response = await client.groups.list({
      parent: `customers/${config.GROUP_CUSTOMER_ID}`,
      view: 'BASIC',
      // FIXME: handle pagination
      pageSize: 1000,
    })

    const groups = response.data.groups || []

    return groups.map((group) => ({
      id: group.name ?? '',
      email: group.groupKey?.id ?? '',
      name: group.displayName ?? '',
      description: group.description ?? undefined,
    }))
  }

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const client = await this.getCloudIdentityClient()

    const response = await client.groups.memberships.list({
      parent: groupId,
      // FIXME: handle pagination
      pageSize: 1000,
    })

    const memberships = response.data.memberships || []

    return memberships.map((membership) => ({
      id: membership.name ?? '',
      email: membership.preferredMemberKey?.id ?? '',
      type: membership.type ?? '',
    }))
  }
}
