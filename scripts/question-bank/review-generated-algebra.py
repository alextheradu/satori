"""Independent exact models for the 41 reviewed Algebra family candidates.

The original selected candidate remains reviewable even when retired as an
overlap. Models are manually transcribed from its givens, not the stored key.
All numerical choices and typed answers are compared to freshly derived results.
"""
import hashlib
import json
from pathlib import Path
import sympy as s
from review_math_common import expression

ROOT=Path(__file__).resolve().parents[2]
generation=json.loads((ROOT/'docs/math-generation-report.json').read_text())
families=[row for row in generation['families'] if row['domain']=='Algebra']
selected=[row['reviewCandidate'] for row in families]
records=[q for folder in ['questions','retired'] for path in (ROOT/f'src/data/{folder}').glob('*.json') for q in json.loads(path.read_text())]
by_id={q['id']:q for q in records}
family_by_name={row['family']:row for row in families}
active_ids={q['id'] for path in (ROOT/'src/data/questions').glob('*.json') for q in json.loads(path.read_text())}
x,y,k,t=s.symbols('x y k t',real=True)
symbols=dict(zip('xykt',(x,y,k,t)))
reviews=[]


def finish(family,result,model,notes=None):
    id=family_by_name[family]['reviewCandidate']
    q=by_id[id]
    if 'choices' in q:
        flags=[bool(s.simplify(expression(choice,symbols)-result)==0) for choice in q['choices']]
        assert sum(flags)==1 and flags[q['answer']],(id,flags,result)
    else:
        flags=None
        for answer in q['answer']:assert s.simplify(expression(answer,symbols)-result)==0,(id,answer,result)
    digest=hashlib.sha256(json.dumps(q,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    reviews.append({'id':id,'sourceSha256':digest,'model':model,'derivedResult':str(result),'validChoices':flags,'active':id in active_ids,'editorialNotes':notes or []})


finish('distribute',s.solve(6*(x+7)+19+23,x)[0],'Solve 6(x+7)+19=-23.')
finish('both-sides',s.solve(12*x+21-(5*x+168),x)[0],'Solve the equation with x terms on both sides.')
finish('fraction-linear',s.solve(s.Rational(3,2)*x+24-6,x)[0],'Solve the rational-coefficient equation exactly.')
finish('literal-equation',s.solve(8*x+7*15-177,x)[0],'Substitute y=15,z=177 into z=8x+7y.')
finish('identity-parameter',s.solve(s.Poly(4*(x+18)-(4*x+k+8),x).as_expr(),k)[0],'The x terms cancel identically; require the constant difference to vanish.')
finish('coordinate-substitution',s.solve(8*11+6*y-46,y)[0],'Substitute the point x-coordinate before solving for y.')
finish('intercept-standard',s.solve(10*0+2*y-10,y)[0],'At the y-intercept x=0.')
finish('slope-points',s.Rational(-31-(-13),18-15),'Compute change in y over change in x using consistent order.')
finish('parallel-intercept',20-8*14,'A parallel line keeps slope 8; use its given point to recover the intercept.')
table=[(9,53),(11,61),(13,69)]
finish('linear-table',s.interpolate(table,x).subs(x,15),'Interpolate all three table values, confirm degree one, and evaluate at 15.')
assert s.degree(s.interpolate(table,x),x)==1
finish('service-fee',s.Integer(53)+3*5,'Add the fixed charge once and the five-hour charge.')
line=s.interpolate([(8,-19),(10,-25)],x)
finish('linear-from-values',line.subs(x,0),'Recover the linear function from both specified values, then evaluate at zero.',['Parenthesized the signed slope in the intercept calculation to avoid adjacent minus signs.'])
finish('break-even',s.solve(9*t+38-(7*t+74),t)[0],'Set the complete cost expressions equal.')
solution=s.solve([5*x+2*y+62,5*x-2*y+38],(x,y))
finish('system-eliminate',solution[x],'Solve the original linear system and return x.')
solution=s.solve([x+y-83,11*x+4*y-619],(x,y))
finish('ticket-system',solution[x],'Use adult and student counts summing to 83 and revenue 619.')
solution=s.solve([8*x+5*y-56,x-y-7],(x,y))
finish('system-expression',(32*x+20*y).subs(solution),'Independently solve the system and evaluate the requested linear combination.')
parameter=s.solve(s.det(s.Matrix([[10,3],[20,k]])),k)[0]
matrix=s.Matrix([[10,3],[20,parameter]])
assert matrix.rank()==matrix.row_join(s.Matrix([5,10])).rank()==1
finish('infinite-system',parameter,'Find the zero determinant and confirm equal coefficient/augmented ranks below two.')
finish('budget-bound',s.floor(s.Rational(636-7,14)),'Remove the fee, divide by unit price, and round down to an affordable whole count.')
finish('minimum-target',s.ceiling(s.Rational(250-91,18)),'Solve the minimum-points inequality and round upward.')
interval=s.solve_univariate_inequality(18-7*x<11,x,relational=False)
finish('negative-inequality',s.floor(interval.inf)+1,'The strict lower boundary is x>1; find the first integer above it.')
finish('two-resource-bound',s.floor(s.Rational(137-7*14,7)),'Deduct material used by 14 small items and divide by the large-item requirement.',['The representative happens to use equal material amounts for both sizes. Replaced an explanation that incorrectly called those requirements different.'])
parameter=s.solve(s.Poly(14*(x+4)+2-(k*x+71),x).coeff_monomial(x),k)[0]
assert s.expand(14*(x+4)+2-(parameter*x+71))!=0
finish('parameter-no-solution',parameter,'Cancel the x coefficient while preserving a nonzero constant difference.')
solution=s.solve([3*x+5*y+41,4*x+5*y+48],(x,y))
finish('system-linear-combination',(19*x+25*y).subs(solution),'Solve both equations exactly and evaluate the full requested combination.')
finish('perpendicular-standard-parameter',s.solve(s.Rational(-4,3)*(-12/k)+1,k)[0],'Require the two nonvertical slopes to multiply to -1.')
f=12*x-12;g=3*f.subs(x,x-2)+15
finish('transformed-linear-intercept',g.subs(x,0),'Apply the input shift and output scaling before evaluating g(0).')
finish('tiered-usage-fee',3+s.Rational(62-20,6),'Separate the included three hours from the additional-hour charge.')
interval=s.solve_univariate_inequality(14*x+11<7*x+74,x,relational=False)
finish('strict-plan-last-integer',s.ceiling(interval.sup)-1,'Find the greatest integer strictly below the equal-cost threshold.')
interval=s.Intersection(s.solve_univariate_inequality(-35<3*x+7,x,relational=False),s.solve_univariate_inequality(3*x+7<=28,x,relational=False))
finish('compound-integer-count',s.floor(interval.sup)-s.floor(interval.inf),'Count integers above the strict lower boundary and at or below the inclusive upper boundary.')
parameter=s.solve(s.det(s.Matrix([[10,11],[70,k]])),k)[0]
matrix=s.Matrix([[10,11],[70,parameter]])
assert matrix.rank()<matrix.row_join(s.Matrix([29,213])).rank()
finish('unique-system-exception',parameter,'Find the exceptional zero determinant and verify inconsistency at that parameter.')
intercepts=(s.Rational(672,7),s.Rational(672,8))
finish('intercept-midpoint-sum',sum(intercepts)/2,'Find both axis intercepts, average their coordinates, and add the midpoint coordinates.')
translated=9*(x-3)+18+45
finish('translated-line-zero',s.solve(translated,x)[0],'Translate the original graph right by 3 and up by 45, then find its zero.')
f=8*x+24
finish('linear-self-composition',f.subs(x,f.subs(x,0)),'Evaluate the function twice, using the first output as the next input.')
finish('average-cost-minimum-count',s.ceiling(s.Rational(51,14-9)),'Divide total cost by positive count and solve the average-cost ceiling.')
solution=s.solve([x+y-87,s.Rational(40,100)*x+s.Rational(80,100)*y-s.Rational(456,10)],(x,y))
finish('two-concentration-mixture',solution[x],'Solve total volume and total concentrate equations together.')
finish('catch-up-converted-rate',s.Integer(165)/(38-s.Rational(1980,60)),'Convert B to meters/minute, then divide initial gap by relative speed.')
middle=s.Rational(210,3)
assert middle.is_integer and middle%2==0
assert middle-2+middle+middle+2==210
finish('consecutive-even-middle',middle,'Represent the consecutive even integers symmetrically about their middle.')
composition=(7*x+38-k)/7
finish('inverse-linear-composition-parameter',s.solve(s.expand(composition-x),k)[0],'Make g(f(x))-x vanish identically.')
finish('intercept-ratio-through-point',s.Integer(3)+3*22,'If intercept coordinates are h and h/3, the line equation is x+3y=h. Substitute the given point.')
m,b=s.symbols('m b',real=True)
condition=s.solve(m*(-18)+b-24,b)[0]
target=m*(-34)+b+m*(-2)+b
finish('symmetric-linear-output-sum',s.simplify(target.subs(b,condition)),'Write an arbitrary linear function, impose its one known value, and verify the symmetric sum is independent of slope.')
bound=s.floor(s.Rational(67-8*2,5))
assert 5*bound+8*2<=67 and 5*(bound+1)+8*2>67
finish('feasible-integer-coordinate-bound',bound,'Because both resource coefficients are positive, minimal y=2 maximizes the admissible x bound; verify the integer boundary.')
diagonal=s.solve(3*t+7*t-110,t)[0]
finish('system-solution-on-diagonal',s.solve(12*diagonal+k*diagonal-275,k)[0],'Use x=y in the first equation to recover both coordinates, then solve the second parameter.')

assert len(reviews)==len(families)==41
assert {row['id'] for row in reviews}==set(selected)
hashfile=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
report={'scope':'41 selected Algebra family candidates, including eight now-retired overlaps; other generated math domains are outside this review.','method':'Fresh exact models manually transcribed from the selected prompt constraints; every mathematical option and typed alias compared independently. Natural-language givens and geometric meanings are not inferred automatically.','engine':f'SymPy {s.__version__}','solverSha256':hashfile(Path(__file__)),'helperSha256':hashfile(Path(__file__).with_name('review_math_common.py')),'requirementsSha256':hashfile(ROOT/'scripts/question-bank/requirements-review.txt'),'selectionSha256':hashlib.sha256(json.dumps(selected,separators=(',',':')).encode()).hexdigest(),'questionsReviewed':len(reviews),'activeQuestionsReviewed':sum(row['active'] for row in reviews),'items':reviews}
(ROOT/'docs/generated-algebra-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Independently checked all {len(reviews)} selected Algebra candidates ({report["activeQuestionsReviewed"]} active) and every listed numerical option.')
