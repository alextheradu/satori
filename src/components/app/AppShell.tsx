import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useTheme } from 'next-themes'
import { BookMarked, ClipboardList, CloudUpload, Dumbbell, LayoutDashboard, LogOut, Menu, Monitor, Moon, RotateCcw, Settings, Sun, Timer } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { hasStarted, signOut, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Logo } from './common'
import { UserAvatar } from './UserAvatar'

const NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/tests', label: 'Tests', icon: Timer },
  { to: '/review', label: 'Review', icon: RotateCcw },
  { to: '/reference', label: 'Reference', icon: BookMarked },
]

export function AppShell() {
  const active = useStore((s) => s.active)
  const loc = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
  }, [loc.pathname])

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <header className="chrome-translucent sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-0.5 rounded-full border border-border/70 bg-card/60 p-1 shadow-xs md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <SyncIndicator />
            <ThemeMenu />
            <UserMenu />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon-lg" className="md:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-3">
                  {NAV.map((n) => (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      end={n.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted',
                        )
                      }
                    >
                      <n.icon className="size-4" />
                      {n.label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {hasStarted(active) && (
        <div className="border-b border-warning/30 bg-warning/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm sm:px-6">
            <span className="flex items-center gap-2">
              <ClipboardList className="size-4 text-warning-ink" />
              Unfinished test: <strong className="font-semibold">{active.title}</strong>
            </span>
            <Button asChild size="sm" variant="outline">
              <Link to="/tests/run">Resume</Link>
            </Button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Progress syncs to your account.</p>
          <p className="text-xs">SAT® is a trademark of the College Board, not affiliated with this site.</p>
        </div>
      </footer>
    </div>
  )
}

export function ThemeMenu() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-lg" aria-label="Change theme">
          {resolvedTheme === 'dark' ? <Moon /> : <Sun />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu() {
  const user = useStore((s) => s.user)
  if (!user) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="rounded-full" aria-label="Account menu">
          <UserAvatar user={user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium">{user.name ?? 'Hack Clubber'}</p>
          {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SyncIndicator() {
  const pending = useStore((s) => s.pending)
  if (!pending) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="grid size-9 place-items-center text-muted-foreground" aria-label="Saving changes">
          <CloudUpload className="size-4 animate-pulse" />
        </span>
      </TooltipTrigger>
      <TooltipContent>Saving {pending} change{pending === 1 ? '' : 's'}…</TooltipContent>
    </Tooltip>
  )
}
