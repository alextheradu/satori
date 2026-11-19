"""Independent review of the first 64 legacy math questions in two files.

Fresh models use manually transcribed givens, not stored keys. English choices
are explicitly interpreted into statements or categories before comparison.
Geometry and study-design interpretations remain editorial judgments.
"""
import hashlib
import json
import re
from pathlib import Path
import sympy as s
from review_math_common import expression,solution_choice

ROOT=Path(__file__).resolve().parents[2]
FILES=['math-alg-adv','math-psda-geo']
SOURCES={name:json.loads((ROOT/f'src/data/questions/{name}.json').read_text()) for name in FILES}
SOURCES['math-psda-geo']+=json.loads((ROOT/'src/data/retired/math-psda-geo.json').read_text())
QUESTIONS=[q for rows in SOURCES.values() for q in rows]
BY_ID={q['id']:q for q in QUESTIONS}
symbols={name:s.Symbol(name,real=True) for name in 'xyabskmpqnt'}
x,y,a,b,ss,k,m,p,q,n,t=(symbols[name] for name in 'xyabskmpqnt')
reviews=[]


def expr(text):
    text=text.replace('^\\circ','').replace('\\%','').replace('%','').replace('{,}','')
    if re.fullmatch(r'\$?-?\d{1,3}(?:,\d{3})+(?:\.\d+)?\$?',text):text=text.replace(',','')
    return expression(text,symbols)


