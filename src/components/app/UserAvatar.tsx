import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User } from '@/lib/store'
import { cn } from '@/lib/utils'

/** Hack Club Slack avatar via Cachet (redirects to the current Slack profile picture). */
const avatarUrl = (slackId: string) => `https://cachet.dunkirk.sh/users/${encodeURIComponent(slackId)}/r`

function initials(name: string | null, email: string | null) {
  const src = name || email || '?'
  const parts = src.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function UserAvatar({ user, className, fallbackClassName }: { user: User; className?: string; fallbackClassName?: string }) {
  return (
    <Avatar className={cn('size-8', className)}>
      {user.slackId && <AvatarImage src={avatarUrl(user.slackId)} alt="" referrerPolicy="no-referrer" />}
      <AvatarFallback className={cn('bg-primary/15 text-xs font-semibold text-primary', fallbackClassName)}>
        {initials(user.name, user.email)}
      </AvatarFallback>
    </Avatar>
  )
}
