"""Independent exact models of the individually authored math additions.

Givens are transcribed from the prompts; stored keys do not supply the results.
The range and must-true questions explicitly model their quantifiers.
"""
import hashlib
import json
from pathlib import Path
import sympy as s
from review_math_common import expression

ROOT=Path(__file__).resolve().parents[2]
questions=json.loads((ROOT/'src/data/questions/original-math-distinct.json').read_text())
archived=json.loads((ROOT/'src/data/retired/original-math-distinct.json').read_text())
questions+=archived
by_id={q['id']:q for q in questions}
x,y,a,b,c=s.symbols('x y a b c',real=True)
symbols=dict(zip('xyabc',(x,y,a,b,c)))
reviews=[]


def finish(number,model,result,predicate=None,interpretations=None):
    q=by_id[f'm-original-distinct-{number:03}']
    if 'choices' in q:
        if predicate is None:predicate=lambda value:s.simplify(value-result)==0
        if interpretations is not None:assert set(interpretations)==set(q['choices']),q['id']
        flags=[bool(predicate(interpretations[z] if interpretations is not None else expression(z,symbols))) for z in q['choices']]
        assert sum(flags)==1 and flags[q['answer']],(q['id'],flags)
    else:
        flags=None
        for value in q['answer']:assert s.simplify(expression(value,symbols)-result)==0,q['id']
    digest=hashlib.sha256(json.dumps(q,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    reviews.append({'id':q['id'],'sourceSha256':digest,'model':model,'derivedResult':str(result),'validChoices':flags,'editorialNotes':[]})


coeff=s.solve([2*a+b-11,-3*a+b+4],(a,b))
finish(1,'A remainder of degree below 2 is ax+b. At both divisor roots its value equals the given polynomial value.',coeff[b])
roots=s.solveset((x*x-6*x+5)**2-16,x,domain=s.S.Reals)
assert roots==s.FiniteSet(3,3-2*s.sqrt(2),3+2*s.sqrt(2))
finish(2,'Solve the original quartic exactly and count distinct real roots, not multiplicities.',len(roots))
original=(x*x+x-6)/(x+3)
domain=s.Complement(s.S.Reals,s.FiniteSet(-3))
missing=s.FiniteSet(-5)
assert s.cancel(original)==x-2
finish(3,'The simplified line is x-2 with input -3 excluded. For each candidate output, solve on the original domain.',missing,lambda value:s.solveset(original-value,x,domain=domain)==s.EmptySet)
f=a*x*x+b*x+c
coeff=s.solve([f.subs(x,2)-f.subs(x,1)-5,f.subs(x,5)-f.subs(x,4)-17,f.subs(x,0)-3],(a,b,c))
finish(4,'Solve the two difference constraints and the zero-input value for all quadratic coefficients, then evaluate at 3.',f.subs(coeff).subs(x,3))
domain=s.Intersection(s.solve_univariate_inequality(3*x-5>=0,x,relational=False),s.solve_univariate_inequality(17-2*x>=0,x,relational=False))
count=s.floor(domain.sup)-s.ceiling(domain.inf)+1
finish(5,'Both principal square roots are real exactly on the intersection of their nonnegative-radicand domains; count its integers.',count)
finish(6,'A point is forced by f(7)=9 when its transformed input is 7 and its output is 9-4. Other distinct f inputs are unconstrained.',s.Tuple(-2,5),lambda point:3-2*point[0]==7 and point[1]==9-4)
points=s.solve([x*x+y*y-100,(x-12)**2+y*y-100],(x,y))
assert len(points)==2
distance=s.sqrt(sum((points[0][i]-points[1][i])**2 for i in range(2)))
finish(7,'Solve both circle equations simultaneously and compute the Euclidean distance between the two intersection points.',distance)
finish(8,'The external boundary consists of two length-12 sides and two diameter-6 semicircular arcs. The attachment diameters are internal.',2*12+2*s.Rational(1,2)*2*s.pi*3)
ratio=s.Rational(3,3+1)
finish(9,'Parallel sides give similarity scale AD/AB=3/4. Subtract the small triangle area, which scales quadratically, from the whole triangle.',s.Integer(96)*(1-ratio**2))
arc=s.Rational(90,360)*2*s.pi*20
radius=s.solve(2*s.pi*x-arc,x)[0]
finish(10,'The sector arc becomes the cone base circumference and its radius becomes slant height. Use height^2=slant^2-radius^2.',s.Integer(20)**2-radius**2)
roots=s.solveset(3*12-x*(x+5),x,domain=s.Interval.open(0,s.oo))
assert len(roots)==1
finish(11,'Apply the given intersecting-chords product and require positive segment length.',next(iter(roots)))
# Hypotenuse H, opposite leg L=(3/5)H, adjacent leg positive.
H=s.Symbol('H',positive=True)
opposite=s.Rational(3,5)*H
adjacent=s.sqrt(H**2-opposite**2)
hypotenuse=s.solve(H+opposite+adjacent-48,H)[0]
finish(12,'Combine the sine ratio, positive Pythagorean leg and total perimeter, then compute half the leg product.',s.simplify(opposite*adjacent/2).subs(H,hypotenuse))

intersection=s.solve([y-(2*x-4),y-(-x+8)],(x,y))
intercepts=[s.solve(2*x-4,x)[0],s.solve(-x+8,x)[0]]
finish(13,'The x-axis intercepts form the base; solve the line system for the third vertex and perpendicular height.',abs(intercepts[1]-intercepts[0])*abs(intersection[y])/2)
kk=s.Symbol('k',positive=True)
feasible=s.Intersection(s.solve_univariate_inequality(-2*kk+4>=-8,kk,relational=False),s.solve_univariate_inequality(3*kk+4<=19,kk,relational=False))
finish(14,'Positive slope makes endpoint values the minimum and maximum on the entire real input interval. Intersect both coefficient bounds and take the largest integer.',s.floor(feasible.sup))
coeff=s.solve([a*a-9,(a+1)*b-8],(a,b))
negative=[solution for solution in coeff if solution[0]<0]
assert len(negative)==1
finish(15,'Match both coefficients of f(f(x)); use the negative-slope condition to choose the admissible branch.',negative[0][1])
coeff=s.solve([a+3*b-9,2*a-b-4],(a,b))
finish(16,'A common point for every parameter value requires both the parameter coefficient and constant term to match.',coeff[a]+coeff[b])
groups=[(10,19,3),(20,29,5),(30,39,4)]
finish(17,'With fixed group counts, each value is at most its group upper endpoint. All endpoints can be attained simultaneously.',sum(high*count for low,high,count in groups)/s.Integer(sum(count for low,high,count in groups)))
type_comparisons=(s.Rational(9,10)>s.Rational(80,100),s.Rational(30,100)>s.Rational(2,10))
overall_comparison=s.Rational(9+30,10+100)>s.Rational(80+2,100+10)
interpretations={
 'Machine A has a higher success rate for each item type, but Machine B has a higher overall success rate.':(True,False),
 'Machine A has a higher success rate for each item type and overall.':(True,True),
 'Machine B has a higher success rate for each item type and overall.':(False,False),
 'The two machines have equal overall success rates.':'equal',
}
result=(all(type_comparisons),bool(overall_comparison))
finish(18,'Compare the two conditional rates and the count-weighted aggregate rates. The total counts are both 110 and total successes are 39 versus 82.',result,lambda value:value==result,interpretations)
def median(values):
    count=len(values);values=sorted(values)
    return values[count//2] if count%2 else s.Rational(values[count//2-1]+values[count//2],2)
minimum=next(count for count in range(1,20) if median([2]*4+[5]*count+[9]*7)==5)
assert all(median([2]*4+[5]*count+[9]*7)!=5 for count in range(1,minimum))
finish(19,'Construct each smaller positive-count candidate and the first data set with median exactly 5.',s.Integer(minimum))
finish(20,'The mean remains 20; the sum of squared deviations remains 8*36. Divide by the new total count before the square root.',s.sqrt(s.Rational(8*6**2,18)))
vertex=s.Point(2*1-(-2),2*4-1)
area=s.Polygon(s.Point(-2,1),s.Point(6,1),vertex).area
finish(21,'Recover C from the given midpoint and A, then compute the coordinate triangle area.',abs(area))

assert len(reviews)==len(questions)==21
assert {row['id'] for row in reviews}==set(by_id)
hashfile=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
report={'scope':'20 active individually authored math questions and one retired question preserved for historical attempts.','method':'Fresh exact models of all prompt constraints, symbolic solutions and comparison of every option. English choices and geometric descriptions are translated into mathematical statements editorially; the program does not infer diagrams or natural language automatically.','engine':f'SymPy {s.__version__}','solverSha256':hashfile(Path(__file__)),'helperSha256':hashfile(Path(__file__).with_name('review_math_common.py')),'requirementsSha256':hashfile(ROOT/'scripts/question-bank/requirements-review.txt'),'questionsReviewed':len(reviews),'activeQuestionsReviewed':len(questions)-len(archived),'archivedQuestionsReviewed':len(archived),'items':reviews}
(ROOT/'docs/distinct-math-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Independently checked {len(reviews)} authored math records, including {len(archived)} retired item; every option and typed answer passed.')
