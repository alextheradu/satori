import { lazy, Suspense, type ReactNode } from 'react'
import { RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { useStore } from '@/lib/store'

const Landing = lazy(() => import('@/pages/Landing'))

/** Renders children only for signed-in users; otherwise the landing page. */
export function Gate({ children }: { children: ReactNode }) {
  const status = useStore((s) => s.status)
  if (status === 'loading')
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  if (status === 'error')
    return (
      <div className="grid min-h-dvh place-items-center px-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WifiOff />
            </EmptyMedia>
            <EmptyTitle>Can’t reach Satori</EmptyTitle>
            <EmptyDescription>Check your connection, then try again.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw /> Retry
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  if (status === 'anon')
    return (
      <Suspense fallback={<div className="min-h-dvh" />}>
        <Landing />
      </Suspense>
    )
  return <>{children}</>
}
