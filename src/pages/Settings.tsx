import { useState, type ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { LogOut, Monitor, Moon, Sun, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PageHeader } from '@/components/app/common'
import { UserAvatar } from '@/components/app/UserAvatar'
import { resetAll, signOut, useStore } from '@/lib/store'

export default function Settings() {
  const user = useStore((s) => s.user)
  const counts = {
    attempts: useStore((s) => s.attempts.length),
    tests: useStore((s) => s.tests.length),
    saved: useStore((s) => s.bookmarks.length),
  }
  const { theme, setTheme } = useTheme()
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  const reset = async () => {
    setBusy(true)
    try {
      await resetAll()
      toast.success('Progress reset')
      setConfirm(false)
    } catch {
      toast.error('Reset failed. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" />

      <div className="flex flex-col gap-10">
        <Section title="Account">
          {user && (
            <div className="flex flex-wrap items-center gap-4">
              <UserAvatar user={user} className="size-14" fallbackClassName="text-base" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{user.name ?? 'Hack Clubber'}</p>
                {user.email && <p className="truncate text-sm text-muted-foreground">{user.email}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {user.slackId ? 'Profile picture synced from your Hack Club Slack.' : 'Link Slack to your Hack Club account to show your profile picture.'}
                </p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => void signOut()}>
                <LogOut /> Sign out
              </Button>
            </div>
          )}
        </Section>

        <Section title="Appearance" description="Timed tests always use the light test-day screen.">
          <ToggleGroup type="single" variant="outline" value={theme ?? 'system'} onValueChange={(v) => v && setTheme(v)}>
            <ToggleGroupItem value="light" className="px-4">
              <Sun /> Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" className="px-4">
              <Moon /> Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="system" className="px-4">
              <Monitor /> System
            </ToggleGroupItem>
          </ToggleGroup>
        </Section>

        <Section title="Danger zone">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-destructive/30 p-5">
            <div className="max-w-sm">
              <p className="font-medium">Reset all progress</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Permanently deletes {counts.attempts} answers, {counts.tests} tests and {counts.saved} saved questions, and restarts your streak.
              </p>
            </div>
            <Button variant="destructive" className="rounded-full" onClick={() => setConfirm(true)}>
              <Trash2 /> Reset progress
            </Button>
          </div>
        </Section>
      </div>

      <AlertDialog open={confirm} onOpenChange={(o) => !busy && setConfirm(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes every answer, test and saved question from your account. It can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault()
                void reset()
              }}
            >
              {busy ? 'Deleting…' : 'Delete everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}
