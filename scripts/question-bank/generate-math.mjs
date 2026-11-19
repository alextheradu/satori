// Original SAT-style practice. Seeded variants are committed as ordinary bank JSON.
// Every numerical answer is checked against a forward model, not just a schema.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { registerMathExpansion } from './math-expansion.mjs'
import { registerMathReasoning } from './math-reasoning.mjs'
import { registerMathApplications } from './math-applications.mjs'
import { questionFingerprint } from './question-fingerprint.mjs'
import { partitionFamily } from './partition-family.mjs'
import { createHash } from 'node:crypto'

const root = fileURLToPath(new URL('../../', import.meta.url))
const out = join(root, 'src/data/questions')
const check = process.argv.includes('--check')
const families = []
const A = 'Algebra', N = 'Advanced Math', D = 'Problem-Solving and Data Analysis', G = 'Geometry and Trigonometry'
const skills = {
  one: 'Linear equations in one variable', two: 'Linear equations in two variables',
  linear: 'Linear functions', system: 'Systems of two linear equations in two variables',
  inequality: 'Linear inequalities in one or two variables', equivalent: 'Equivalent expressions',
  nonlinear: 'Nonlinear equations in one variable and systems of equations in two variables',
  function: 'Nonlinear functions', ratio: 'Ratios, rates, proportional relationships, and units',
  percent: 'Percentages', data: 'One-variable data: distributions and measures of center and spread',
  model: 'Two-variable data: models and scatterplots', probability: 'Probability and conditional probability',
  inference: 'Inference from sample statistics and margin of error', claims: 'Evaluating statistical claims: observational studies and experiments',
  area: 'Area and volume', angles: 'Lines, angles, and triangles', trig: 'Right triangles and trigonometry', circles: 'Circles',
}
const f = (key, domain, skill, difficulty, make) => families.push({ key, domain, skill: skills[skill], difficulty, make })
const near = (a, b) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(b))
const fmt = (v) => String(Number(v.toFixed(8)))
const tex = (v) => `$${fmt(v)}$`
const term = (v) => v < 0 ? `- ${fmt(-v)}` : `+ ${fmt(v)}`
const frac = (a, b) => `\\frac{${a}}{${b}}`
const table = (head, rows) => `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${rows.map(r => `| ${r.join(' | ')} |`).join('\n')}`
const median = (xs) => { const s = [...xs].sort((a,b) => a-b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m-1] + s[m])/2 }
const mean = (xs) => xs.reduce((a,b) => a+b,0)/xs.length
let state
const int = (lo, hi) => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return lo + (state >>> 0) % (hi-lo+1) }
const pick = (xs) => xs[int(0,xs.length-1)]
const numeric = (prompt, value, explanation, valid, traps = [], extra = {}) => ({prompt, value, explanation, valid, traps, ...extra})

