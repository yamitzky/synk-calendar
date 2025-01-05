import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react'
import type { User } from '@synk-cal/core'
import { useEffect, useState } from 'react'
import useLocale from '~/hooks/useLocale'

type Props = {
  user: User
  onClickShowMyEvents?: () => void
  className?: string
}

async function generateSHA256Hash(message: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export function UserInfo({ user, onClickShowMyEvents, className }: Props) {
  let name = user.name
  if (!name) {
    name = user.email.split('@')[0]
  }
  const [imageURL, setImageURL] = useState('')
  useEffect(() => {
    ;(async () => {
      const hash = await generateSHA256Hash(user.email)
      const gravatarURL = `https://www.gravatar.com/avatar/${hash}?d=404`
      setImageURL(gravatarURL)
    })()
  }, [user.email])
  const locale = useLocale()
  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar as="button" name={name} aria-label="User avatar" src={imageURL} className={className} showFallback />
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