def finish(id,model,result,flags=None,notes=None):
    item=BY_ID[id]
    if flags is not None:
        flags=[bool(value) for value in flags]
        assert len(flags)==4 and sum(flags)==1,(id,flags)
        assert flags[item['answer']],(id,'incorrect stored key',flags)
    else:
        for answer in item['answer']:assert s.simplify(expr(answer)-result)==0,(id,answer,result)
    digest=hashlib.sha256(json.dumps(item,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    reviews.append({'id':id,'sourceSha256':digest,'model':model,'derivedResult':str(result),'validChoices':flags,'editorialNotes':notes or []})


def numeric(id,result,model,notes=None):
    item=BY_ID[id]
    flags=[s.simplify(expr(z)-result)==0 for z in item['choices']] if 'choices' in item else None
    finish(id,model,result,flags,notes)


def equivalent(id,result,model):
    finish(id,model,result,[s.simplify(expr(z)-result)==0 for z in BY_ID[id]['choices']])


def equation_choice(id,polynomial,model):
    target=s.Poly(polynomial).monic().as_expr()
    flags=[]
    for choice in BY_ID[id]['choices']:
        left,right=choice.split('=')
        candidate=s.Poly(expr(left)-expr(right)).monic().as_expr()
        flags.append(candidate==target)
    finish(id,model,target,flags)


def point_choice(id,result,model):
    finish(id,model,result,[tuple(expr(z))==tuple(result) for z in BY_ID[id]['choices']])


def interpreted(id,result,model,interpretations,predicate,notes=None):
    assert set(interpretations)==set(BY_ID[id]['choices']),id
    finish(id,model,result,[predicate(interpretations[z]) for z in BY_ID[id]['choices']],notes)


def mean(values):return sum(values)/s.Integer(len(values))
def median(values):
    ordered=sorted(values);count=len(ordered)
    return ordered[count//2] if count%2 else s.Rational(ordered[count//2-1]+ordered[count//2],2)


numeric('m-alg-001',s.solve(4*(x-3)-(2*x+10),x)[0],'Distribute and solve the original linear equation.')
numeric('m-alg-002',s.solve((2*x-1)/3-(x+4)/6-2,x)[0],'Solve the rational-coefficient linear equation exactly.')
coefficients=s.Poly(a*(3*x-2)+5-(12*x+b),x).all_coeffs()
numeric('m-alg-003',s.solve(coefficients,(a,b))[b],'Infinitely many solutions require every coefficient of the identity difference to vanish.')
equation_choice('m-alg-004',12*a+8*ss-960,'Translate the two ticket prices into total revenue; compare full equations up to nonzero scale.')
point_choice('m-alg-005',(0,s.solve(5*0-2*y-20,y)[0]),'At a y-intercept x=0; solve for y and return the full point.')
line=s.interpolate([(-2,7),(4,-2)],x)
numeric('m-alg-006',s.solve(line-13,x)[0],'Construct the line through both given points and solve for the input with output 13.')
numeric('m-alg-007',(7-3*x).subs(x,-4),'Evaluate the linear function at a negative input.')
table={2:11,5:20,9:32}
finish('m-alg-008','Test all four candidate linear functions at all three table inputs.',s.interpolate(list(table.items()),x),[all(expr(z.split('=')[1]).subs(x,u)==v for u,v in table.items()) for z in BY_ID['m-alg-008']['choices']])
volume=s.interpolate([(12,588),(30,210)],t)
numeric('m-alg-009',s.solve(volume,t)[0],'Interpolate the constant-rate volume model and solve for its first zero.')
solution=s.solve([x+y-14,x-y-4],(x,y))
numeric('m-alg-010',solution[x],'Solve the two linear equations, then return x.')
solution=s.solve([n+p-18,3*n+s.Rational(15,10)*p-39],(n,p))
numeric('m-alg-011',solution[n],'Use item count and total cost to solve for notebook count.')
flags=[]
for z in BY_ID['m-alg-012']['choices']:
    matrix=s.Matrix([[3,-expr(z)],[6,10]])
    flags.append(matrix.rank()<matrix.row_join(s.Matrix([8,5])).rank())
finish('m-alg-012','For each listed parameter compare coefficient and augmented matrix ranks; inconsistency means unequal ranks.',s.solve(s.det(s.Matrix([[3,-k],[6,10]])),k),flags)
finish('m-alg-013','Directly test each value in the original strict inequality 5-2x>11.','x<-3',[5-2*expr(z)>11 for z in BY_ID['m-alg-013']['choices']])
target=s.Interval(0,s.Rational(2000-180,35))
flags=[]
for z in BY_ID['m-alg-014']['choices']:
    parts=re.split(r'(<=|>=)',z.replace('\\le','<=').replace('\\ge','>='))
    assert len(parts)==3,z
    left,op,right=parts
    relation=(expr(left)<=expr(right)) if op=='<=' else (expr(left)>=expr(right))
    candidate=s.Intersection(s.Interval(0,s.oo),s.solve_univariate_inequality(relation,b,relational=False))
    flags.append(candidate==target)
finish('m-alg-014','The driver consumes capacity: 180+35b<=2000, with nonnegative counts. Compare the represented feasible intervals.',target,flags)
finish('m-alg-015','Test both bounds of the compound inequality, preserving the strict upper bound.','-2<x<=1',[-3<=2-5*expr(z)<12 for z in BY_ID['m-alg-015']['choices']])
flags=[]
for z in BY_ID['m-alg-016']['choices']:
    xx,yy=expr(z);flags.append(yy>2*xx-3 and xx+yy<=6)
finish('m-alg-016','Substitute each point into both original inequalities.','exactly one listed point is feasible',flags)

equivalent('m-adv-001',(3*x*x-5*x+2)-(x*x+4*x-6),'Distribute the subtraction sign and combine like terms.')
equivalent('m-adv-002',6*x*x+7*x-20,'Expand all candidate products and compare coefficients.')
coefficients=s.Poly((2*x+3)*(k*x-5)-(8*x*x+2*x-15),x).all_coeffs()
numeric('m-adv-003',s.solve(coefficients,k)[k],'The polynomial identity requires all coefficients to agree.')
equivalent('m-adv-004',s.cancel(3/(x-2)-2/(x+1)),'Combine rational functions on the stated domain excluding 2 and -1.')
numeric('m-adv-005',(s.Integer(5)+s.Rational(1,3)-2)*3,'For positive x, combine inner exponents and multiply by the outer exponent.')
rootset=s.solveset(x*x-2*x-35,x,domain=s.Interval.open(0,s.oo))
assert len(rootset)==1
numeric('m-adv-006',next(iter(rootset)),'Solve the quadratic on the positive real domain.')
rootset=s.solveset(s.sqrt(x+7)-(x-5),x,domain=s.S.Reals)
assert len(rootset)==1
numeric('m-adv-007',next(iter(rootset)),'Solve the original radical equation and reject the extraneous root from squaring.')
flags=[]
for z in BY_ID['m-adv-008']['choices']:
    xx,yy=expr(z);flags.append(yy==xx**2-3 and yy==2*xx)
finish('m-adv-008','Test both equations of the nonlinear system at every listed point.',s.solve([y-x*x+3,y-2*x],(x,y)),flags)
polynomial=x*x+4*x+7-(2*x+k)
numeric('m-adv-009',s.solve(s.discriminant(polynomial,x),k)[0],'The line-parabola system has one real intersection exactly when the quadratic discriminant is zero.')
domain=s.Complement(s.S.Reals,s.FiniteSet(-3,3))
rootset=s.solveset(x/(x-3)+2/(x+3)-18/(x*x-9),x,domain=domain)
flags=[(s.EmptySet if z=='There is no solution.' else solution_choice(z,symbols))==rootset for z in BY_ID['m-adv-010']['choices']]
finish('m-adv-010','Solve the original rational equation on its domain, excluding both denominator zeros.',rootset,flags)
numeric('m-adv-011',(2*x*x-5).subs(x,-3),'Evaluate the square before applying its coefficient.')
interpretations={'It increases by $8\\%$ each hour.':('factor',s.Rational(108,100)),'It increases by $108\\%$ each hour.':('factor',s.Rational(208,100)),'It increases by $8$ bacteria each hour.':('constant_increment',8),'It decreases by $8\\%$ each hour.':('factor',s.Rational(92,100))}
interpreted('m-adv-012',s.Rational(108,100),'The positive exponential base is the multiplicative hourly factor. The first-hour increment is 500*(1.08-1)=40, not 8.',interpretations,lambda z:z==('factor',s.Rational(108,100)))
f=-2*x*x+12*x-7
assert s.diff(f,x,2)<0
numeric('m-adv-013',f.subs(x,s.solve(s.diff(f,x),x)[0]),'The downward quadratic attains its maximum at its critical point.')
polynomial=x**3-4*x*x+a*x+12
numeric('m-adv-014',s.solve(polynomial.subs(x,2),a)[0],'The factor theorem requires p(2)=0.')
target=24000*s.Rational(85,100)**(m/12)
finish('m-adv-015','Convert months to m/12 years and preserve the 0.85 annual retention factor. Compare each complete candidate expression.',target,[s.simplify(expr(z.split('=')[1])-target)==0 for z in BY_ID['m-adv-015']['choices']],['Corrected the compounding explanation: (0.9875)^12 gives a decrease of about 14.01%, less than 15%, not more.'])
assert 14 < float(100*(1-s.Rational(9875,10000)**12)) < 15
aa=s.solve(a*(0+1)*(0-7)+14,a)[0]
f=aa*(x+1)*(x-7)
assert s.diff(f,x,2)>0
numeric('m-adv-016',f.subs(x,s.solve(s.diff(f,x),x)[0]),'Recover the quadratic scale from f(0), then evaluate the upward parabola at its vertex.')

numeric('m-psda-001',225/s.Rational(150,6),'Convert the travel rate to miles/gallon before finding gallons.')
numeric('m-psda-002',s.Rational(2700,18)/60,'Convert required printing minutes to hours.')
concentrate=s.Rational(2,9)*45;water=s.Rational(7,9)*45
numeric('m-psda-003',water/2-concentrate,'Adding only concentrate leaves water fixed. Solve the target 1:2 concentrate-to-water ratio for the added amount.')
numeric('m-psda-004',80*(1-s.Rational(15,100)),'Apply the discount to the original price.')
numeric('m-psda-005',450/(s.Rational(120,100)*s.Rational(75,100)),'Reverse both population growth factors multiplicatively.')
numeric('m-psda-006',100*s.Rational(140,100)*s.Rational(70,100),'Compose the two proportions with q as the positive reference quantity.')
numeric('m-psda-007',median([4,7,7,9,12,15]),'Average the third and fourth values of the ordered even-sized data set.')
numeric('m-psda-008',s.Integer(10)*22-9*20,'Recover the added observation as the difference of the two sums.')
frequencies={0:7,1:9,2:5,3:3,4:1}
old=[value for value,count in frequencies.items() for _ in range(count)];new=old+[10]
assert len(old)==25 and sum(old)==32
changes=(s.sign(mean(new)-mean(old)),s.sign(median(new)-median(old)))
interpretations={'The mean increases, and the median stays the same.':(1,0),'The mean and the median both increase.':(1,1),'The mean stays the same, and the median increases.':(0,1),'The mean and the median both stay the same.':(0,0)}
interpreted('m-psda-009',changes,'Expand the frequency table and compute both centers before and after the additional student.',interpretations,lambda z:z==changes)
interpretations={"The estimated increase in a puppy's weight, in kilograms, for each additional week of age":('kg_per_week',s.Rational(75,100)),"The estimated weight, in kilograms, of a puppy at birth":('birth_kg',s.Rational(75,100)),"The estimated number of weeks it takes for a puppy's weight to increase by 1 kilogram":('weeks_per_kg',s.Rational(75,100)),"The estimated weight, in kilograms, of a puppy that is 1 week old":('one_week_kg',s.Rational(75,100))}
interpreted('m-psda-010',('kg_per_week',s.Rational(75,100)),'Slope has output units per input unit over the stated age range 8-20 weeks; birth and one-week extrapolations are outside the supported range.',interpretations,lambda z:z==('kg_per_week',s.Rational(75,100)),['Clarified the model domain: an algebraic intercept is not an established birth weight when the model applies only from 8 to 20 weeks.'])
line=s.interpolate([(2,15),(10,39)],x)
numeric('m-psda-011',30-line.subs(x,6),'Construct the stated best-fit line and return actual minus predicted.')
instruments=[[18,42],[27,33]]
assert list(map(sum,instruments))==[60,60]
assert [sum(row[i] for row in instruments) for i in range(2)]==[45,75]
numeric('m-psda-012',s.Rational(27,45),'Check table totals and condition on playing an instrument.')
drinks=[[36,54],[64,46]]
assert list(map(sum,drinks))==[90,110]
assert [sum(row[i] for row in drinks) for i in range(2)]==[100,100]
numeric('m-psda-013',s.Rational(54,100)/s.Rational(54,90),'Keep the two different conditioning denominators before taking p/q.')
interpretations={
 'Exactly 62% of all adults in the town support building the park.':('exact_population','town',62,62),
 'The proportion of the 400 adults in the sample who support the park is unknown and could be any value from 58% to 66%.':('unknown_sample','sample',58,66),
 'It is plausible that between 58% and 66% of all adults in the state support building the park.':('population_interval','state',58,66),
 'It is plausible that between 58% and 66% of all adults in the town support building the park.':('population_interval','town',58,66),
}
result=('population_interval','town',62-4,62+4)
interpreted('m-psda-014',result,'The sample proportion is known: 248/400=62%. The reported margin concerns the town population proportion, not a different population or unknown sample fraction.',interpretations,lambda z:z==result,['Replaced a logically true distractor: 62% is itself between 58% and 66%. The replacement incorrectly treats the known sample proportion as unknown.'])
numeric('m-psda-015',s.Rational(45,250)*6000,'Scale the sample dog-household fraction to the town count.')
interpretations={
 'Drinking chamomile tea each night is likely to improve sleep quality for adults in City X who have trouble sleeping.':('causal','city_sleep_difficulty'),
 'Drinking chamomile tea each night is likely to improve sleep quality for all adults.':('causal','all_adults'),
 'Drinking chamomile tea each night is associated with improved sleep quality, but no cause-and-effect conclusion can be drawn.':('association_only','city_sleep_difficulty'),
 'Drinking chamomile tea each night is likely to improve sleep quality for all adults in City X.':('causal','all_city_adults'),
}
interpreted('m-psda-016',('causal','city_sleep_difficulty'),'Random assignment supports the treatment comparison; random selection supports inference to the stated City X sampling frame of adults reporting sleep difficulty.',interpretations,lambda z:z==('causal','city_sleep_difficulty'))

numeric('m-geo-001',15*(s.Rational(46,2)-15),'Recover rectangle width from half-perimeter, then multiply by length.')
numeric('m-geo-002',72*s.pi/(s.pi*3**2),'Divide cylinder volume by its circular base area.')
numeric('m-geo-003',s.Integer(2)*3,'Cancel the common base area in cone volume = 2 times cylinder volume; retain the one-third factor.')
numeric('m-geo-004',10*s.sqrt(s.Integer(2*13)**2-10**2),'An inscribed rectangle diagonal is the diameter. Recover its other side with Pythagoras.')
numeric('m-geo-005',s.Integer(180)-48-2*48,'Use the stated angle ratio and triangle sum.')
numeric('m-geo-006',s.solve(3*x+10+5*x-6-180,x)[0],'Same-side interior angles between parallel lines are supplementary.')
numeric('m-geo-007',12*(s.Rational(4+6,4)**2-1),'Expand the small triangle area by the square of the side scale, then subtract its area.')
candidates=[(4,4,9),(4,9,9)]
perimeters=[sum(values) for values in candidates if sum(values)>2*max(values)]
assert len(perimeters)==1
numeric('m-geo-008',perimeters[0],'An isosceles triangle with sides 4 and 9 must repeat one of those lengths; apply the strict triangle inequality.')
numeric('m-geo-009',s.Rational(5,12),'For angle B, the opposite leg is AC and adjacent leg is BC.')
numeric('m-geo-010',s.solve(4*k+2+3*k+11-90,k)[0],'The two acute angles of a right triangle are complementary.')
scale=51/s.sqrt(s.Integer(8)**2+15**2)
numeric('m-geo-011',(8+15)*scale+51,'The tangent ratio gives proportional legs 8t and 15t; use the known hypotenuse to find scale and perimeter.')
numeric('m-geo-012',2*10*s.sin(s.pi/3),'Bisect the isosceles vertex angle and base. Twice the opposite leg in each 60-degree right triangle is BC.')
interpretations={'Center $(-3, 5)$, radius 7':(-3,5,7),'Center $(-3, 5)$, radius 49':(-3,5,49),'Center $(3, -5)$, radius 49':(3,-5,49),'Center $(3, -5)$, radius 7':(3,-5,7)}
center_and_radius=(3,-5,s.sqrt(49))
interpreted('m-geo-013',center_and_radius,'Read signed center coordinates and take the positive square root of the right side.',interpretations,lambda z:z==center_and_radius)
numeric('m-geo-014',s.sqrt(s.Integer(11)+4**2+3**2),'Completing both squares adds 16+9 to the right side.')
numeric('m-geo-015',9*s.Rational(2,3)*s.pi,'For radians, arc length equals radius times angle.')
numeric('m-geo-016',2*24/s.Integer(8**2),'The sector area is r^2*theta/2; return the coefficient of pi in theta.')

assert len(reviews)==len(QUESTIONS)==64
assert {row['id'] for row in reviews}==set(BY_ID)
hashfile=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
for filename in FILES:
    ids={q['id'] for q in SOURCES[filename]}
    items=[row for row in reviews if row['id'] in ids]
    assert len(items)==32
    report={'scope':f'32 original math questions from {filename}.json across active and historical records.','method':'Fresh manually transcribed givens, exact arithmetic and symbolic comparisons of every mathematical option and typed answer. English interpretations, geometry and study-design implications are specified editorially; the program does not automatically understand all natural-language givens.','engine':f'SymPy {s.__version__}','solverSha256':hashfile(Path(__file__)),'helperSha256':hashfile(Path(__file__).with_name('review_math_common.py')),'requirementsSha256':hashfile(ROOT/'scripts/question-bank/requirements-review.txt'),'questionsReviewed':len(items),'items':items}
    (ROOT/f'docs/legacy-initial-{filename}-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Independently checked all 64 initial legacy math questions and wrote two source-bound review manifests.')
