import { GroupRepository, config } from '@synk-cal/core'
import { GoogleGroupRepository } from '@synk-cal/google'

export function getGroupRepository(): GroupRepository | undefined {
  if (config.GROUP_PROVIDER === 'google') {
    return new GoogleGroupRepository()
  }
}
