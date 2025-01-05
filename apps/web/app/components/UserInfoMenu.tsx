import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react'
import type { User } from '@synk-cal/core'
import { UserInfo } from '~/components/UserInfo'
import useLocale from '~/hooks/useLocale'

type Props = {
  user: User
  onClickShowMyEvents?: () => void
  className?: string
}

export function UserInfoMenu({ user, onClickShowMyEvents, className }: Props) {
  const locale = useLocale()

  return (
    <Dropdown>
      <DropdownTrigger>
        <UserInfo user={user} className={className} as="button" />
      </DropdownTrigger>
      <DropdownMenu aria-label="User actions">
        <DropdownItem key="setting" href="/settings">
          {locale === 'ja' ? '設定' : 'Settings'}
        </DropdownItem>
        {onClickShowMyEvents ? (
          <DropdownItem key="search" onClick={onClickShowMyEvents}>
            {locale === 'ja' ? '自分のイベント' : 'My Events'}
          </DropdownItem>
        ) : (
          <></>
        )}
      </DropdownMenu>
    </Dropdown>
  )
}