f('distribute', A, 'one', 'easy', () => {
  const a=int(2,12), b=int(2,19), x=int(-18,25), c=int(1,30), rhs=a*(x+b)+c
  return numeric(`If $${a}(x+${b})+${c}=${rhs}$, what is the value of $x$?`, x,
    `Subtract $${c}$ and divide by $${a}$ to obtain $x+${b}=${x+b}$. Subtract $${b}$: $x=${x}$. Distribution must apply to both terms inside the parentheses.`, v=>near(a*(v+b)+c,rhs), [x+b,x-b,x+a])
})
f('both-sides', A, 'one', 'medium', () => {
  const a=int(5,18), c=int(1,a-1), x=int(-15,25), b=int(1,30), d=(a-c)*x+b
  return numeric(`What value of $x$ satisfies $${a}x+${b}=${c}x${term(d)}$?`,x,
    `Subtract $${c}x$ and $${b}$ from both sides: $${a-c}x=${d-b}$. Division by $${a-c}$ gives $x=${x}$. Moving a term across the equality changes its sign.`,v=>near(a*v+b,c*v+d),[x+1,-x,x+a])
})
f('fraction-linear', A, 'one', 'medium', () => {
  const d=int(2,9), a=int(2,11), b=int(1,25), k=int(-12,20), rhs=a*k+b
  return numeric(`If $${frac(`${a}x`,d)}+${b}=${rhs}$, what is $x$?`,d*k,
    `Subtract $${b}$ to get $${frac(`${a}x`,d)}=${a*k}$. Multiply by $${d}$, then divide by $${a}$, giving $x=${d*k}$. The denominator divides the whole numerator.`,v=>near(a*v/d+b,rhs),[k,d*k+d,d*k-d])
})
f('literal-equation', A, 'one', 'medium', () => {
  const a=int(2,15), b=int(2,25), x=int(3,20), y=int(2,16), z=a*x+b*y
  return numeric(`The variables $x$, $y$, and $z$ satisfy $z=${a}x+${b}y$. When $y=${y}$ and $z=${z}$, what is $x$?`,x,
    `Substitute the known values: $${z}=${a}x+${b*y}$. Subtract $${b*y}$ and divide by $${a}$ to find $x=${x}$. Dividing before subtracting would also require dividing the second term.`,v=>near(a*v+b*y,z),[z/a,x+y,x-y])
})
f('identity-parameter', A, 'one', 'hard', () => {
  const a=int(2,12), b=int(2,18), c=int(1,18)
  return numeric(`The equation $${a}(x+${b})=${a}x+k${term(c)}$ is true for every real number $x$. What is $k$?`,a*b-c,
    `Expand the left side to $${a}x+${a*b}$. The coefficients of $x$ already agree, so the constants must agree: $k+${c}=${a*b}$. Thus $k=${a*b-c}$. Matching only the variable terms is insufficient.`,v=>[-7,0,11].every(x=>near(a*(x+b),a*x+v+c)),[a*b,a*b+c,b-c])
})
f('coordinate-substitution', A, 'two', 'easy', () => {
  const a=int(2,9), b=int(2,9), x=int(-10,20), y=int(-10,20), c=a*x+b*y
  return numeric(`The point $(${x},y)$ lies on the line $${a}x+${b}y=${c}$. What is $y$?`,y,
    `Insert $x=${x}$: $${a*x}+${b}y=${c}$. Therefore $${b}y=${c-a*x}$ and $y=${y}$. An ordered pair lists the $x$-coordinate first.`,v=>near(a*x+b*v,c),[x,y+1,-y])
})
f('intercept-standard', A, 'two', 'easy', () => {
  const a=int(2,15), b=int(2,15), y=int(2,25), c=b*y
  return numeric(`What is the $y$-coordinate of the $y$-intercept of $${a}x+${b}y=${c}$?`,y,
    `At the $y$-intercept, $x=0$. Hence $${b}y=${c}$, so $y=${y}$. Setting $y=0$ instead finds the $x$-intercept.`,v=>near(b*v,c),[c/a,c,y+b])
})
f('slope-points', A, 'two', 'medium', () => {
  const x=int(-15,15), y=int(-20,20), dx=int(2,12), m=int(-8,9)
  return numeric(`A line passes through $(${x},${y})$ and $(${x+dx},${y+m*dx})$. What is its slope?`,m,
    `Slope is change in $y$ divided by change in $x$: $${frac(`${y+m*dx}-(${y})`,`${x+dx}-(${x})`)}=${frac(m*dx,dx)}=${m}$. Use the same point order in numerator and denominator.`,v=>near(y+v*dx,y+m*dx),[-m,m+1,dx])
})
f('parallel-intercept', A, 'two', 'medium', () => {
  const m=int(2,12), b=int(1,30), x=int(-10,15), y=int(-20,40)
  return numeric(`Line $l$ is parallel to $y=${m}x+${b}$ and passes through $(${x},${y})$. If its equation is $y=${m}x+c$, what is $c$?`,y-m*x,
    `Parallel lines have equal slopes. Substitute the point: $${y}=${m}(${x})+c$. Thus $c=${y-m*x}$. Parallel lines need not share an intercept.`,v=>near(m*x+v,y),[b,y+m*x,y])
})
f('linear-table', A, 'linear', 'easy', () => {
  const m=int(2,15), b=int(3,30), x=int(1,10), dx=int(1,5), target=x+3*dx
  return numeric(`The table gives values of a linear function $f$. What is $f(${target})$?`,m*target+b,
    `Each increase of $${dx}$ in $x$ increases $f(x)$ by $${m*dx}$. The target is one such step beyond the last row, so $f(${target})=${m*(x+2*dx)+b}+${m*dx}=${m*target+b}$. A linear function has a constant rate of change.`,v=>near((v-(m*(x+2*dx)+b))/dx,m),[],{passage:table(['$x$','$f(x)$'],[x,x+dx,x+2*dx].map(v=>[v,m*v+b]))})
})
f('service-fee', A, 'linear', 'easy', () => {
  const b=int(8,70), m=int(2,15), h=int(2,18)
  return numeric(`A repair service charges an initial fee of \\$${b} plus \\$${m} per hour. What is the total charge, in dollars, for $${h}$ hours?`,b+m*h,
    `The initial fee is charged once; the hourly charge is $${m}(${h})=${m*h}$. Adding gives $${b}+${m*h}=${b+m*h}$ dollars. Multiplying the initial fee by the hours would count it repeatedly.`,v=>near((v-b)/h,m),[m*h,(b+m)*h,b*h])
})
f('linear-from-values', A, 'linear', 'medium', () => {
  const m=int(-9,12), b=int(1,40), x=int(2,9), dx=int(2,8)
  return numeric(`For a linear function $f$, $f(${x})=${m*x+b}$ and $f(${x+dx})=${m*(x+dx)+b}$. What is $f(0)$?`,b,
    `The slope is $${frac(m*dx,dx)}=${m}$. Thus $f(x)=${m}x+b$. Using the first value gives $b=${m*x+b}-(${m})(${x})=${b}$. The value at zero is the intercept, not the slope.`,v=>near(((m*x+b)-v)/x,((m*(x+dx)+b)-v)/(x+dx)),[m,m*x+b,b+m])
})
f('break-even', A, 'linear', 'medium', () => {
  const a=int(8,30), d=int(2,8), b=int(5,40), x=int(3,25), c=b+d*x
  return numeric(`Plan A costs $${a}t+${b}$ dollars for $t$ months. Plan B costs $${a-d}t+${c}$ dollars. After how many months are the total costs equal?`,x,
    `Set the costs equal: $${a}t+${b}=${a-d}t+${c}$. Then $${d}t=${c-b}$, so $t=${x}$. Compare complete costs, including each fixed fee.`,v=>near(a*v+b,(a-d)*v+c),[x+1,c-b,c+b])
})
f('system-eliminate', A, 'system', 'medium', () => {
  const x=int(-10,20), y=int(-10,20), a=int(2,9), b=int(2,9), c=a*x+b*y, d=a*x-b*y
  return numeric(`The system $${a}x+${b}y=${c}$ and $${a}x-${b}y=${d}$ has solution $(x,y)$. What is $x$?`,x,
    `Add the equations to eliminate $y$: $${2*a}x=${c+d}$. Divide by $${2*a}$ to obtain $x=${x}$. Subtracting instead would isolate $y$.`,v=>near((c-a*v)/b,(a*v-d)/b),[y,x+y,c+d])
})
f('ticket-system', A, 'system', 'medium', () => {
  const cheap=int(3,12), delta=int(2,10), total=int(25,100), adult=int(5,total-5), revenue=cheap*total+delta*adult
  return numeric(`A club sold $${total}$ tickets. Student tickets cost \\$${cheap} each and adult tickets cost \\$${cheap+delta} each. Total revenue was \\$${revenue}. How many adult tickets were sold?`,adult,
    `Let $a$ be adult tickets; student tickets number $${total}-a$. Revenue is $${cheap+delta}a+${cheap}(${total}-a)=${revenue}$. Simplifying gives $${delta}a=${delta*adult}$, hence $a=${adult}$. The ticket total alone does not determine the two counts.`,v=>near((cheap+delta)*v+cheap*(total-v),revenue),[total-adult,total,adult+delta])
})
f('system-expression', A, 'system', 'hard', () => {
  const x=int(-12,20), y=int(-12,20), a=int(2,8), b=int(2,8), k=int(2,5), c=a*x+b*y, d=x-y
  return numeric(`The numbers $x$ and $y$ satisfy $${a}x+${b}y=${c}$ and $x-y=${d}$. What is $${k*a}x+${k*b}y$?`,k*c,
    `The requested expression is $${k}(${a}x+${b}y)$. The first equation therefore gives $${k}(${c})=${k*c}$. Solving for both variables is unnecessary; the second equation does not change this value.`,v=>near(v/k,c),[c,k*d,k*(x+y)])
})
f('infinite-system', A, 'system', 'hard', () => {
  const a=int(2,10), b=int(2,12), c=int(3,40), k=int(2,9)
  return numeric(`The system $${a}x+${b}y=${c}$ and $${a*k}x+ky=${c*k}$ has infinitely many solutions. What is $k$?`,b*k,
    `For infinitely many solutions, the second equation must multiply every coefficient and the constant in the first by the same factor. That factor is $${k}$, so the coefficient named $k$ in the prompt is $${b}(${k})=${b*k}$. Matching just one variable coefficient would be insufficient.`,v=>near(v/b,(c*k)/c)&&near(v/b,(a*k)/a),[k,b,b*k+1])
})
f('budget-bound', A, 'inequality', 'easy', () => {
  const fee=int(5,50), cost=int(2,15), count=int(5,50), left=int(0,cost-1), budget=fee+cost*count+left
  return numeric(`A club has \\$${budget}. It pays a delivery fee of \\$${fee} and buys notebooks costing \\$${cost} each. What is the greatest number of notebooks it can buy?`,count,
    `The budget requires $${cost}n+${fee}\\le ${budget}$. Thus $n\\le ${frac(budget-fee,cost)}$. The greatest whole number allowed is $${count}$. Rounding up would exceed the budget.`,v=>Number.isInteger(v)&&cost*v+fee<=budget&&cost*(v+1)+fee>budget,[count+1,count-1,Math.floor(budget/cost)])
})
f('minimum-target', A, 'inequality', 'medium', () => {
  const start=int(10,100), each=int(3,20), n=int(6,40), gap=int(1,each-1), target=start+each*n-gap
  return numeric(`A student already has $${start}$ points and earns $${each}$ points per completed task. What is the least number of additional tasks needed to reach at least $${target}$ points?`,n,
    `Solve $${start}+${each}t\\ge ${target}$, giving $t\\ge ${frac(target-start,each)}$. Tasks must be whole, so round up to $${n}$. Rounding down falls short.`,v=>Number.isInteger(v)&&start+each*v>=target&&start+each*(v-1)<target,[n-1,n+1,target-start])
})
f('negative-inequality', A, 'inequality', 'medium', () => {
  const a=int(2,14), b=int(1,35), x=int(-12,24), rhs=b-a*x
  return numeric(`What is the least integer $x$ satisfying $${b}-${a}x<${rhs}$?`,x+1,
    `Subtract $${b}$: $-${a}x<${rhs-b}$. Dividing by a negative reverses the sign, so $x>${x}$. The least integer is $${x+1}$; the strict inequality excludes $${x}$.`,v=>Number.isInteger(v)&&b-a*v<rhs&&!(b-a*(v-1)<rhs),[x,x-1,-x])
})
f('two-resource-bound', A, 'inequality', 'hard', () => {
  const a=int(2,8), b=int(2,8), x=int(3,20), y=int(5,30), slack=int(0,b-1), budget=a*x+b*y+slack
  return numeric(`A workshop has $${budget}$ units of material. Each small item uses $${a}$ units and each large item uses $${b}$ units. After making $${x}$ small items, what is the greatest number of large items it can make?`,y,
    `The small items use $${a}(${x})=${a*x}$ units, leaving $${budget-a*x}$. Dividing by $${b}$ and taking the greatest whole number gives $${y}$. The requested count is the remaining large items, not the total number of items of both sizes.`,v=>Number.isInteger(v)&&a*x+b*v<=budget&&a*x+b*(v+1)>budget,[y+1,y-1,Math.floor(budget/b)])
})
f('binomial-middle', N, 'equivalent', 'medium', () => {
  const a=int(2,12), b=int(2,20)
  return numeric(`The expression $(${a}x-${b})^2$ equals $${a*a}x^2+kx+${b*b}$. What is $k$?`,-2*a*b,
    `Use $(u-v)^2=u^2-2uv+v^2$. The middle term is $-2(${a})(${b})x=-${2*a*b}x$, so $k=-${2*a*b}$. Squaring each term alone omits the cross product.`,v=>[-3,1,7].every(x=>near((a*x-b)**2,a*a*x*x+v*x+b*b)),[-a*b,2*a*b,0])
})
f('factor-coefficient', N, 'equivalent', 'easy', () => {
  const a=int(2,20), b=int(2,24)
  return numeric(`The expression $x^2-${a+b}x+${a*b}$ equals $(x-${a})(x-k)$. What is $k$?`,b,
    `Expanding gives $x^2-(${a}+k)x+${a}k$. Comparing constants, $${a}k=${a*b}$, so $k=${b}$. The two factor constants must also sum to $${a+b}$.`,v=>[-2,0,3].every(x=>near(x*x-(a+b)*x+a*b,(x-a)*(x-v))),[-b,a+b,a*b])
})
f('rational-cancel', N, 'equivalent', 'medium', () => {
  const a=int(2,20), b=int(2,20), x=int(a+1,a+20)
  return numeric(`For $x\\ne ${a}$, $g(x)=${frac(`x^2${term(b-a)}x-${a*b}`,`x-${a}`)}$. What is $g(${x})$?`,x+b,
    `Factor the numerator as $(x-${a})(x+${b})$. Cancel the common factor where $x\\ne ${a}$, giving $g(x)=x+${b}$. Thus $g(${x})=${x+b}$. The restriction remains even after cancellation.`,v=>near(v*(x-a),x*x+(b-a)*x-a*b),[x-b,x+a,b])
})
f('exponent-quotient', N, 'equivalent', 'medium', () => {
  const a=int(2,9), b=int(2,9), p=int(3,12), q=int(1,p-1)
  return numeric(`For $x\\ne 0$, $${frac(`${a*b}x^{${p}}`,`${a}x^{${q}}`)}=${b}x^k$. What is $k$?`,p-q,
    `Divide coefficients and subtract exponents of the same base: $${a*b}/${a}=${b}$ and $x^{${p}}/x^{${q}}=x^{${p-q}}$. Hence $k=${p-q}$. Adding exponents applies to multiplication, not division.`,v=>near(a*b*2**p/(a*2**q),b*2**v),[p+q,p*q,q-p])
})
f('remainder', N, 'equivalent', 'hard', () => {
  const a=int(2,8), b=int(-12,12), c=int(-20,30), t=int(-5,7)
  return numeric(`What is the remainder when $${a}x^3${term(b)}x${term(c)}$ is divided by $x${term(-t)}$?`,a*t**3+b*t+c,
    `By the remainder theorem, dividing $P(x)$ by $x-(${t})$ leaves remainder $P(${t})$. Substitution yields $${a}(${t})^3${term(b)}(${t})${term(c)}=${a*t**3+b*t+c}$. The sign in the divisor determines which input to use.`,v=>near(a*t**3+b*t+c-v,0),[a*(-t)**3+b*(-t)+c,c,a*t*t+b*t+c])
})
f('quadratic-roots', N, 'nonlinear', 'medium', () => {
  const a=int(-16,12), b=int(a+1,a+20)
  return numeric(`The equation $(x${term(-a)})(x${term(-b)})=0$ has two solutions. What is the greater solution?`,b,
    `A product is zero when a factor is zero. The solutions are $x=${a}$ and $x=${b}$; the greater is $${b}$. The constants printed inside the factors have signs opposite to the roots.`,v=>near((v-a)*(v-b),0)&&v>a,[a,-a,-b])
})
f('root-sum', N, 'nonlinear', 'medium', () => {
  const a=int(2,8), r=int(-12,18), s=int(r+1,r+18)
  return numeric(`What is the sum of the solutions of $${a}x^2${term(-a*(r+s))}x${term(a*r*s)}=0$?`,r+s,
    `For $ax^2+bx+c=0$, the root sum is $-b/a$. Here it is $-${frac(-a*(r+s),a)}=${r+s}$. The product is $c/a$, a different quantity.`,v=>near(-a*v,-a*(r+s)),[r*s,-r-s,a*(r+s)])
})
f('root-product', N, 'nonlinear', 'medium', () => {
  const a=int(2,9), r=int(2,18), s=int(2,18)
  return numeric(`The two solutions of $${a}x^2-${a*(r+s)}x+${a*r*s}=0$ are $r$ and $s$. What is $rs$?`,r*s,
    `For a quadratic, the product of the roots is constant term divided by leading coefficient: $rs=${frac(a*r*s,a)}=${r*s}$. The sum instead uses the coefficient of $x$.`,v=>near(a*v,a*r*s),[r+s,a*r*s,-r*s])
})
f('one-real-root', N, 'nonlinear', 'hard', () => {
  const a=int(1,12), h=int(2,20)
  return numeric(`The equation $${a}x^2-${2*a*h}x+k=0$ has exactly one distinct real solution. What is $k$?`,a*h*h,
    `Exactly one real solution requires discriminant zero: $(${2*a*h})^2-4(${a})k=0$. Therefore $k=${a*h*h}$, giving $${a}(x-${h})^2=0$. A positive discriminant would give two distinct roots.`,v=>near((2*a*h)**2-4*a*v,0),[h*h,2*a*h,a*h])
})
f('radical-equation', N, 'nonlinear', 'medium', () => {
  const a=int(2,10), x=int(1,24), b=int(1,20), target=a*x+b
  return numeric(`If $\\sqrt{${a}x+${b}}=\\sqrt{${target}}$, what is $x$?`,x,
    `Both sides are nonnegative. Square them to get $${a}x+${b}=${target}$; subtract $${b}$ and divide by $${a}$, giving $x=${x}$. The result must keep the radicand nonnegative.`,v=>a*v+b>=0&&near(Math.sqrt(a*v+b),Math.sqrt(target)),[target,x+b,x*a])
})
f('rational-equation', N, 'nonlinear', 'hard', () => {
  const a=int(2,15), b=int(2,15), d=int(2,12), x=a+b*d
  return numeric(`For $x\\ne ${a}$, $${frac(b,`x-${a}`)}=${frac(1,d)}$. What is $x$?`,x,
    `Cross-multiply: $${b}(${d})=x-${a}$. Add $${a}$ to find $x=${x}$. This is not the excluded input $${a}$, so it is valid. Inverting only one fraction changes the equation.`,v=>v!==a&&near(b/(v-a),1/d),[b*d-a,a+b/d,a+d/b])
})
f('quadratic-line-system', N, 'nonlinear', 'hard', () => {
  const h=int(2,18), k=int(2,30), d=int(2,10)
  return numeric(`The graphs $y=(x-${h})^2+${k}$ and $y=${k+d*d}$ intersect at two points. What is the greater $x$-coordinate of an intersection?`,h+d,
    `Equate the expressions for $y$: $(x-${h})^2=${d*d}$. Thus $x-${h}=\\pm ${d}$, so the greater $x$ is $${h+d}$. Taking only the negative square root would give the other intersection.`,v=>near((v-h)**2+k,k+d*d)&&v>h,[h-d,d,h+d*d])
})
f('vertex-minimum', N, 'function', 'medium', () => {
  const a=int(2,12), h=int(-12,18), k=int(-30,40)
  return numeric(`The function $f(x)=${a}(x${term(-h)})^2${term(k)}$ is defined for all real $x$. What is its minimum value?`,k,
    `A square is nonnegative and the coefficient $${a}$ is positive. Its smallest contribution is zero, attained at $x=${h}$. Hence $f(${h})=${k}$ is the minimum. The vertex's input and output are different quantities.`,v=>near(v,a*(h-h)**2+k)&&[-10,-1,1,10].every(d=>a*d*d+k>=v),[h,-k,k+a])
})
f('vertex-input', N, 'function', 'hard', () => {
  const a=int(2,10), h=int(2,20), k=int(1,40)
  return numeric(`For what value of $x$ does $f(x)=${a}x^2-${2*a*h}x+${a*h*h+k}$ attain its minimum?`,h,
    `The vertex input is $-b/(2a)=${frac(2*a*h,2*a)}=${h}$. Equivalently, complete the square to obtain $f(x)=${a}(x-${h})^2+${k}$. The constant term is not the minimizing input.`,v=>near(2*a*v-2*a*h,0),[k,2*h,a*h*h+k])
})
f('exponential-evaluate', N, 'function', 'easy', () => {
  const a=int(3,45), b=int(2,4), t=int(2,5)
  return numeric(`A population is modeled by $P(t)=${a}(${b})^t$. What is $P(${t})$?`,a*b**t,
    `Substitute $t=${t}$: $P(${t})=${a}(${b})^{${t}}=${a*b**t}$. The exponent indicates repeated multiplication; $${b}t$ would describe a different operation.`,v=>near(v/a,b**t),[a*b*t,a+b**t,a*b**(t-1)])
})
f('growth-percent', N, 'function', 'easy', () => {
  const a=int(20,200)*10, p=int(2,35), factor=fmt(1+p/100)
  return numeric(`A quantity is modeled by $Q(t)=${a}(${factor})^t$, where $t$ is years. By what percent does it increase each year?`,p,
    `An annual increase of $p$ percent corresponds to factor $1+p/100$. Here $${factor}-1=${fmt(p/100)}$, so the increase is $${p}\\%$. The multiplier itself is not the percent increase.`,v=>near(1+v/100,Number(factor)),[p+100,p/100,100-p])
})
f('decay-percent', N, 'function', 'easy', () => {
  const a=int(20,250)*10, p=int(2,45), factor=fmt(1-p/100)
  return numeric(`A device's value is modeled by $V(t)=${a}(${factor})^t$, where $t$ is years. What percent of its value does it lose each year?`,p,
    `A decay multiplier is $1-p/100$. Thus $1-${factor}=${fmt(p/100)}$ corresponds to a $${p}\\%$ yearly decrease. The percent retained is $${100-p}\\%$, not the percent lost.`,v=>near(1-v/100,Number(factor)),[100-p,p/100,100+p])
})
f('exponential-period', N, 'function', 'hard', () => {
  const a=int(10,100), k=int(2,12), n=int(2,7)
  return numeric(`A culture is modeled by $B(t)=${a}\\cdot 2^{t/${k}}$, where $t$ is hours. After how many hours will it contain $${a*2**n}$ organisms?`,k*n,
    `Divide by $${a}$: $2^{t/${k}}=${2**n}=2^{${n}}$. Equal powers of 2 have equal exponents, so $t/${k}=${n}$ and $t=${k*n}$. The doubling interval is $${k}$ hours.`,v=>near(a*2**(v/k),a*2**n),[n,k+n,k*2**n])
})
f('function-shift', N, 'function', 'medium', () => {
  const h=int(2,15), k=int(-20,25), a=int(2,8), t=int(2,10)
  return numeric(`Let $f(x)=${a}x^2${term(k)}$ and $g(x)=f(x-${h})$. What is $g(${h+t})$?`,a*t*t+k,
    `The input to $f$ is $${h+t}-${h}=${t}$. Thus $g(${h+t})=f(${t})=${a}(${t})^2${term(k)}=${a*t*t+k}$. Apply the shift to the input before evaluating.`,v=>near(v,a*((h+t)-h)**2+k),[a*(h+t)**2+k,a*t*t+k-h,a*(t+2*h)**2+k])
})
f('ratio-part', D, 'ratio', 'easy', () => {
  const a=int(2,12), b=int(2,12), k=int(3,35)
  return numeric(`A mixture contains red and blue beads in the ratio $${a}:${b}$. It contains $${(a+b)*k}$ beads in total. How many are red?`,a*k,
    `There are $${a+b}$ ratio parts altogether, each worth $${k}$ beads. Red beads occupy $${a}$ parts, giving $${a*k}$. The ratio compares the two categories, not red to the total.`,v=>near(v/(a+b)/k,a/(a+b))&&near(v/(a*k),1),[b*k,(a+b)*k,a+b])
})
f('unit-rate', D, 'ratio', 'easy', () => {
  const r=int(3,35), t=int(2,16), target=int(17,45)
  return numeric(`A machine produces $${r*t}$ parts in $${t}$ minutes at a constant rate. How many parts will it produce in $${target}$ minutes?`,r*target,
    `The rate is $${r*t}/${t}=${r}$ parts per minute. Multiply by $${target}$ minutes to get $${r*target}$ parts. Direct proportionality requires the same rate for both time periods.`,v=>near(v/target,(r*t)/t),[r*t,r*target+t,r*(target-t)])
})
f('speed-conversion', D, 'ratio', 'medium', () => {
  const speed=int(2,30), minutes=int(2,25)
  return numeric(`A cyclist travels at $${speed}$ meters per second for $${minutes}$ minutes. How far, in meters, does the cyclist travel?`,speed*minutes*60,
    `Convert time first: $${minutes}$ minutes is $${minutes*60}$ seconds. Distance is speed times time, so $d=${speed}(${minutes*60})=${speed*minutes*60}$ meters. Mixing minutes with meters per second misses a factor of 60.`,v=>near(v/speed/60,minutes),[speed*minutes,speed*minutes/60,speed*60])
})
f('density', D, 'ratio', 'medium', () => {
  const density=int(2,25), volume=int(5,120)
  return numeric(`A uniform material has density $${density}$ grams per cubic centimeter. A sample has mass $${density*volume}$ grams. What is its volume, in cubic centimeters?`,volume,
    `Density equals mass divided by volume, so volume equals $${density*volume}/${density}=${volume}$. Multiplying mass by density would give the wrong units.`,v=>v>0&&near(density*v,density*volume),[density*volume,density*density*volume,volume+density])
})
f('combined-rate', D, 'ratio', 'hard', () => {
  const a=int(3,18), b=int(3,18), t=int(4,40)
  return numeric(`Two pumps fill a tank simultaneously. One supplies $${a}$ liters per minute and the other supplies $${b}$ liters per minute. How many minutes are needed to add $${(a+b)*t}$ liters?`,t,
    `Their rates add to $${a+b}$ liters per minute. Divide volume by the combined rate: $${frac((a+b)*t,a+b)}=${t}$ minutes. Adding individual filling times would not model simultaneous work.`,v=>near(a*v+b*v,(a+b)*t),[(a+b)*t/a,(a+b)*t/b,t*(a+b)])
})
f('percent-of', D, 'percent', 'easy', () => {
  const p=int(2,19)*5, n=int(5,150)*20
  return numeric(`What is $${p}\\%$ of $${n}$?`,p*n/100,
    `Convert the percent to a decimal and multiply: $${fmt(p/100)}(${n})=${p*n/100}$. A percent is a fraction out of 100.`,v=>near(100*v/n,p),[p*n,n-p,n*(1-p/100)])
})
f('reverse-percent', D, 'percent', 'medium', () => {
  const p=int(2,18)*5, whole=int(5,100)*20, part=p*whole/100
  return numeric(`The number $${part}$ is $${p}\\%$ of what number?`,whole,
    `Let the original number be $n$. Then $${fmt(p/100)}n=${part}$, so $n=${part}/${fmt(p/100)}=${whole}$. Multiplying by the percent again would find a percent of the part.`,v=>near(v*p/100,part),[part*p/100,part,whole+part])
})
f('discount-price', D, 'percent', 'easy', () => {
  const price=int(10,100)*20, p=int(1,8)*5
  return numeric(`An item originally costs \\$${price}. Its price is reduced by $${p}\\%$. What is the sale price, in dollars?`,price*(100-p)/100,
    `The fraction of the price remaining is $1-${fmt(p/100)}=${fmt(1-p/100)}$. Multiply by $${price}$ to get $${price*(100-p)/100}$ dollars. The discount amount alone is not the sale price.`,v=>near((price-v)/price*100,p),[price*p/100,price*(100+p)/100,price-p])
})
f('successive-percent', D, 'percent', 'hard', () => {
  const price=int(5,80)*100, p=int(1,6)*5, q=int(1,6)*5, value=price*(100+p)*(100-q)/10000
  return numeric(`A price of \\$${price} increases by $${p}\\%$ and then decreases by $${q}\\%$ of the increased price. What is the final price, in dollars?`,value,
    `Apply the changes successively: $${price}(${fmt(1+p/100)})(${fmt(1-q/100)})=${fmt(value)}$. The second percent uses the new price as its base. Subtracting the percentages before applying them ignores that change of base.`,v=>near(v/(1-q/100)/price,1+p/100),[price*(1+(p-q)/100),price*(1-p/100)*(1+q/100),price*(p+q)/100])
})
f('percent-change', D, 'percent', 'medium', () => {
  const start=int(5,80)*20, p=int(1,15)*5, finish=start*(100+p)/100
  return numeric(`Attendance rose from $${start}$ to $${finish}$. What was the percent increase?`,p,
    `The increase is $${finish-start}$. Divide by the original $${start}$ and multiply by 100: $${frac(finish-start,start)}\\cdot100=${p}\\%$. Dividing by the final attendance uses the wrong base.`,v=>near(start*(1+v/100),finish),[finish-start,100+p,(finish-start)/finish*100])
})
f('mean-missing', D, 'data', 'medium', () => {
  const avg=int(10,60), a=int(1,8), b=int(1,8), xs=[avg-a,avg+b,avg+a,avg-b]
  return numeric(`Five measurements have mean $${avg}$. Four are $${xs.join(', ')}$. What is the fifth measurement?`,avg,
    `A mean of $${avg}$ for five values requires a total of $${5*avg}$. The four known values sum to $${4*avg}$, leaving $${avg}$. A mean is based on all five values.`,v=>near(mean([...xs,v]),avg),[5*avg,4*avg,avg+1])
})
f('median-unsorted', D, 'data', 'easy', () => {
  const a=int(2,35), d=int(1,8), xs=[a+4*d,a,a+6*d,a+2*d,a+3*d,a+d,a+5*d]
  return numeric(`What is the median of $${xs.join(', ')}$?`,a+3*d,
    `Order the seven values: $${[...xs].sort((x,y)=>x-y).join(', ')}$. The fourth value is $${a+3*d}$, with three values on either side. The data must be ordered before selecting the middle.`,v=>near(v,median(xs)),[a+2*d,a+4*d,a+6*d])
})
f('weighted-mean', D, 'data', 'medium', () => {
  const a=int(3,15), b=int(3,15), n=int(2,12), m=int(2,12)
  return numeric(`A data set contains $${n}$ values equal to $${a}$ and $${m}$ values equal to $${b}$. What is its mean?`,(a*n+b*m)/(n+m),
    `The sum is $${n}(${a})+${m}(${b})=${a*n+b*m}$ across $${n+m}$ values. Divide to obtain $${frac(a*n+b*m,n+m)}$. Averaging the two distinct values without their frequencies is generally wrong.`,v=>near(v*(n+m),Array(n).fill(a).concat(Array(m).fill(b)).reduce((s,x)=>s+x,0)),[(a+b)/2,a*n+b*m,(a+b)/(n+m)])
})
f('mean-shift', D, 'data', 'easy', () => {
  const m=int(12,70), d=int(2,18), count=int(5,30)
  return numeric(`A set of $${count}$ numbers has mean $${m}$. If $${d}$ is added to every number, what is the new mean?`,m+d,
    `The sum increases by $${count}(${d})$, while the count stays $${count}$. The mean therefore increases by $${d}$, from $${m}$ to $${m+d}$. Adding to every value does not multiply the mean by the count.`,v=>near(v*count,m*count+d*count),[m,m+d*count,m*d])
})
f('frequency-median', D, 'data', 'medium', () => {
  const a=int(2,30), d=int(2,8), n=int(2,7), m=int(n+1,n+8), upper=int(1,n)
  const xs=[...Array(n).fill(a),...Array(m).fill(a+d),...Array(upper).fill(a+2*d)]
  return numeric(`The table summarizes a data set. What is its median?`,median(xs),
    `There are $${xs.length}$ values. The middle position${xs.length%2?'':'s'} fall${xs.length%2?'s':''} in the group equal to $${a+d}$, so the median is $${a+d}$. Frequencies count repeated observations; the median is not the middle frequency.`,v=>near(v,median(xs)),[a,a+2*d,m],{passage:table(['Value','Frequency'],[[a,n],[a+d,m],[a+2*d,upper]])})
})
f('linear-prediction', D, 'model', 'easy', () => {
  const a=int(2,12), b=int(5,55), x=int(3,30)
  return numeric(`A model predicts $y=${a}x+${b}$, where $x$ is hours of practice and $y$ is a score. What score does the model predict after $${x}$ hours?`,a*x+b,
    `Insert $x=${x}$: $y=${a}(${x})+${b}=${a*x+b}$. Include the intercept as well as the change associated with practice hours.`,v=>near(v-b,a*x),[a*x,(a+b)*x,a*x-b])
})
f('residual', D, 'model', 'medium', () => {
  const a=int(2,12), b=int(5,40), x=int(2,20), r=pick([-12,-9,-6,-3,3,6,9,12]), observed=a*x+b+r
  return numeric(`A model is $y=${a}x+${b}$. An observation has $x=${x}$ and $y=${observed}$. Residual is observed value minus predicted value. What is this observation's residual?`,r,
    `The prediction is $${a}(${x})+${b}=${a*x+b}$. Subtract it from the observation: $${observed}-${a*x+b}=${r}$. Reversing this subtraction reverses the sign.`,v=>near(v+a*x+b,observed),[-r,observed,a*x+b])
})
f('model-slope', D, 'model', 'medium', () => {
  const m=int(2,15), b=int(20,80), x=int(3,15), dx=int(2,12)
  return numeric(`A linear model passes through $(${x},${m*x+b})$ and $(${x+dx},${m*(x+dx)+b})$. What increase in predicted $y$ corresponds to a one-unit increase in $x$?`,m,
    `The model's slope is $${frac(m*dx,dx)}=${m}$. This is the predicted increase per one unit of $x$. The total rise between the points covers $${dx}$ units, not one.`,v=>near(v*dx,m*dx),[m*dx,b,dx])
})
f('inverse-prediction', D, 'model', 'medium', () => {
  const m=int(2,12), b=int(5,50), x=int(5,40), target=m*x+b
  return numeric(`The model $y=${m}x+${b}$ relates study sessions $x$ to predicted score $y$. For what number of sessions does it predict a score of $${target}$?`,x,
    `Set $${target}=${m}x+${b}$. Subtract $${b}$ and divide by $${m}$ to obtain $x=${x}$. Here the score is the output; it should not be substituted for the session count.`,v=>near(m*v+b,target),[target,Math.floor(target/m),x+b])
})
f('probability-basic', D, 'probability', 'easy', () => {
  const a=int(3,25), b=int(3,25), c=int(3,25), total=a+b+c
  return numeric(`A bag contains $${a}$ red, $${b}$ blue, and $${c}$ green counters. One counter is selected at random. What is the probability that it is red?`,a/total,
    `There are $${total}$ equally likely counters, of which $${a}$ are red. The probability is $${frac(a,total)}$. The denominator counts every possible counter, not just the other colors.`,v=>near(v*total,a),[b/total,c/total,(b+c)/total])
})
f('conditional-table', D, 'probability', 'medium', () => {
  const a=int(3,30), b=int(3,30), c=int(3,30), d=int(3,30)
  return numeric(`One student is selected at random from the students who take art. What is the probability that this student also takes music?`,a/(a+b),
    `Conditioning on taking art restricts the sample space to the first row: $${a+b}$ students. Of these, $${a}$ take music, so the probability is $${frac(a,a+b)}$. The whole-school total is not the relevant denominator.`,v=>near(v*(a+b),a),[a/(a+b+c+d),a/(a+c),b/(a+b)],{passage:table(['','Music','No music'],[['Art',a,b],['No art',c,d]])})
})
f('without-replacement', D, 'probability', 'hard', () => {
  const red=int(3,15), blue=int(3,15), total=red+blue
  return numeric(`A bag has $${red}$ red and $${blue}$ blue tokens. Two tokens are drawn at random without replacement. What is the probability that both are red?`,red*(red-1)/(total*(total-1)),
    `The first-red probability is $${frac(red,total)}$. With that token removed, the second-red probability is $${frac(red-1,total-1)}$. Multiply to get $${frac(red*(red-1),total*(total-1))}$. Keeping the original counts for the second draw would model replacement.`,v=>near(v*total*(total-1),red*(red-1)),[(red/total)**2,red/total,blue*(blue-1)/(total*(total-1))])
})
f('probability-union', D, 'probability', 'medium', () => {
  const both=int(2,15), onlyA=int(3,20), onlyB=int(3,20), neither=int(3,20), total=both+onlyA+onlyB+neither
  return numeric(`Of $${total}$ students, $${both+onlyA}$ play chess, $${both+onlyB}$ play soccer, and $${both}$ do both. What is the probability that a randomly selected student does at least one of these activities?`,(total-neither)/total,
    `Count the union as $${both+onlyA}+${both+onlyB}-${both}=${total-neither}$. Subtracting the overlap prevents double counting. Divide by $${total}$ to obtain $${frac(total-neither,total)}$.`,v=>near(v*total,both+onlyA+onlyB),[(2*both+onlyA+onlyB)/total,both/total,neither/total])
})
f('sample-estimate', D, 'inference', 'medium', () => {
  const sample=int(4,20)*10, yes=int(1,sample-1), scale=int(8,90)
  return numeric(`In a random sample of $${sample}$ residents, $${yes}$ support a proposal. The town has $${sample*scale}$ residents. Using the sample proportion, what is the estimated number of supporters in the town?`,yes*scale,
    `The sample proportion is $${frac(yes,sample)}$. Multiply by the town population: $${frac(yes,sample)}(${sample*scale})=${yes*scale}$. The estimate scales the proportion, not just the sample count plus population.`,v=>near(v/(sample*scale),yes/sample),[yes,sample*scale-yes*scale,yes+sample*scale])
})
f('margin-interval', D, 'inference', 'easy', () => {
  const estimate=int(25,75), margin=int(2,12)
  return numeric(`A poll estimates support at $${estimate}\\%$, with a margin of error of $${margin}$ percentage points. What is the upper endpoint of the reported interval, as a percent?`,estimate+margin,
    `Add the margin in percentage points: $${estimate}+${margin}=${estimate+margin}\\%$. Percentage points are added directly, rather than multiplied as a relative percent.`,v=>near(v-estimate,margin),[estimate-margin,estimate*(1+margin/100),margin])
})
f('interval-width', D, 'inference', 'easy', () => {
  const estimate=int(25,70), margin=int(2,15)
  return numeric(`A survey reports an estimate of $${estimate}\\%$ with margin of error $${margin}$ percentage points. What is the width of the estimate's interval, in percentage points?`,2*margin,
    `The endpoints are $${estimate-margin}\\%$ and $${estimate+margin}\\%$. Their difference is $${2*margin}$ percentage points, twice the margin of error. The margin measures only half the full width.`,v=>near((estimate+margin)-(estimate-margin),v),[margin,estimate+margin,estimate-margin])
})
f('sample-size-margin', D, 'inference', 'hard', () => {
  const n=int(5,40)*100, m=int(4,20), k=int(2,5)
  return numeric(`Under a survey model, margin of error is inversely proportional to the square root of sample size. A sample of $${n}$ has margin $${m}$ percentage points. What margin, in percentage points, corresponds to sample size $${n*k*k}$?`,m/k,
    `The sample size is multiplied by $${k*k}$. Its square root is multiplied by $${k}$, so the margin is divided by $${k}$: $${m}/${k}=${fmt(m/k)}$. Dividing by $${k*k}$ would ignore the square root relationship.`,v=>near(v*Math.sqrt(n*k*k),m*Math.sqrt(n)),[m/(k*k),m*k,m])
})
f('rectangle-area', G, 'area', 'easy', () => {
  const w=int(3,35), l=int(w+1,w+30)
  return numeric(`A rectangle has length $${l}$ centimeters and width $${w}$ centimeters. What is its area, in square centimeters?`,w*l,
    `Area is length times width: $A=${l}(${w})=${l*w}$. Adding the side lengths is used for perimeter, not area.`,v=>near(v/w,l),[2*(l+w),l+w,w*w])
})
f('triangle-area', G, 'area', 'easy', () => {
  const b=int(3,40), h=int(3,35)
  return numeric(`A triangle has base $${b}$ meters and perpendicular height $${h}$ meters. What is its area, in square meters?`,b*h/2,
    `Use $A=\\frac12 bh$: $A=\\frac12(${b})(${h})=${fmt(b*h/2)}$. The height is perpendicular to the base; omitting the half gives the associated rectangle's area.`,v=>near(2*v,b*h),[b*h,b+h,2*(b+h)])
})
f('prism-height', G, 'area', 'medium', () => {
  const l=int(3,25), w=int(3,25), h=int(3,25)
  return numeric(`A rectangular prism has volume $${l*w*h}$ cubic centimeters and base dimensions $${l}$ centimeters by $${w}$ centimeters. What is its height, in centimeters?`,h,
    `Volume is base area times height: $${l*w*h}=(${l})(${w})h$. Divide by $${l*w}$ to find $h=${h}$. Adding the base dimensions does not give its area.`,v=>near(l*w*v,l*w*h),[l*w,h*l,h*w])
})
f('cylinder-volume', G, 'area', 'medium', () => {
  const r=int(2,18), h=int(3,30)
  return numeric(`A cylinder has radius $${r}$ units and height $${h}$ units. Its volume is $k\\pi$ cubic units. What is $k$?`,r*r*h,
    `The cylinder volume is $\\pi r^2h=\\pi(${r})^2(${h})=${r*r*h}\\pi$. Thus $k=${r*r*h}$. The radius must be squared; the diameter is not the radius.`,v=>near(v/h,r*r),[2*r*h,r*h,4*r*r*h])
})
f('cone-volume', G, 'area', 'medium', () => {
  const r=int(2,18), h=int(2,12)*3
  return numeric(`A cone has radius $${r}$ units and height $${h}$ units. Its volume is $k\\pi$ cubic units. What is $k$?`,r*r*h/3,
    `For a cone, $V=\\frac13\\pi r^2h$. Substitute to get $V=\\frac13\\pi(${r})^2(${h})=${r*r*h/3}\\pi$, so $k=${r*r*h/3}$. A cylinder with the same dimensions would have three times the volume.`,v=>near(3*v,r*r*h),[r*r*h,r*h/3,4*r*r*h/3])
})
f('scale-volume', G, 'area', 'hard', () => {
  const v=int(2,40), k=int(2,8)
  return numeric(`Two solids are similar. Every length in the larger solid is $${k}$ times the corresponding length in the smaller. The smaller solid has volume $${v}$ cubic units. What is the larger volume?`,v*k**3,
    `Volumes of similar solids scale by the cube of the length factor: $${k}^3=${k**3}$. Therefore the volume is $${v}(${k**3})=${v*k**3}$. Squaring the factor is appropriate for areas, not volumes.`,ans=>near(Math.cbrt(ans/v),k),[v*k,v*k*k,v+k])
})
f('triangle-angle', G, 'angles', 'easy', () => {
  const a=int(20,80), b=int(20,80)
  return numeric(`Two interior angles of a triangle measure $${a}^\\circ$ and $${b}^\\circ$. What is the third angle's measure, in degrees?`,180-a-b,
    `The interior angles of a triangle total $180^\\circ$. The third angle is $180-${a}-${b}=${180-a-b}^\\circ$. A full turn of $360^\\circ$ is not the triangle's angle sum.`,v=>near(a+b+v,180),[a+b,360-a-b,180-a])
})
f('exterior-angle', G, 'angles', 'medium', () => {
  const a=int(20,75), b=int(20,75)
  return numeric(`An exterior angle of a triangle measures $${a+b}^\\circ$. One remote interior angle measures $${a}^\\circ$. What is the other remote interior angle's measure, in degrees?`,b,
    `An exterior angle equals the sum of the two remote interior angles. Thus $${a+b}=${a}+b$, giving $b=${b}^\\circ$. The adjacent interior angle is supplementary to the exterior angle, but it is not a remote angle.`,v=>near(v+a,a+b),[180-a-b,180-a,a+b])
})
f('isosceles-angle', G, 'angles', 'easy', () => {
  const base=int(15,80)
  return numeric(`An isosceles triangle's two equal base angles each measure $${base}^\\circ$. What is its vertex angle's measure, in degrees?`,180-2*base,
    `The equal angles contribute $2(${base})=${2*base}^\\circ$. Subtract from $180^\\circ$ to obtain $${180-2*base}^\\circ$. Both base angles must be included.`,v=>near(v+2*base,180),[180-base,base,2*base])
})
f('similar-side', G, 'angles', 'medium', () => {
  const a=int(2,12), b=int(13,25), k=int(2,9)
  return numeric(`Triangles $ABC$ and $DEF$ are similar, with $A$, $B$, and $C$ corresponding to $D$, $E$, and $F$, respectively. If $AB=${a}$, $DE=${a*k}$, and $BC=${b}$, what is $EF$?`,b*k,
    `The scale from $ABC$ to $DEF$ is $DE/AB=${a*k}/${a}=${k}$. Corresponding side $EF$ is therefore $${b}(${k})=${b*k}$. The correspondence fixes which sides should be compared.`,v=>near(v/b,(a*k)/a),[b/k,a*k,b+a*k])
})
f('parallel-angle', G, 'angles', 'medium', () => {
  const m=int(2,10), x=int(3,12), b=int(5,25), angle=m*x+b
  return numeric(`A transversal crosses two parallel lines. A pair of corresponding angles measures $(${m}x+${b})^\\circ$ and $${angle}^\\circ$. What is $x$?`,x,
    `Corresponding angles made by a transversal of parallel lines are equal. Set $${m}x+${b}=${angle}$, subtract $${b}$, and divide by $${m}$ to obtain $x=${x}$. Supplementary angle reasoning applies to different angle pairs.`,v=>near(m*v+b,angle),[angle,angle-b,180-angle])
})
f('pythagorean-leg', G, 'trig', 'medium', () => {
  const [a,b,c]=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]), k=int(2,30)
  return numeric(`A right triangle has hypotenuse $${c*k}$ and one leg $${a*k}$. What is the other leg's length?`,b*k,
    `The Pythagorean theorem gives $b^2=(${c*k})^2-(${a*k})^2=${(b*k)**2}$. Taking the positive square root gives $b=${b*k}$. The hypotenuse is opposite the right angle and is the longest side.`,v=>v>0&&near(v*v+(a*k)**2,(c*k)**2),[(c-a)*k,(c+a)*k,a*k])
})
f('sine-ratio', G, 'trig', 'medium', () => {
  const [a,b,c]=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]), k=int(2,30)
  return numeric(`In a right triangle, acute angle $\\theta$ has opposite side $${a*k}$, adjacent side $${b*k}$, and hypotenuse $${c*k}$. What is $\\sin\\theta$?`,a/c,
    `Sine is opposite divided by hypotenuse: $\\sin\\theta=${frac(a*k,c*k)}=${frac(a,c)}$. Adjacent over hypotenuse is cosine; opposite over adjacent is tangent.`,v=>near(v*c*k,a*k),[b/c,a/b,c/a])
})
f('tangent-side', G, 'trig', 'medium', () => {
  const a=int(2,12), b=int(2,12), k=int(2,20)
  return numeric(`In a right triangle, $\\tan\\theta=${frac(a,b)}$ for an acute angle $\\theta$. The leg adjacent to $\\theta$ has length $${b*k}$. What is the opposite leg's length?`,a*k,
    `Tangent is opposite over adjacent. Thus $${frac('x',b*k)}=${frac(a,b)}$, giving $x=${a*k}$. The hypotenuse is not part of the tangent ratio.`,v=>near(v/(b*k),a/b),[b*k,b*b*k/a,(a+b)*k])
})
f('special-triangle', G, 'trig', 'medium', () => {
  const k=int(2,80)
  return numeric(`In a $30^\\circ$-$60^\\circ$-$90^\\circ$ triangle, the hypotenuse has length $${2*k}$. What is the length of the side opposite the $30^\\circ$ angle?`,k,
    `The side ratio is $1:\\sqrt{3}:2$. The side opposite $30^\\circ$ is half the hypotenuse: $${2*k}/2=${k}$. It is the short leg.`,v=>near(2*v,2*k),[2*k,4*k,k*k])
})
f('circle-area', G, 'circles', 'easy', () => {
  const r=int(2,100)
  return numeric(`A circle has diameter $${2*r}$ units. Its area is $k\\pi$ square units. What is $k$?`,r*r,
    `The radius is half the diameter, so $r=${r}$. Area is $\\pi r^2=${r*r}\\pi$, giving $k=${r*r}$. Squaring the diameter instead makes the area four times too large.`,v=>near(Math.sqrt(v)*2,2*r),[4*r*r,2*r,r])
})
f('circle-radius-equation', G, 'circles', 'medium', () => {
  const h=int(-20,20), k=int(-20,20), r=int(2,30)
  return numeric(`The equation $(x${term(-h)})^2+(y${term(-k)})^2=${r*r}$ represents a circle. What is its radius?`,r,
    `A circle in standard form is $(x-h)^2+(y-k)^2=r^2$. Here $r^2=${r*r}$, so $r=${r}$. The right side is the radius squared, not the radius.`,v=>v>0&&near(v*v,r*r),[r*r,2*r,h])
})
f('circle-complete-square', G, 'circles', 'hard', () => {
  const h=int(2,18), k=int(2,18), r=int(3,25), c=h*h+k*k-r*r
  return numeric(`A circle is represented by $x^2+y^2-${2*h}x-${2*k}y${term(c)}=0$. What is its radius?`,r,
    `Complete both squares: $(x-${h})^2+(y-${k})^2=${h*h}+${k*k}-${c}=${r*r}$. Thus the radius is $${r}$. The squared terms added to the left must also be added to the right.`,v=>v>0&&near(h*h+k*k-v*v,c),[h,k,r*r])
})
f('arc-length', G, 'circles', 'medium', () => {
  const r=int(3,36), angle=pick([30,45,60,90,120,135,150,180,210,240,270,300])
  return numeric(`A circle has radius $${r}$ and a central angle of $${angle}^\\circ$. The intercepted arc has length $k\\pi$. What is $k$?`,angle*r/180,
    `Arc length is the angle's fraction of the circumference: $${frac(angle,360)}(2\\pi\\cdot${r})=${frac(angle*r,180)}\\pi$. Thus $k=${frac(angle*r,180)}$. Using $\\pi r^2$ instead computes a sector area.`,v=>near(v/(2*r),angle/360),[angle*r/360,angle*r*r/360,2*r])
})
f('sector-area', G, 'circles', 'medium', () => {
  const r=int(3,30), angle=pick([30,45,60,90,120,135,150,180,210,240,270,300])
  return numeric(`A sector in a circle of radius $${r}$ has central angle $${angle}^\\circ$. Its area is $k\\pi$. What is $k$?`,angle*r*r/360,
    `A sector occupies $${frac(angle,360)}$ of the circle. Multiply by $\\pi r^2$ to get $${frac(angle*r*r,360)}\\pi$, so $k=${frac(angle*r*r,360)}$. Arc length instead uses circumference.`,v=>near(v/(r*r),angle/360),[angle*r/180,angle*r*r/180,r*r])
})
f('radians', G, 'circles', 'easy', () => {
  const degrees=int(1,96)*15
  return numeric(`An angle measures $${degrees}^\\circ$, or $k\\pi$ radians. What is $k$?`,degrees/180,
    `Multiply degrees by $\\pi/180$: $${degrees}^\\circ=${frac(degrees,180)}\\pi$ radians. Therefore $k=${frac(degrees,180)}$. A full turn is $2\\pi$ radians, while a half turn is $\\pi$.`,v=>near(v*180,degrees),[degrees/360,180/degrees,degrees])
})

