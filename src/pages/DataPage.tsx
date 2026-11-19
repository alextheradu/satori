import { useRef } from 'react'
import { Download, Trash2, Upload } from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/app/common'
import { exportData, importData, resetAll, useStore } from '@/lib/store'

export default function DataPage() {
  const attempts = useStore((s) => s.attempts)
  const tests = useStore((s) => s.tests)
  const bookmarks = useStore((s) => s.bookmarks)
  const file = useRef<HTMLInputElement>(null)

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `satori-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('Backup downloaded')
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    try {
      await importData(await f.text())
      toast.success('Backup merged into your account')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not read that file.')
    }
    if (file.current) file.current.value = ''
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Your data"
        title="Backup & reset"
        description="Your progress is saved to your Hack Club account. Download a copy any time, or merge in a backup file."
      />
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Download backup</CardTitle>
            <CardDescription>
              {attempts.length} answers, {tests.length} tests, {bookmarks.length} saved questions.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={download}>
              <Download /> Download .json
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Restore backup</CardTitle>
            <CardDescription>Merges a Satori backup file into your account. Nothing is overwritten.</CardDescription>
          </CardHeader>
          <CardFooter>
            <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <Button variant="outline" onClick={() => file.current?.click()}>
              <Upload /> Choose file
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Reset everything</CardTitle>
            <CardDescription>Deletes all answers, saved questions and test history from your account. Your sign-in stays.</CardDescription>
          </CardHeader>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 /> Reset progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes {attempts.length} answers and {tests.length} tests from your account. Download a backup first if you might want
                    them back.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() =>
                      resetAll().then(
                        () => toast('All progress deleted'),
                        () => toast.error('Could not reset. Check your connection and try again.'),
                      )
                    }
                  >
                    Delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
