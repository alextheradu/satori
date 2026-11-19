"""Fresh exact models for 49 selected Advanced Math family candidates.

Givens are transcribed from the prompts independently of stored keys. Original
selected candidates remain reviewable after overlap retirement. All options and
typed aliases are compared to the independently derived mathematical result.
"""
import hashlib
import json
from pathlib import Path
import sympy as s
from review_math_common import expression

ROOT=Path(__file__).resolve().parents[2]
generation=json.loads((ROOT/'docs/math-generation-report.json').read_text())
families=[row for row in generation['families'] if row['domain']=='Advanced Math']
selected=[row['reviewCandidate'] for row in families]
records=[q for folder in ['questions','retired'] for path in (ROOT/f'src/data/{folder}').glob('*.json') for q in json.loads(path.read_text())]
by_id={q['id']:q for q in records}
family_by_name={row['family']:row for row in families}
active_ids={q['id'] for path in (ROOT/'src/data/questions').glob('*.json') for q in json.loads(path.read_text())}
x,t,k,a,b,c=s.symbols('x t k a b c',real=True)
symbols=dict(zip('xtkabc',(x,t,k,a,b,c)))
reviews=[]


def finish(family,result,model,notes=None):
    id=family_by_name[family]['reviewCandidate'];q=by_id[id]
    if 'choices' in q:
        flags=[bool(s.simplify(expression(z,symbols)-result)==0) for z in q['choices']]
        assert sum(flags)==1 and flags[q['answer']],(id,flags,result)
    else:
        flags=None
        for answer in q['answer']:assert s.simplify(expression(answer,symbols)-result)==0,(id,answer,result)
    digest=hashlib.sha256(json.dumps(q,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    reviews.append({'id':id,'sourceSha256':digest,'model':model,'derivedResult':str(result),'validChoices':flags,'active':id in active_ids,'editorialNotes':notes or []})


def real_roots(polynomial,domain=s.S.Reals):return s.solveset(polynomial,x,domain=domain)
def minimum(polynomial):
    assert s.diff(polynomial,x,2)>0
    return polynomial.subs(x,s.solve(s.diff(polynomial,x),x)[0])


finish('binomial-middle',s.expand((11*x-9)**2).coeff(x),'Expand the squared binomial and extract its linear coefficient.')
coefficients=s.Poly((x-7)*(x-k)-(x*x-23*x+112),x).all_coeffs()
finish('factor-coefficient',s.solve(coefficients,k)[k],'Require every coefficient of the factorization identity to agree.')
f=(x*x-6*x-112)/(x-14)
finish('rational-cancel',f.subs(x,21),'Evaluate the original rational expression at 21, an allowed input.')
assert s.Rational(21,7)==3
finish('exponent-quotient',s.Integer(9)-4,'Divide coefficients and subtract the exponents on nonzero x.')
finish('remainder',s.rem(5*x**3+10*x+29,x,x),'Compute the polynomial-division remainder directly; the divisor is x.')
finish('quadratic-roots',max(real_roots((x-3)*(x-8))),'Solve both zero-product branches and return the greater root.')
finish('root-sum',sum(real_roots(2*x*x-72*x+486)),'Solve the quadratic exactly and add its two roots.')
finish('root-product',s.prod(real_roots(3*x*x-57*x+180)),'Solve the quadratic exactly and multiply its roots.')
finish('one-real-root',s.solve(s.discriminant(12*x*x-144*x+k,x),k)[0],'A genuine quadratic has one distinct real root exactly when its discriminant is zero.')
roots=real_roots(s.sqrt(9*x+11)-s.sqrt(83));assert len(roots)==1
finish('radical-equation',next(iter(roots)),'Solve the original principal-root equation on the real domain.')
roots=real_roots(4/(x-10)-s.Rational(1,12),s.Complement(s.S.Reals,s.FiniteSet(10)));assert len(roots)==1
finish('rational-equation',next(iter(roots)),'Solve on the domain excluding the denominator zero.')
finish('quadratic-line-system',max(real_roots((x-16)**2+6-55)),'Set both y-values equal, solve both real x-values, and select the greater.')
finish('vertex-minimum',minimum(3*(x-9)**2+6),'Find the minimum of the upward quadratic independently from its derivative.')
f=5*x*x-40*x+91
finish('vertex-input',s.solve(s.diff(f,x),x)[0],'The positive leading coefficient makes the zero-derivative input the minimizer.')
finish('exponential-evaluate',44*s.Integer(3)**4,'Substitute the stated input into the exponential model.')
finish('growth-percent',100*(s.Rational(125,100)-1),'Convert the annual growth multiplier to a percent increase.')
finish('decay-percent',100*(1-s.Rational(62,100)),'Convert annual retention to the percent lost.')
times=s.solveset(59*s.Integer(2)**(t/5)-944,t,domain=s.S.Reals);assert len(times)==1
finish('exponential-period',next(iter(times)),'Solve the original exponential time equation exactly.')
finish('function-shift',(3*x*x+7).subs(x,7-3),'Evaluate the shifted input before the quadratic.')
roots=sorted(real_roots(4*x*x-92*x+240))
finish('quadratic-root-distance',roots[1]-roots[0],'Solve both roots and take the positive ordered difference.')
finish('quadratic-root-square-sum',sum(root**2 for root in real_roots(6*x*x-108*x+480)),'Solve the quadratic and add the squared roots.')
smaller=s.sqrt(s.Rational(90,5)/2)
finish('quadratic-root-ratio',-5*(smaller+2*smaller),'The roots are positive with ratio 2 and product 90/5. Recover the smaller root and use the sum coefficient.')
threshold=s.solve(s.discriminant(12*x*x-96*x+k,x),k)[0]
finish('discriminant-integer-bound',s.ceiling(threshold)-1,'Two distinct real roots require k below the zero-discriminant threshold; take the greatest integer strictly below it.')
roots=real_roots(s.sqrt(4*x+180)-(x-3));assert len(roots)==1
finish('radical-extraneous-root',next(iter(roots)),'Solve the original radical equation, retaining the sign condition on its right side.')
finish('absolute-root-sum',sum(real_roots(s.Abs(10*x-150)-12)),'Solve both branches of the original absolute-value equation and add their roots.')
shifted=s.expand(5*(x+4)**2+6*(x+4)+4)
assert shifted.coeff(x,0)==108 and shifted.coeff(x,2)==5
finish('quadratic-input-translation',shifted.coeff(x),'Expand the translated quadratic and extract its linear coefficient, checking the stated other coefficients.')
finish('vertex-parameter-from-point',s.Rational(1608-24,(24-12)**2),'Use the given nonvertex point in vertex form to recover the scale.')
polynomial=s.interpolate([(-3,-21),(0,-6),(3,63)],x)
finish('quadratic-second-difference',polynomial.coeff(x,2),'Interpolate the exact quadratic from all three table points and read its leading coefficient.')
base=(s.Rational(78125,625))**s.Rational(1,3)
finish('exponential-nonzero-inputs',s.Integer(625)/base**2,'The output ratio is b^3; use positive b to recover the initial scale.')
linear=s.cancel((x*x+4*x-12)/(x-2))
assert s.degree(linear,x)==1
finish('rational-hole-extension',linear.subs(x,2),'A linear function agreeing off the excluded point is uniquely the canceled linear expression; evaluate that extension.')
coefficients=s.Poly((x-9)*(8*x+6)-(8*x*x+k*x-54),x).all_coeffs()
finish('rational-identity-coefficient',s.solve(coefficients,k)[k],'Multiply by the nonzero divisor and match every polynomial coefficient.')
roots=real_roots(3*x*x-90*x+627)
finish('reciprocal-root-sum',sum(1/root for root in roots),'Solve both nonzero roots and sum their reciprocals directly.')
roots=real_roots(6*((5*x-14)-1)*((5*x-14)-9))
finish('transformed-quadratic-roots',sum(roots),'Compose the affine input into the factored quadratic and solve its new zeros.')
polynomial=8*(x+7)**2-17-(96*x+b)
finish('quadratic-tangent-intercept',s.solve(s.discriminant(polynomial,x),b)[0],'Equate the original line and parabola and require the discriminant to vanish.',['Parenthesized negative shifts and signed constants in the explanation to avoid adjacent minus signs.'])
ratio=s.Rational(67-25,25-11)
scale=s.Rational(25-11)/(ratio-1)
finish('exponential-vertical-offset',11-scale,'Use successive output differences to recover the base and scale, then the vertical offset.')
area=x*(204-2*x)
critical=s.solve(s.diff(area,x),x)[0]
assert 0<critical<102 and s.diff(area,x,2)<0
finish('three-sided-enclosure-maximum',area.subs(x,critical),'Use the three-side fencing constraint, find the downward quadratic maximum, and check the physical width domain.')
finish('biquadratic-positive-root',min(real_roots(x**4-146*x*x+3025,s.Interval.open(0,s.oo)))),'Solve the original quartic over positive reals and select the smaller root.')
coefficients=s.Poly((2*x-9)*(4*x*x+k*x+81)-(8*x**3-729),x).all_coeffs()
finish('difference-cubes-identity',s.solve(coefficients,k)[k],'Expand the full identity and require every coefficient difference to be zero.')
p=x**3+8*x*x+b*x+c
coeff=s.solve([p.subs(x,1)-12,p.subs(x,8)-985],(b,c))
finish('cubic-coefficient-from-values',coeff[b],'Solve both polynomial-value constraints simultaneously for the unknown coefficients.')
roots=real_roots(1/(x+8)+1/x,s.Complement(s.S.Reals,s.FiniteSet(-8,0)));assert len(roots)==1
finish('reciprocal-cancellation-equation',next(iter(roots)),'Solve the original rational equation on its full stated domain.')
lead=s.Symbol('lead',positive=True)
linear_coefficient=s.solve(lead*(-15)**2+b*(-15)+c-(lead*(-3)**2+b*(-3)+c),b)[0]
axis=s.simplify(-linear_coefficient/(2*lead))
finish('quadratic-equal-output-axis',axis,'Write an arbitrary upward quadratic and impose the equal-output condition; derive its axis independently of scale and constant.')
smaller=min(real_roots(x*x-31*x+198))
finish('shared-smaller-root-parameter',s.solve(smaller**2+k*smaller+324,k)[0],'Solve the first quadratic, select its specified smaller root, and substitute into the second.')
finish('absolute-distance-outer-solution',max(real_roots(s.Abs(x-2)+s.Abs(x-15)-21)),'Solve the original two-distance equation over the reals and select its greater solution.')
root=s.solve(x+4-2*(23-x),x)[0]
assert 7**(root+4)==49**(23-root)
finish('exponential-base-rewrite-equation',root,'Rewrite 49 as 7^2, equate exponents, then verify the result in the original equation.')
u=s.Symbol('u',positive=True)
radical=s.simplify(s.sqrt(9*x*x+108*x+324).subs(x,-6-u))
coeff=s.solve(s.Poly(c*(-6-u)+b-radical,u).all_coeffs(),(c,b))
finish('negative-branch-radical-identity',coeff[c],'Parameterize the strict domain as x=-6-u with u>0; simplify the principal square root and recover the coefficient without forcing a sign identity.')
finish('repeated-root-cubic-coefficient',s.expand(6*(x+3)**2*(x-5)).coeff(x),'Expand the original cubic product and extract the linear coefficient.')
finish('reflected-quadratic-minimum',minimum(15-5*(-3*(x+11)**2+34)),'Compose the output reflection and scaling, then independently minimize the resulting upward quadratic.')
roots=real_roots(16/(x-7)-8/(x-11),s.Complement(s.S.Reals,s.FiniteSet(7,11)));assert len(roots)==1
finish('two-denominator-rational-equation',next(iter(roots)),'Solve on the real domain excluding both original denominator zeros.')
roots=real_roots((x+15)**2-24-(6*x+57))
finish('parabola-line-intersection-count',s.Integer(len(roots)),'Solve the intersection equation exactly and count distinct real x-values, each determining one y.',['Corrected singular/plural wording in the generated explanation.'])

assert len(reviews)==len(families)==49
assert {row['id'] for row in reviews}==set(selected)
hashfile=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
report={'scope':'49 selected Advanced Math family candidates, including 12 now-retired overlaps; other unreviewed generated domains are outside this review.','method':'Fresh exact models of manually transcribed givens, symbolic solutions, domain restrictions, extrema and comparisons against every listed mathematical option or typed alias. Natural-language interpretations are editorially supplied.','engine':f'SymPy {s.__version__}','solverSha256':hashfile(Path(__file__)),'helperSha256':hashfile(Path(__file__).with_name('review_math_common.py')),'requirementsSha256':hashfile(ROOT/'scripts/question-bank/requirements-review.txt'),'selectionSha256':hashlib.sha256(json.dumps(selected,separators=(',',':')).encode()).hexdigest(),'questionsReviewed':len(reviews),'activeQuestionsReviewed':sum(row['active'] for row in reviews),'items':reviews}
(ROOT/'docs/generated-advanced-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Independently checked all {len(reviews)} selected Advanced Math candidates ({report["activeQuestionsReviewed"]} active).')
