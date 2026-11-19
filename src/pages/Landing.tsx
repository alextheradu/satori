import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { BarChart3, BookOpenText, Brain, Calculator, Cloud, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FadeIn, Logo } from '@/components/app/common'
import { ThemeMenu } from '@/components/app/AppShell'
import { QUESTIONS } from '@/data/bank'
import { signIn } from '@/lib/store'

const FEATURES = [
  { icon: Timer, title: 'Adaptive timed tests', text: 'Modules timed like test day. How you do on Module 1 decides how hard Module 2 is.' },
  { icon: Brain, title: 'Smart practice', text: 'Missed questions come back first, then ones you haven’t seen, so practice targets your gaps.' },
  { icon: BarChart3, title: 'Score estimates', text: 'Section scores, domain-by-domain mastery, and the skills to drill next.' },
  { icon: BookOpenText, title: 'Every RW skill', text: 'Words in context, evidence, inferences, transitions, boundaries and more.' },
  { icon: Calculator, title: 'Every math domain', text: 'Algebra through trig, with grid-ins, a reference sheet and Desmos one click away.' },
  { icon: Cloud, title: 'Synced to your account', text: 'Sign in with Hack Club and your progress follows you to any device.' },
]

export function HackClubButton({ size = 'lg', label = 'Sign in with Hack Club' }: { size?: 'lg' | 'default'; label?: string }) {
  return (
    <Button size={size} className="h-11 gap-2.5 rounded-full pl-2 pr-6 text-[15px]" onClick={() => signIn()}>
      <img src="https://assets.hackclub.com/icon-rounded.svg" alt="" className="size-7 rounded-full bg-white" />
      {label}
    </Button>
  )
}

export default function Landing() {
  const [params, setParams] = useSearchParams()

  useEffect(() => {
    const err = params.get('auth_error')
    if (err) {
      toast.error(err === 'access_denied' ? 'Sign-in was cancelled.' : 'Sign-in failed. Please try again.')
      params.delete('auth_error')
      setParams(params, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeMenu />
          <Button variant="outline" className="rounded-full" onClick={() => signIn()}>
            Sign in
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 sm:px-6">
        <section className="mt-10 px-2 py-14 text-center sm:py-20">
          <p className="text-sm font-medium text-primary">Free · {QUESTIONS.length} original practice questions</p>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-5xl leading-[1.02] tracking-[-0.02em] text-balance sm:text-7xl">
            Your 1600 starts with one question.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-muted-foreground sm:text-lg">
            Digital SAT practice that adapts to you. Timed modules, instant explanations, and a clear picture of what to study next.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <HackClubButton />
            <p className="text-xs text-muted-foreground">Free for everyone with a Hack Club account.</p>
          </div>
        </section>

        <FadeIn>
          <dl className="mx-auto grid max-w-4xl gap-x-12 border-t sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 border-b py-6">
                <f.icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} />
                <div>
                  <dt className="font-semibold">{f.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.text}</dd>
                </div>
              </div>
            ))}
          </dl>
        </FadeIn>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>Sign-in is provided by Hack Club Auth. We store your name, email and practice history.</span>
          <span>SAT® is a trademark of the College Board, which is not affiliated with this site.</span>
        </div>
      </footer>
    </div>
  )
}
