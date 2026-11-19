import { BookOpenText, Calculator, ExternalLink, Ruler } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { FadeIn, PageHeader, Tile } from '@/components/app/common'
import { MathReference } from '@/components/app/MathReference'
import { Inline } from '@/lib/Markup'
import { PRACTICE_RESOURCES } from '@/data/practice-resources'

const FORMAT = [
  { s: 'Reading & Writing', icon: BookOpenText, q: 54, min: 64, mods: '2 modules · 27 questions · 32 min each' },
  { s: 'Math', icon: Calculator, q: 44, min: 70, mods: '2 modules · 22 questions · 35 min each' },
]

const RW_TIPS = [
  ['Words in Context', "Predict a word for the blank before reading the choices, then match. The right answer fits the passage's logic, not just its topic."],
  ['Command of Evidence', 'Restate the claim in your own words first. The answer must directly support or weaken that specific claim.'],
  ['Inferences', 'Pick what must be true from the passage. If a choice needs outside assumptions, it is wrong.'],
  ['Transitions', 'Name the relationship between the sentences (contrast, cause, example, addition) before looking at the options.'],
  ['Boundaries', 'A semicolon or period needs a complete sentence on both sides. A comma alone cannot join two complete sentences.'],
  ['Rhetorical Synthesis', 'Read the goal in the question first. Ignore the notes until you know exactly what the sentence must do.'],
]

const MATH_TIPS = [
  ['Use Desmos', 'Graph both sides of an equation and look for intersections. Often faster than algebra for systems and quadratics.'],
  ['Plug in numbers', 'When choices contain variables, pick a simple value, compute the target, and test each choice.'],
  ['Backsolve', 'With numeric choices, start from a middle value and test it in the question.'],
  ['Read the last line', 'Many traps answer a different question: solving for $x$ when it asks for $2x + 1$.'],
  ['Grid-in answers', 'Fractions and decimals are both accepted. Negatives are allowed; mixed numbers like 3 1/2 are not.'],
]


export default function Reference() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Reference" title="Know the test cold." description="The format, the formulas you get on test day, and the strategies that win points." />

      <FadeIn>
        <div className="grid gap-4 sm:grid-cols-2">
          {FORMAT.map((f) => (
            <Tile key={f.s} className="p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <p className="font-semibold">{f.s}</p>
              </div>
              <div className="mt-5 flex items-baseline gap-6">
                <p>
                  <span className="font-display text-5xl">{f.q}</span> <span className="text-sm text-muted-foreground">questions</span>
                </p>
                <p>
                  <span className="font-display text-5xl">{f.min}</span> <span className="text-sm text-muted-foreground">minutes</span>
                </p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{f.mods}</p>
            </Tile>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Each section is adaptive: Module 1 performance decides whether Module 2 is harder or easier. Scores run 200–800 per section, 400–1600 total, and
          there’s no penalty for guessing, so answer everything.
        </p>
      </FadeIn>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="size-4 text-primary" /> Math reference sheet
          </CardTitle>
          <CardDescription>Available on every math question during the test.</CardDescription>
        </CardHeader>
        <CardContent>
          <MathReference />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Tips title="Reading & Writing strategies" tips={RW_TIPS} />
        <Tips title="Math strategies" tips={MATH_TIPS} />
      </div>

      <section>
        <h2 className="mb-1 text-lg font-semibold">More practice questions</h2>
        <p className="mb-4 text-sm text-muted-foreground">Official question banks, free quizzes, and extra practice found across the web. Access details are listed with each resource.</p>
        <ItemGroup className="gap-2">
          {PRACTICE_RESOURCES.map((l) => (
            <Item key={l.href} variant="outline" asChild className="bg-card">
              <a href={l.href} target="_blank" rel="noreferrer">
                <ItemContent>
                  <ItemTitle>{l.title}</ItemTitle>
                  <ItemDescription>{l.desc}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ExternalLink className="size-4 text-muted-foreground" />
                </ItemActions>
              </a>
            </Item>
          ))}
        </ItemGroup>
      </section>
    </div>
  )
}

function Tips({ title, tips }: { title: string; tips: string[][] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={[tips[0][0]]}>
          {tips.map(([t, d]) => (
            <AccordionItem key={t} value={t}>
              <AccordionTrigger>{t}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                <Inline text={d} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
