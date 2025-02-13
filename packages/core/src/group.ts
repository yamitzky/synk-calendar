export interface Group {
  id: string
  email: string
  name: string
  description?: string
}

export interface GroupMember {
  id: string
  email: string
  type: string
}

export interface GroupRepository {
  getGroups(): Promise<Group[]>
  getGroupMembers(groupId: string): Promise<GroupMember[]>
}
