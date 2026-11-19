"""Independent exact models for all 48 legacy Advanced Math questions.

Givens are manually transcribed; the stored key never supplies a model result.
Symbolic options are parsed separately. Prose interpretations are explicit.
"""
import hashlib
import json
import re
from pathlib import Path
import sympy as s
from review_math_common import expression, solution_choice

ROOT = Path(__file__).resolve().parents[2]
QUESTIONS = json.loads((ROOT/'src/data/questions/m-adv-2.json').read_text())
BY_ID = {q['id']: q for q in QUESTIONS}
SYMBOLS = {name: s.Symbol(name, real=True) for name in 'xyabpkcqt'}
x, y, a, b, p, k, c, q, t = (SYMBOLS[name] for name in 'xyabpkcqt')
reviews = []


def expr(text, symbols=None):
    return expression(text, SYMBOLS if symbols is None else symbols)


def finish(number, model, result, flags=None, notes=None):
    item = BY_ID[f'm-adv-{number}']
    if flags is not None:
        flags = [bool(value) for value in flags]
        assert len(flags) == 4 and sum(flags) == 1, (item['id'], flags)
        assert flags[item['answer']], (item['id'], 'incorrect stored key', flags)
    else:
        for answer in item['answer']:
            assert s.simplify(expr(answer)-result) == 0, (item['id'], answer, result)
    digest = hashlib.sha256(json.dumps(item,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    reviews.append({'id':item['id'],'sourceSha256':digest,'model':model,'derivedResult':str(result),'validChoices':flags,'editorialNotes':notes or []})


def numeric(number, result, model, notes=None):
    item = BY_ID[f'm-adv-{number}']
    flags = [s.simplify(expr(z.replace('\\%', ''))-result)==0 for z in item['choices']] if 'choices' in item else None
    finish(number,model,result,flags,notes)


def equivalent(number, result, model, symbols=None, notes=None):
    flags = [s.simplify(expr(z.split('=')[-1],symbols)-result)==0 for z in BY_ID[f'm-adv-{number}']['choices']]
    finish(number,model,result,flags,notes)


def solutions(number, result, model, notes=None):
    finish(number,model,result,[solution_choice(z,SYMBOLS)==result for z in BY_ID[f'm-adv-{number}']['choices']],notes)


def positive_root(polynomial, variable=x):
    roots = s.solveset(polynomial, variable, domain=s.Interval.open(0,s.oo))
    assert len(roots) == 1, roots
    return next(iter(roots))


equivalent(101,s.expand(4*x*(2*x-3)+5*x),'Distribute and combine like terms.')
equivalent(102,s.expand((2*x**3*y**2)*(5*x**4*y)),'Multiply coefficients and add exponents of each base.')
numeric(103,s.expand((3*x-4)**2).coeff(x), 'Read the linear coefficient after expanding the squared binomial.')
equivalent(104,x*x-11*x+24,'Expand every candidate factorization and compare coefficients.')
equivalent(105,s.cancel((12*x**5-8*x**3)/(4*x*x)),'Divide each numerator term by 4x^2 on x!=0.',notes=['Clarified that the x^3 distractor incorrectly combines unlike numerator terms as 4x^5.'])
equivalent(106,s.expand((2*x+5)*(x-3)),'Multiply positive side lengths to obtain area, not perimeter.')
equivalent(107,s.cancel((x*x-9)/(x*x+5*x+6)),'Cancel common polynomial factors on the original domain excluding -3,-2.')
numeric(108,s.Integer(2)+s.Rational(1,2)-s.Rational(1,4),'Add/subtract exponents for positive x.')
poly=5*x*x-13*x-6
finish(109,'A polynomial is divisible by a listed factor exactly when the division remainder vanishes.',s.factor(poly),[s.rem(poly,expr(z),x)==0 for z in BY_ID['m-adv-109']['choices']])
# For positive bases, the logarithmic derivative is the constant growth rate.
target=500*s.Rational(121,100)**t
flags=[]
for z in BY_ID['m-adv-110']['choices']:
    candidate=expr(z)
    flags.append(candidate.subs(t,0)==target.subs(t,0) and s.simplify(s.expand_log(s.diff(candidate,t)/candidate-s.diff(target,t)/target,force=False))==0)
finish(110,'Compare initial values and exact continuous log-growth rates; the equivalent expression counts 2t half-years.',target,flags)
equivalent(111,x*x-10*x+31,'Expand each proposed completed-square expression.')
coefficients=s.Poly((3*x+k)*(4*x-1)-(12*x*x+5*x-2),x).all_coeffs()
numeric(112,s.solve(coefficients,k)[k],'Require all coefficients of the identity difference to be zero.')
equivalent(113,s.cancel((2*x*x+7*x+1)/(x+3)),'Perform exact rational-function division on x!=-3.',notes=['Clarified that one distractor uses the quotient and remainder for x-3 while retaining the displayed denominator x+3; another adds 1 and 3 instead of subtracting.'])
coefficients=s.Poly((x*x+p*x+4)*(x-3)-(x**3+q*x*x-11*x-12),x).all_coeffs()
numeric(114,s.solve(coefficients,(p,q))[q],'Match every coefficient in the polynomial identity.')
positive={**SYMBOLS,'x':s.Symbol('x',positive=True),'y':s.Symbol('y',positive=True)}
xx,yy=positive['x'],positive['y']
equivalent(115,s.simplify((8*xx**5*yy**-2/(xx**-1*yy**4))**s.Rational(1,3)),'Use positive x,y to justify rational powers after subtracting exponents.',positive)
equivalent(116,s.cancel((x*x-4)/(x*x+x-6)*(x+3)/(x*x+4*x+4)),'Cancel factors only where the original denominators are nonzero (-3,2,-2 excluded).')
solutions(117,s.solveset((x-4)*(2*x+3),x,domain=s.S.Reals),'Set each factor to zero.')
numeric(118,positive_root(3*x*x-48),'Solve over positive real x.')
numeric(119,next(iter(s.solveset(s.sqrt(x-2)-5,x,domain=s.S.Reals))),'Solve the original radical equation over the reals.')
rootset=s.solveset(x*x-4-5,x,domain=s.S.Reals)
finish(120,'Substitute y=5; test listed x-values in the exact real solution set.',rootset,[expr(z) in rootset for z in BY_ID['m-adv-120']['choices']])
numeric(121,positive_root(-16*t*t+64,t),'Set height to zero and require positive elapsed time.')
solutions(122,s.solveset(x*x+6*x-2,x,domain=s.S.Reals),'Solve the quadratic exactly and expand each plus/minus option.')
rootset=s.solveset(x*x-6*x+13-(2*x-3),x,domain=s.S.Reals)
assert len(rootset)==1
numeric(123,(2*x-3).subs(x,next(iter(rootset))),'Find the unique intersection and return its y-coordinate.')
rootset=s.solveset(12/x-(x+1),x,domain=s.S.Reals)
finish(124,'Solve the original rational equation, excluding x=0.',rootset,[expr(z) in rootset for z in BY_ID['m-adv-124']['choices']])
solutions(125,s.solveset(s.sqrt(4*x+1)-(2*x-1),x,domain=s.S.Reals),'Solve the original radical equation, rejecting the root introduced by squaring.')
numeric(126,positive_root(x*(x+4)-96),'Width is positive and width times width+4 equals 96.')
numeric(127,max(s.solveset(x**4-13*x*x+36,x,domain=s.S.Reals)),'Solve the biquadratic over the reals and return its greatest root.')
rootset=s.solveset(x*x+2*x-3-(x+3),x,domain=s.S.Reals)
counts={'Exactly one':1,'Zero':0,'Infinitely many':s.oo,'Exactly two':2}
assert set(counts)==set(BY_ID['m-adv-128']['choices'])
finish(128,'Each distinct real x at the line-parabola intersection gives exactly one y.',len(rootset),[counts[z]==len(rootset) for z in BY_ID['m-adv-128']['choices']])
xx=positive_root(x*x+(x+1)**2-25)
numeric(129,xx*(xx+1),'Substitute y=x+1 into the circle and select the solution with positive x.')
finish(130,'No real roots requires discriminant 36-8c<0.','c>9/2',[36-8*expr(z)<0 for z in BY_ID['m-adv-130']['choices']])
solutions(131,s.solveset(x/(x-2)-8/(x*x-4)-2/(x+2),x,domain=s.Complement(s.S.Reals,s.FiniteSet(-2,2))),'Solve on the original domain excluding both denominator zeros.')
numeric(132,positive_root(1/x+1/(x+3)-s.Rational(1,2)),'Add the positive individual drainage rates and solve for pump A time.')
numeric(133,((x*x+8)/(x-1)).subs(x,3),'Evaluate the rational function at x=3.')
equivalent(134,50*s.Rational(4,5)**t,'A 20% annual decrease retains 4/5 of the previous value each year.')
numeric(135,3*s.sqrt(2+7)-2,'Evaluate the inner function, then the outer function.')
f=2*(x-3)**2+5
assert s.diff(f,x,2)>0
numeric(136,f.subs(x,s.solve(s.diff(f,x),x)[0]),'The upward quadratic attains its global minimum at its critical point.')
table={0:3,1:6,2:12,3:24}
finish(137,'Test every listed function at all four given table inputs.',table,[all(expr(z.split('=')[1]).subs(x,u)==v for u,v in table.items()) for z in BY_ID['m-adv-137']['choices']],['Clarified that fitting a finite table establishes that a candidate could define f, not that f must be globally exponential.'])
numeric(138,s.solve(s.diff((x+4)*(x-6),x),x)[0],'Find the vertex of the expanded quadratic by its zero derivative.')
numeric(139,1200*s.Integer(2)**s.Rational(15,5),'Evaluate the initial population times the doubling factor.')
equivalent(140,(x-2)**2+3,'Substitute x-2 into f, then add 3.')
table={-1:7,0:2,1:-1,2:-2,3:-1}
finish(141,'Verify each candidate quadratic against all five table rows.',s.interpolate(list(table.items()),x),[all(expr(z.split('=')[1]).subs(x,u)==v for u,v in table.items()) for z in BY_ID['m-adv-141']['choices']])
f=-5*x*x+300*x-2000
assert s.diff(f,x,2)<0
numeric(142,s.solve(s.diff(f,x),x)[0],'The downward quadratic has a global maximum at its vertex; return price, not profit.',['Specified the omitted factor in the 150-dollar distractor calculation.'])
aa=s.solve(a*(5-3)**2-8-4,a)[0]
numeric(143,aa*(0-3)**2-8,'Find the vertex-form scale from (5,4), then evaluate at zero.')
numeric(144,100*(s.Rational(105,100)**s.Rational(6,3)-1),'Compute six-year compounded growth and convert the increase to percent.')
# A general polynomial satisfying the premise is 7+(x-3)Q(x).
Q=s.Function('Q')
general=7+(x-3)*Q(x)
tests={
 '$x - 3$ is a factor of $p(x)$.':general.subs(x,3),
 '$x - 3$ is a factor of $p(x) - 7$.':(general-7).subs(x,3),
 '$x + 3$ is a factor of $p(x) - 7$.':(general-7).subs(x,-3),
 '$x - 7$ is a factor of $p(x) - 3$.':(general-3).subs(x,7),
}
assert set(tests)==set(BY_ID['m-adv-145']['choices'])
finish(145,'Use the factor theorem on the general polynomial 7+(x-3)Q(x). Only one stated remainder is identically zero.',tests,[tests[z]==0 for z in BY_ID['m-adv-145']['choices']],['The nonzero symbolic remainders need not be nonzero for every polynomial; they establish that those choices are not guaranteed.'])
coeff=s.solve([3*a+b-11,4*a+b-14],(a,b))
numeric(146,((a*x+b)/(x-2)).subs(coeff).subs(x,6),'Solve both function-value constraints exactly, then evaluate at 6.')
solutions(147,s.solveset((2*x)**2-3*(2*x)-10,x,domain=s.S.Reals),'Compose f(2x) before solving for zeros.')
bb=positive_root(x*x-s.Rational(108,12))
numeric(148,s.Integer(12)/bb,'Divide f(3) by f(1), use positive b to choose its root, and recover a=f(0).')

assert len(reviews)==len(QUESTIONS)==48
assert {row['id'] for row in reviews}==set(BY_ID)
hashfile=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
report={'scope':'48 original Advanced Math questions in m-adv-2.json only; other bank items are not certified by this review.','method':'Independent manually transcribed givens, exact symbolic solution sets and comparisons against every mathematical choice; explicit editorial models for prose interpretations.','engine':f'SymPy {s.__version__}','solverSha256':hashfile(Path(__file__)),'helperSha256':hashfile(Path(__file__).with_name('review_math_common.py')),'requirementsSha256':hashfile(ROOT/'scripts/question-bank/requirements-review.txt'),'questionsReviewed':len(reviews),'items':reviews}
(ROOT/'docs/legacy-advanced-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Independently checked {len(reviews)} original Advanced Math questions and recorded source hashes.')
