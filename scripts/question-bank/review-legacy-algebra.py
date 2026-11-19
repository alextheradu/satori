"""Independent exact-arithmetic review of the 48 original Algebra questions.

Models are transcribed from the givens, not from the stored keys or explanations.
The source hash binds each result to the reviewed prompt, choices, and explanation.
English interpretations still require the explicit editorial decisions recorded below.
"""
import ast
import hashlib
import json
import re
from pathlib import Path
import sympy as s

ROOT = Path(__file__).resolve().parents[2]
QUESTIONS = json.loads((ROOT / 'src/data/questions/m-alg-2.json').read_text())
BY_ID = {q['id']: q for q in QUESTIONS}
SYMBOLS = {name: s.Symbol(name, real=True) for name in 'xyabpmkcrst'}
x, y, a, b, p, m, k, c, r, t = (SYMBOLS[name] for name in 'xyabpmkcrt')
reviews = []


def braces(text, start):
    assert text[start] == '{'
    depth = 1
    for i in range(start + 1, len(text)):
        depth += (text[i] == '{') - (text[i] == '}')
        if depth == 0:
            return text[start + 1:i], i + 1
    raise ValueError('Unclosed LaTeX group')


def ascii_math(text):
    text = text.replace('$', '').replace('−', '-').replace('\\left', '').replace('\\right', '')
    while '\\frac' in text:
        start = text.index('\\frac')
        numerator, end = braces(text, start + len('\\frac'))
        denominator, end = braces(text, end)
        text = text[:start] + '((' + ascii_math(numerator) + ')/(' + ascii_math(denominator) + '))' + text[end:]
    for old, new in [('\\ne', '!='), ('\\le', '<='), ('\\ge', '>=')]:
        text = text.replace(old, new)
    text = re.sub(r'\s+', '', text).replace('^', '**')
    text = re.sub(r'(?<=[0-9)])(?=[A-Za-z(])', '*', text)
    text = re.sub(r'(?<=[A-Za-z])(?=[A-Za-z(])', '*', text)
    return text


def expression(text):
    """Small whitelisted AST evaluator; no eval or executable expression parser."""
    node = ast.parse(ascii_math(text), mode='eval').body

    def visit(n):
        if isinstance(n, ast.Constant) and type(n.value) in (int, float):
            return s.Rational(str(n.value))
        if isinstance(n, ast.Name) and n.id in SYMBOLS:
            return SYMBOLS[n.id]
        if isinstance(n, ast.Tuple):
            return s.Tuple(*(visit(e) for e in n.elts))
        if isinstance(n, ast.UnaryOp) and isinstance(n.op, (ast.USub, ast.UAdd)):
            return -visit(n.operand) if isinstance(n.op, ast.USub) else visit(n.operand)
        if isinstance(n, ast.BinOp):
            left, right = visit(n.left), visit(n.right)
            if isinstance(n.op, ast.Add): return left + right
            if isinstance(n.op, ast.Sub): return left - right
            if isinstance(n.op, ast.Mult): return left * right
            if isinstance(n.op, ast.Div): return left / right
            if isinstance(n.op, ast.Pow): return left ** right
        raise ValueError(f'Unsupported mathematical syntax: {ast.dump(n)}')

    return visit(node)


def relation(text):
    parts = re.split(r'(<=|>=|!=|=|<|>)', ascii_math(text))
    assert len(parts) == 3, text
    left, op, right = parts
    return {'=': s.Eq, '!=': s.Ne, '<': s.Lt, '>': s.Gt, '<=': s.Le, '>=': s.Ge}[op](expression(left), expression(right))


