import { Avatar } from '@nextui-org/react'
import type { User } from '@synk-cal/core'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  user: User
  onClick?: () => void
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

export function UserInfo({ user, onClick, className }: Props) {
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
  return (
    <Avatar
      name={name}
      aria-label="User avatar"
      src={imageURL}
      showFallback
      className={twMerge(className, onClick ? 'cursor-pointer' : '')}
      onClick={onClick}
    />
  )
}
