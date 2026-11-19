import { Link } from 'react-router'
import { ArrowRight, Bookmark, Check, History, PartyPopper, RotateCcw, X } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DifficultyBadge, PageHeader } from '@/components/app/common'
import { BookmarkToggle, Explanation, QuestionView } from '@/components/app/QuestionView'
import { BY_ID } from '@/data/bank'
import { SECTION_LABEL } from '@/lib/grading'
import { idsUrl } from '@/lib/practice'
import { latestByQuestion, useStore, type Attempt } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function Review() {
  const attempts = useStore((s) => s.attempts)
  const bookmarks = useStore((s) => s.bookmarks)

  const latest = latestByQuestion(attempts)
  const missed = [...latest.values()].filter((a) => !a.correct).reverse()
  const saved = bookmarks
    .filter((id) => BY_ID.has(id))
    .map((id) => latest.get(id) ?? ({ qid: id, correct: false, answer: null, ts: 0, ms: 0, mode: 'practice' } as Attempt))
  const history = [...attempts].reverse().slice(0, 200)

  return (
    <div>
      <PageHeader eyebrow="Review" title="Turn misses into points." description="Your most recent wrong answers, saved questions, and full history, each with its explanation." />

      <Tabs defaultValue="missed">
        <TabsList className="mb-6">
          <TabsTrigger value="missed">
            <RotateCcw /> Missed <Badge variant="secondary" className="ml-1 h-5 px-1.5 font-mono">{missed.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Bookmark /> Saved <Badge variant="secondary" className="ml-1 h-5 px-1.5 font-mono">{saved.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="history">
            <History /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missed">
          <List
            items={missed}
            empty={{ icon: PartyPopper, title: 'Nothing to fix right now', text: 'Questions you get wrong show up here until you answer them correctly.' }}
            practice
          />
        </TabsContent>
        <TabsContent value="saved">
          <List items={saved} empty={{ icon: Bookmark, title: 'No saved questions', text: 'Tap the bookmark on any question to collect it here.' }} practice />
        </TabsContent>
        <TabsContent value="history">
          <List items={history} empty={{ icon: History, title: 'No answers yet', text: 'Start a practice session to build your history.' }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function List({ items, empty, practice }: { items: Attempt[]; empty: { icon: typeof History; title: string; text: string }; practice?: boolean }) {
  if (!items.length)
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <empty.icon />
          </EmptyMedia>
          <EmptyTitle>{empty.title}</EmptyTitle>
          <EmptyDescription>{empty.text}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  const ids = [...new Set(items.map((a) => a.qid))].slice(0, 50)
  return (
    <div className="flex flex-col gap-4">
      {practice && (
        <Button asChild className="self-start rounded-full">
          <Link to={idsUrl(ids)}>
            Practice these {ids.length} <ArrowRight />
          </Link>
        </Button>
      )}
      <Card className="py-0">
        <Accordion type="single" collapsible>
          {items.map((a, n) => {
            const q = BY_ID.get(a.qid)
            if (!q) return null
            const unseen = a.ts === 0
            return (
              <AccordionItem key={`${a.qid}-${n}`} value={`${a.qid}-${n}`} className="px-4 sm:px-5">
                <AccordionTrigger className="items-center gap-3 hover:no-underline">
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    {!unseen && (
                      <span className={cn('grid size-6 shrink-0 place-items-center rounded-full', a.correct ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                        {a.correct ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                      </span>
                    )}
                    <span className="truncate font-normal">{q.skill}</span>
                  </span>
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {SECTION_LABEL[q.section]}
                  </Badge>
                  <DifficultyBadge d={q.difficulty} />
                  {!unseen && <span className="hidden w-20 text-right font-mono text-xs text-muted-foreground md:inline">{new Date(a.ts).toLocaleDateString()}</span>}
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                  <div className="rounded-xl border bg-background p-4 sm:p-6">
                    <QuestionView q={q} answer={a.answer} onAnswer={() => {}} reveal={!unseen} toolbar={<BookmarkToggle qid={q.id} />} />
                    {!unseen && <Explanation q={q} answer={a.answer} />}
                    <Button asChild variant="link" className="mt-3 px-0">
                      <Link to={idsUrl([q.id])}>
                        Try it again <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </Card>
    </div>
  )
}