registerMathExpansion({f,A,N,D,G,int,pick,numeric,near,fmt,term,frac,table})
registerMathReasoning({f,A,N,D,G,int,pick,numeric,near,fmt,term,frac,table})
registerMathApplications({f,A,N,D,G,int,pick,numeric,near,fmt,term,frac})

// Exact fractions keep repeating-decimal answers usable in student-produced responses.
const gcd = (a,b) => { a=Math.abs(a); b=Math.abs(b); while(b) [a,b]=[b,a%b]; return a }
const answerText = (value) => {
  if (Number.isInteger(value)) return String(value)
  for(let d=2;d<=1000000;d++) {
    const n=Math.round(value*d)
    if (near(n/d,value) && Math.abs(n/d-value)<1e-10) { const g=gcd(n,d); return `${n/g}/${d/g}` }
  }
  throw Error(`No exact rational representation for ${value}`)
}
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value
const digest=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
const overlapRows=JSON.parse(readFileSync(join(root,'scripts/question-bank/family-overlaps.json'),'utf8'))
const overlaps=new Map(overlapRows.map(row=>[row.family,row]))
assert.equal(overlaps.size,overlapRows.length)
const outputs = new Map(), retiredOutputs = new Map(), counts = [], seen = new Set(), uniqueStimuli = new Set(), sourceById = new Map()
for (const file of readdirSync(out).filter(f=>f.endsWith('.json')&&!f.startsWith('generated-math-'))) {
  for(const q of JSON.parse(readFileSync(join(out,file),'utf8'))) {seen.add(`${q.passage??''}\n${q.prompt}`);uniqueStimuli.add(questionFingerprint(q));sourceById.set(q.id,q)}
}
for (const [familyIndex, family] of families.entries()) {
  // A separate deterministic stream per family preserves earlier families when adding more.
  state = 0x51a7f00d
  for (const ch of family.key) state = Math.imul(state ^ ch.charCodeAt(0), 16777619)
  const questions = []
  for(let attempt=0; questions.length<64 && attempt<20000; attempt++) {
    const item=family.make()
    if(!Number.isFinite(item.value) || !item.valid(item.value)) throw Error(`${family.key}: invalid answer ${item.value}`)
    const key=`${item.passage??''}\n${item.prompt}`
    if(seen.has(key)) continue
    const n=questions.length
    const q={id:`m-gen-${family.key}-${String(n+1).padStart(3,'0')}`,section:'math',domain:family.domain,skill:family.skill,difficulty:family.difficulty}
    if(item.passage) q.passage=item.passage
    q.prompt=item.prompt
    // Approximately 23% grid-ins, matching the digital SAT's response mix.
    if(n%13<3) {
      const exact=answerText(item.value)
      q.answer=[exact]
      const parsed=exact.includes('/') ? exact.split('/').map(Number).reduce((a,b)=>a/b) : Number(exact)
      assert(item.valid(parsed),`${q.id}: fraction changed the answer`)
    } else {
      const choices=[item.value]
      for(const trap of [...item.traps,item.value+1,item.value-1,item.value+2,item.value-2]) {
        if(choices.length===4) break
        if(Number.isFinite(trap)&&!item.valid(trap)&&!choices.some(v=>near(v,trap))) choices.push(trap)
      }
      assert.equal(choices.length,4,`${q.id}: insufficient unambiguous distractors`)
      const answerIndex=(n+familyIndex)%4
      const correct=choices.shift()
      choices.splice(answerIndex,0,correct)
      q.choices=choices.map(v=>{const exact=answerText(v);return exact.includes('/')?`$${frac(...exact.split('/'))}$`:tex(v)})
      q.answer=answerIndex
      assert.equal(choices.filter(v=>item.valid(v)).length,1,`${q.id}: ambiguous options`)
    }
    q.explanation=item.explanation
    questions.push(q); seen.add(key)
  }
  assert.equal(questions.length,64,`${family.key}: not enough unique variants`)
  // Filter after construction to preserve IDs and choice order for retained items.
  const uniqueQuestions=questions.filter(q=>{const fingerprint=questionFingerprint(q);if(uniqueStimuli.has(fingerprint))return false;uniqueStimuli.add(fingerprint);return true})
  const wantsSpr=familyIndex%13<3
  const representative=uniqueQuestions.find(q=>Array.isArray(q.answer)===wantsSpr)??uniqueQuestions[0]
  assert(representative,`${family.key}: no nonduplicate representative`)
  const overlap=overlaps.get(family.key)
  if(overlap){
   assert.equal(representative.id,overlap.candidateQuestionId,`${family.key}: recheck the overlap after changing its candidate`)
   assert.equal(digest(representative),overlap.candidateSha256,`${family.key}: candidate changed since overlap review`)
   const retained=sourceById.get(overlap.retainedQuestionId)
   assert(retained,`${family.key}: retained question must remain active`)
   assert.equal(digest(retained),overlap.retainedSha256,`${family.key}: retained question changed since overlap review`)
  }
  const partition=overlap?{active:[],retired:questions}:partitionFamily(questions,representative.id)
  const slug=family.domain===A?'algebra':family.domain===N?'advanced':family.domain===D?'data':'geometry'
  const name=`generated-math-${slug}.json`
  outputs.set(name,[...(outputs.get(name)??[]),...partition.active])
  retiredOutputs.set(name,[...(retiredOutputs.get(name)??[]),...partition.retired])
  counts.push({family:family.key,domain:family.domain,skill:family.skill,difficulty:family.difficulty,questions:partition.active.length,representative:overlap?.retainedQuestionId??representative.id,reviewCandidate:representative.id,archived:partition.retired.length,equivalentRepeats:questions.length-uniqueQuestions.length,...(overlap?{overlap}: {})})
}
assert.equal(counts.filter(row=>row.overlap).length,overlaps.size,'Every recorded family overlap must resolve to a generated family')
for(const [file,questions] of outputs) {
  const content=JSON.stringify(questions,null,2)+'\n'
  if(check) assert.equal(readFileSync(join(out,file),'utf8'),content,`${file} differs from the validated generator`)
  else writeFileSync(join(out,file),content)
}
for(const [file,questions] of retiredOutputs) {
 const content=JSON.stringify(questions,null,2)+'\n',path=join(root,'src/data/retired',file)
 if(check)assert.equal(readFileSync(path,'utf8'),content,`${file}: historical variants changed`)
 else writeFileSync(path,content)
}
const duplicatesRemoved=counts.reduce((n,f)=>n+f.equivalentRepeats,0)
const archivedTotal=counts.reduce((n,f)=>n+f.archived,0)
const report=JSON.stringify({provenance:'One active representative per original math family; numerical siblings and equivalent repeats are retained only for historical attempts. Not official College Board questions.',maximumActivePerFamily:1,candidatesPerFamily:64,duplicatesRemoved,archivedTotal,total:counts.reduce((n,f)=>n+f.questions,0),families:counts},null,2)+'\n'
if(check) assert.equal(readFileSync(join(root,'docs/math-generation-report.json'),'utf8'),report)
else writeFileSync(join(root,'docs/math-generation-report.json'),report)
console.log(`${check?'Verified':'Generated'} ${counts.reduce((n,f)=>n+f.questions,0)} active math representatives; ${overlaps.size} patterns covered by existing questions; ${archivedTotal} historical variants, including ${duplicatesRemoved} equivalent repeats; forward-model and single-correct-option checks passed.`)