def digest(q):
    return hashlib.sha256(json.dumps(q, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def finish(number, model, expected, validity=None, notes=None):
    q = BY_ID[f'm-alg-{number}']
    if validity is not None:
        flags = [bool(v) for v in validity]
        assert len(flags) == 4 and sum(flags) == 1, (q['id'], flags)
        assert flags[q['answer']], (q['id'], 'incorrect stored key', flags)
    else:
        flags = None
        for answer in q['answer']:
            assert s.simplify(expression(answer) - expected) == 0, (q['id'], answer, expected)
    reviews.append({'id': q['id'], 'sourceSha256': digest(q), 'model': model, 'derivedResult': str(expected), 'validChoices': flags, 'editorialNotes': notes or []})


def numeric(number, expected, model, notes=None):
    q = BY_ID[f'm-alg-{number}']
    flags = [s.simplify(expression(choice) - expected) == 0 for choice in q['choices']] if 'choices' in q else None
    finish(number, model, expected, flags, notes)


def equation_choice(number, expected, model):
    q = BY_ID[f'm-alg-{number}']
    target = s.Poly(expected).monic().as_expr()
    flags = []
    for choice in q['choices']:
        eq = relation(choice)
        flags.append(s.Poly(eq.lhs - eq.rhs).monic().as_expr() == target)
    finish(number, model, expected, flags)


def formula_choice(number, expected, model):
    q = BY_ID[f'm-alg-{number}']
    flags = [s.simplify(expression(choice.split('=')[1]) - expected) == 0 for choice in q['choices']]
    finish(number, model, expected, flags)


def points(number, predicate, model):
    q = BY_ID[f'm-alg-{number}']
    flags = [predicate(*expression(choice)) for choice in q['choices']]
    finish(number, model, 'exactly one listed point satisfies the conditions', flags)


def inequality_set(rel, variable):
    return s.solve_univariate_inequality(rel, variable, relational=False)


numeric(101, s.solve(x / 3 + 5 - 11, x)[0], 'Solve x/3 + 5 = 11.')
numeric(102, (s.Integer(245) - 65) / 40, 'Remove the 65-dollar fee, then divide the labor cost by 40 dollars/hour.')
numeric(103, s.solve(5 - 2 * (x + 4) + 13, x)[0], 'Solve 5 - 2(x+4) = -13.')
numeric(104, s.simplify((4*x-6)/2).subs(x, s.solve(4*x-6-18, x)[0]), 'Solve the given equation and evaluate 2x-3.')
count = s.solveset(6*(x-2)+4-2*(3*x-4), x, domain=s.S.Reals)
counts={'Zero':0,'Exactly one':1,'Exactly two':2,'Infinitely many':s.oo}
derived_count=len(count) if count.is_FiniteSet else s.oo
finish(105, 'The simplified difference of the two sides is zero for all real x.', count, [counts[z]==derived_count for z in BY_ID['m-alg-105']['choices']])
numeric(106, s.solve((x+2)/5-(x-4)/3, x)[0], 'Solve the rational-coefficient linear equation exactly.')
numeric(107, s.solve(120-8*x-(36+6*x), x)[0], 'Set decreasing savings 120-8w equal to increasing savings 36+6w.')
domains = {a: s.FiniteSet(12), b: s.Complement(s.S.Reals, s.FiniteSet(-3))}
flags = []
for choice in BY_ID['m-alg-108']['choices']:
    conditions = [relation(part) for part in re.findall(r'\$([^$]+)\$', choice)]
    candidate = {}
    for variable in (a, b):
        relevant = [inequality_set(cond, variable) for cond in conditions if cond.has(variable)]
        candidate[variable] = s.Intersection(*relevant) if relevant else s.S.Reals
    flags.append(all(domains[v].is_subset(candidate[v]) for v in domains))
finish(108, 'No solution requires coefficient a-12=0 and constant 12+4b nonzero.', 'a=12 and b!=-3', flags)
numeric(109, s.solve(s.Rational(2,3)*(6*x-9)-s.Rational(1,2)*(4*x+10)-(3*x-1), x)[0], 'Clear/distribute both rational coefficients, then solve.')
numeric(110, s.solve(5*(p+p)-(3*p+2*p+18), p)[0], 'Substitute x=p before solving for p.', ['Corrected a distractor explanation that described adding 5p to both sides, a valid operation; the incorrect operation is moving the right-hand 5p to the left without changing its sign.'])
equation_choice(111, 3*m+4*SYMBOLS['s']-180, 'Revenue = 3 times muffin count + 4 times scone count.')
points(112, lambda xx, yy: 2*xx+5*yy == 30, 'Substitute each ordered pair into 2x+5y=30.')
numeric(113, s.solve(18*12+24*y-432, y)[0], 'Substitute 12 into the 18-seat row count.')
intercept = s.solve(4*x+3*0-60, x)[0]
interpretations={'Ana buys 20 bags of beans and no bags of rice.':s.Tuple(0,20),'Ana buys 15 bags of rice and no bags of beans.':s.Tuple(15,0),'Each bag of rice costs 15 dollars.':None,'Ana buys 15 bags of rice and 15 bags of beans.':s.Tuple(15,15)}
assert set(interpretations)==set(BY_ID['m-alg-114']['choices'])
finish(114, 'Set beans y=0 in 4x+3y=60. Obtain (15,0); (15,15) costs 105.', s.Tuple(intercept, 0), [interpretations[z]==s.Tuple(intercept,0) for z in BY_ID['m-alg-114']['choices']], ['Replaced the former combined-total distractor: with the budget equation it implied the same intercept and was potentially ambiguous.'])
numeric(115, s.solve(5*a-3*(2*a)-8, a)[0], 'Substitute the point (a,2a) into 5x-3y=8.')
numeric(116, -1-s.Rational(6,2)*2, 'The given line has slope 6/2; a parallel line through (2,-1) has intercept -1-(6/2)(2).')
expected = s.interpolate([(1,11),(3,5),(7,-7)], x)
equation_choice(117, y-expected, 'Interpolate the listed linear table and compare all equations up to nonzero scaling.')
numeric(118, 5+s.Rational(3,4)*(6-(-2)), 'Use change in y = slope times change in x.')
numeric(119, s.solve(-(k-2)/3-s.Rational(4,3), k)[0], 'Set the rearranged line slope -(k-2)/3 equal to 4/3.')
numeric(120, 0-s.Rational(9-0,5-(-1))*(-1), 'Slope through (-1,0),(5,9) is 9/6; evaluate at x=0.')
numeric(121, s.Rational(2,3)*9-4, 'Evaluate f(9) from the given formula.')
interpretations={'The fixed monthly cost, in dollars, before any minutes are used':True,'The cost, in dollars, of each minute of calls':False,'The number of minutes of calls included in the plan':False,'The increase in monthly cost, in dollars, for every $25$ minutes of calls':False}
assert set(interpretations)==set(BY_ID['m-alg-122']['choices'])
finish(122, 'C(0)=25; slope=1/20 dollar/minute; extra 25 minutes costs 5/4 dollars.', s.Integer(25), [interpretations[z] for z in BY_ID['m-alg-122']['choices']], ['Editorial interpretation: 25 is the fixed dollar charge; it is neither the rate nor a number of included minutes.'])
numeric(123, 7+s.Rational(15-7,2)*5, 'Find the slope from (0,7),(2,15), then evaluate at 5.')
formula_choice(124, s.interpolate([(-1,-8),(2,1),(6,13)],x), 'Interpolate the three listed points.')
numeric(125, s.solve(30-s.Rational(12,10)*t-12,t)[0], 'Solve the height equation for time.')
bb=s.solve(-4*3+b-5,b)[0]
numeric(126, -4*(-2)+bb, 'Find b from f(3)=5, then evaluate f(-2).')
slope=s.Rational(-7-11,10-4)
numeric(127, s.solve(11+slope*(x-4),x)[0], 'Construct the line from the two given function values and solve f(x)=0.')
numeric(128, 5+s.Rational(12,3)*(10-1), 'The 3-unit input change gives slope 12/3; advance from x=1 to x=10.')
formula_choice(129, s.expand(3*(2*x+1)-2-4), 'Compose f(2x+1) and subtract 4.')
numeric(130, s.Rational(15,100)*60, 'Convert the per-minute increase to a per-hour increase.')
solution=s.solve([y-(3*x-1),y-(x+7)],(x,y))
numeric(131, solution[y], 'Solve both given line equations and return y.')
solution=s.solve([x+2*y-13,3*x-2*y-7],(x,y))
numeric(132, solution[x]+solution[y], 'Solve the two equations and add the coordinates.')
target=s.solve([t+b-140,4*t+9*b-860],(t,b))
flags=[]
for choice in BY_ID['m-alg-133']['choices']:
    equations=[relation(part) for part in re.findall(r'\$([^$]+)\$',choice)]
    flags.append(s.solve(equations,(t,b)) == target)
finish(133, 'Item count t+b=140; dollar revenue 4t+9b=860; the exact solution is t=80,b=60.', target, flags, ['Corrected the explanation’s mislabeled first/second/third distractors.'])
numeric(134, s.Rational(12,4)*(3-5), 'To change the constant 4 to 12, multiply both coefficients by 12/4.')
solution=s.solve([x+y-64,7*x+5*y-386],(x,y))
numeric(135, solution[x]-solution[y], 'Solve the basket-count and revenue equations; return peaches minus plums.')
solution=s.solve([y-(2*x-5),3*x+4*y-13],(x,y))
numeric(136, solution[x]+solution[y], 'Solve the given system, then add its solution coordinates.')
solution=s.solve([x/2+y/3-4,x/4-y/6-s.Rational(1,2)],(x,y))
numeric(137, solution[x]+solution[y], 'Solve both rational-coefficient equations using exact arithmetic.')
flags=[]
for choice in BY_ID['m-alg-138']['choices']:
    assigned={}
    for part in re.findall(r'\$([^$]+)\$',choice):
        eq=relation(part)
        assigned[eq.lhs]=eq.rhs
    flags.append(assigned[m] == s.Rational(2,3) and assigned[b] != -2)
finish(138, 'No solution requires a slope of 2/3 and an intercept different from -2.', 'parallel, distinct lines', flags)
messages=s.solve(40+s.Rational(1,10)*t-(25+s.Rational(16,100)*t),t)[0]
numeric(139, 40+s.Rational(1,10)*messages, 'Solve for equal-cost message count, then return the cost rather than that count.')
target=inequality_set(-4*x+9<1,x)
finish(140, 'Solve the original inequality, reversing its direction upon division by -4.',target,[inequality_set(relation(z),x)==target for z in BY_ID['m-alg-140']['choices']])
target=inequality_set(12+s.Rational(5,2)*r<=50,r)
finish(141, 'Budget means admission plus ride spending is at most 50.',target,[inequality_set(relation(z),r)==target for z in BY_ID['m-alg-141']['choices']])
numeric(142, s.ceiling(inequality_set(5*x+3<40,x).sup)-1, 'Use the exact strict upper boundary 37/5 and find the largest integer below it.')
points(143, lambda xx,yy: 14*xx+11*yy<=500 and xx+yy>=40, 'Test both cost and minimum-count conditions for every listed pair.')
interval=s.Intersection(inequality_set(s.Rational(-2)<=(3*x-1)/4,x),inequality_set((3*x-1)/4<5,x))
numeric(144, s.ceiling(interval.sup)-s.ceiling(interval.inf), 'Count integers from ceil(-7/3) through the last integer strictly below 7.')
numeric(145, s.ceiling(s.Rational(1200+180,45)), 'Solve the net-earnings constraint and round the hour requirement upward.')
flags=[7<=2*expression(z)+3 and 0<=-expression(z)+3 for z in BY_ID['m-alg-146']['choices']]
finish(146, 'Both points satisfy the inequality exactly when 2<=m<=3.','[2,3]',flags)
numeric(147, s.floor((64-s.Rational(215,10)-9*s.Rational(6,10)-5)/s.Rational(18,10)), 'Remove existing storage, nine albums, and the required reserve before rounding video count down.')
finish(148, 'The strict strip exists only when c<-3, so no solution means c>=-3.','c>=-3',[expression(z)>=-3 for z in BY_ID['m-alg-148']['choices']])

assert len(reviews)==len(QUESTIONS)==48
assert {row['id'] for row in reviews}==set(BY_ID)
report={'scope':'48 original Algebra questions in m-alg-2.json only; other bank items are not certified by this review.', 'method':'Fresh exact-arithmetic models transcribed from each prompt, symbolic comparison of mathematical options, and explicit editorial interpretation checks for prose choices. Models do not parse all natural-language givens automatically.', 'engine':f'SymPy {s.__version__}', 'solverSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'requirementsSha256':hashlib.sha256((ROOT/'scripts/question-bank/requirements-review.txt').read_bytes()).hexdigest(), 'questionsReviewed':len(reviews), 'items':reviews}
(ROOT/'docs/legacy-algebra-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Independently checked {len(reviews)} original Algebra questions with exact arithmetic and recorded source hashes.')
