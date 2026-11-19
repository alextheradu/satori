"""Independent exact models for all 48 legacy Geometry/Trigonometry items.

The geometry and relevant theorems are transcribed editorially from each stem.
Stored keys do not supply results. All mathematical options are parsed and
compared independently; the program does not infer a diagram from prose.
"""
import hashlib
import json
from pathlib import Path
import sympy as s
from review_math_common import expression

ROOT=Path(__file__).resolve().parents[2]
QUESTIONS=json.loads((ROOT/'src/data/questions/m-geo-2.json').read_text())
BY_ID={q['id']:q for q in QUESTIONS}
x,y=s.symbols('x y',real=True)
reviews=[]


def expr(text):
    return expression(text.replace('^\\circ',''),{'x':x,'y':y})


def finish(number,model,result,flags=None,notes=None):
    q=BY_ID[f'm-geo-{number}']
    if flags is not None:
        flags=[bool(value) for value in flags]
        assert len(flags)==4 and sum(flags)==1,(q['id'],flags)
        assert flags[q['answer']],(q['id'],'incorrect stored key',flags)
    else:
        for answer in q['answer']:assert s.simplify(expr(answer)-result)==0,(q['id'],answer,result)
    digest=hashlib.sha256(json.dumps(q,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    reviews.append({'id':q['id'],'sourceSha256':digest,'model':model,'derivedResult':str(result),'validChoices':flags,'editorialNotes':notes or []})


def numeric(number,result,model,notes=None):
    q=BY_ID[f'm-geo-{number}']
    flags=[s.simplify(expr(z)-result)==0 for z in q['choices']] if 'choices' in q else None
    finish(number,model,result,flags,notes)


def circle_choice(number,polynomial,model):
    target=s.Poly(polynomial,x,y).monic().as_expr()
    flags=[]
    for z in BY_ID[f'm-geo-{number}']['choices']:
        left,right=z.split('=')
        candidate=s.Poly(expr(left)-expr(right),x,y).monic().as_expr()
        flags.append(candidate==target)
    finish(number,model,target,flags)


numeric(101,s.Rational(280,8*5),'Divide rectangular-prism volume by the base area.')
numeric(102,s.Rational(2*63,14),'Solve triangle area = base times height / 2 for height.')
numeric(103,s.sqrt(s.Rational(150,6)),'A cube has six faces of area edge^2; take the positive edge length.')
numeric(104,s.Rational(4,3)*s.pi*3**3,'Use sphere volume 4*pi*r^3/3.')
change=100*(s.Rational(12,10)*s.Rational(8,10)-1)
interpretations={'The area decreases by 40%.':-40,'The area increases by 4%.':4,'The area does not change.':0,'The area decreases by 4%.':-4}
assert set(interpretations)==set(BY_ID['m-geo-105']['choices'])
finish(105,'Area scales by the product of the separate dimension factors; convert the net factor to percent change.',change,[interpretations[z]==change for z in BY_ID['m-geo-105']['choices']],['Replaced an incorrect verbal rationale comparing percentages of different lengths; the relevant operation is the product 1.2*0.8.'])
numeric(106,96*s.pi/(s.pi*6**2/3),'Invert cone volume with the one-third factor and squared radius.')
height=s.sqrt(5**2-s.Rational(15-9,2)**2)
numeric(107,s.Rational(9+15,2)*height,'In the isosceles trapezoid, half the base difference is the horizontal offset of each leg. Find height by Pythagoras, then use average base times height.')
numeric(108,40*s.Rational(15,10)**3,'Uniform edge scaling multiplies rectangular-prism volume by the cube of scale.')
numeric(109,s.Integer(3)**2*s.Rational(1,2),'Cylinder radius scaling contributes its square; height contributes its linear factor.')
side=18*s.sqrt(3)/3
height=s.sqrt(side**2-(side/2)**2)
numeric(110,s.simplify(side*height/2),'Divide the equilateral perimeter by three, derive the altitude with Pythagoras, and compute triangle area.')
numeric(111,s.Integer(6)**3/(s.pi*3**2),'Conserve the material volume from the cube to the cylinder.')
numeric(112,s.sqrt(s.Integer(24)*32*48),'The product of the three adjacent face areas is the square of the positive prism volume.')
numeric(113,s.Integer(180)-47,'Adjacent angles from intersecting lines form a supplementary linear pair.')
numeric(114,s.solve(5*x-16-(3*x+30),x)[0],'Equate alternate interior angles of parallel lines.')
numeric(115,s.Integer(125)-70,'Subtract the known remote interior angle from the exterior angle.')
numeric(116,s.Rational(15,6)*8,'Respect the stated vertex correspondence when scaling BC to EF.')
parameter=s.solve(2*x+2*(x+15)-180,x)[0]
numeric(117,2*parameter,'Use the triangle angle sum, then return the vertex angle 2x, not x.')
numeric(118,s.Rational(360,180-150),'A regular polygon has equal exterior angles summing to 360 degrees.')
parameter=s.solve(2*x+3-(5*x-9),x)[0]
numeric(119,5*parameter-9,'Equate corresponding congruent sides and evaluate XY, not the parameter.')
numeric(120,s.Rational(6,4)*26,'The same sun angle and vertical objects on level ground give similar right triangles.')
parameter=s.solve(6*(x+3)-9*x,x)[0]
numeric(121,9+parameter+3,'Use the parallel-side proportional segments AD/DB=AE/EC and return the whole AC.')
base_angle=s.Rational(180-40,2)
inner_B=180-2*base_angle
# Endpoint C is always an algebraic solution of BD=BC. Strictly interior D
# chooses the other intersection; for AB=AC=1 its coordinate is 2cos(40)-1.
coordinate=2*s.cos(40*s.pi/180)-1
assert bool(coordinate>0) and bool(coordinate<1)
numeric(122,base_angle-inner_B,'With D strictly inside AC, angle BCD is the original base angle. BD=BC gives two equal 70-degree angles in BDC; subtract its B angle from ABC.', ['Clarified that D is between A and C. Previously D=C satisfied the stated conditions and would give angle ABD=70 degrees instead of the intended 30.'])
numeric(123,s.sqrt(s.Integer(4)*(4+9)),'Right-triangle altitude similarity gives AC^2=AD*AB; AC is positive.')
numeric(124,s.Integer(180)-110-35,'The parallel lines and stated same-side condition give angle PRQ=SPR=35 degrees; use the triangle angle sum.')
numeric(125,s.Integer(90)-32,'On the acute-angle interval cosine is one-to-one; sin(32)=cos(90-32).')
numeric(126,s.sqrt(s.Integer(9)**2+12**2),'The positive hypotenuse follows the Pythagorean theorem.')
numeric(127,10*s.sqrt(2)/s.sqrt(2),'Equal legs in a 45-45-90 triangle are hypotenuse/sqrt(2).')
numeric(128,s.Rational(7,25),'YZ is opposite angle X; XY is the hypotenuse.')
numeric(129,s.Rational(5,6)*s.pi*180/s.pi,'Convert radians to degrees by multiplying by 180/pi.')
numeric(130,s.sqrt(s.Integer(20)**2-(s.Rational(6,10)*20)**2),'Cosine gives the adjacent leg AC; find the opposite leg BC with Pythagoras.')
numeric(131,s.Integer(14)/2*s.sqrt(3),'The longest side is the hypotenuse; the side opposite 60 degrees is sqrt(3)/2 times it.')
old_distance=s.sqrt(s.Integer(25)**2-24**2)
new_height=s.sqrt(s.Integer(25)**2-(old_distance+8)**2)
numeric(132,24-new_height,'Keep ladder length fixed, add 8 to its horizontal distance, and return the change in vertical height.')
height=s.sqrt(s.Integer(10)**2-6**2)
numeric(133,height/10,'The altitude of the isosceles triangle bisects its length-12 base; the base-angle sine is height/10.')
numeric(134,s.sqrt(s.Integer(10)**2+2*(2*24))+10,'The legs have product 48 and square sum 100; derive their positive sum, then add the hypotenuse.')
numeric(135,s.sin(4*s.pi/3),'The y-coordinate on the unit circle is sine of the counterclockwise angle.')
numeric(136,1/s.sqrt(1+s.Rational(24,10)**2),'S complements R, so sin(S)=cos(R)=1/sqrt(1+tan(R)^2) for acute R.')
circle_choice(137,(x+2)**2+(y-4)**2-25,'Use squared distances from center (-2,4) equal to radius squared.')
radius=18*s.pi/(2*s.pi)
numeric(138,s.pi*radius**2,'Recover radius from circumference, then compute area.')
numeric(139,s.Rational(72,360)*2*10,'Compute the arc fraction of circumference and return the coefficient of pi.')
numeric(140,s.Rational(110,2),'An inscribed angle is half the measure of its intercepted arc.')
center=(s.Rational(-10,2),s.Rational(4,2))
finish(141,'For x^2+y^2+Dx+Ey+F=0 the center is (-D/2,-E/2).',center,[tuple(expr(z))==center for z in BY_ID['m-geo-141']['choices']])
numeric(142,s.Rational(100,360)*s.pi*6**2,'Apply the central-angle fraction to the full circle area.')
numeric(143,s.sqrt((s.Integer(4)-1)**2+(s.Integer(1)+3)**2),'Radius is the positive distance from center (1,-3) to the given point.')
numeric(144,5*s.pi/12,'The radian angle is arc length divided by radius.')
numeric(145,s.Integer(3)**2+7**2-4**2,'Completing the square gives radius squared 3^2+7^2-c; solve for c.')
center=(s.Rational(-1+7,2),s.Rational(5-1,2))
radius_squared=s.Rational((7+1)**2+(-1-5)**2,4)
circle_choice(146,(x-center[0])**2+(y-center[1])**2-radius_squared,'Use the diameter midpoint as center and one-quarter diameter squared as radius squared.')
numeric(147,s.sqrt(s.Rational(30,2)**2+8**2),'The perpendicular bisects the chord. Its half-length and the center distance are perpendicular legs.')
numeric(148,s.Rational(2,5)*s.pi*180/s.pi/2,'C lies outside the minor arc, so the inscribed angle intercepts the stated minor central arc; convert and halve.')

assert len(reviews)==len(QUESTIONS)==48
assert {row['id'] for row in reviews}==set(BY_ID)
hashfile=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
report={'scope':'48 original Geometry and Trigonometry questions in m-geo-2.json only.','method':'Independent manually transcribed geometric relationships and exact arithmetic; every mathematical option and typed answer checked. Positional interpretations and applicable geometric theorems are editorially specified, not automatically inferred from natural language.','engine':f'SymPy {s.__version__}','solverSha256':hashfile(Path(__file__)),'helperSha256':hashfile(Path(__file__).with_name('review_math_common.py')),'requirementsSha256':hashfile(ROOT/'scripts/question-bank/requirements-review.txt'),'questionsReviewed':len(reviews),'items':reviews}
(ROOT/'docs/legacy-geometry-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Independently checked {len(reviews)} original Geometry/Trigonometry questions and recorded full source hashes.')
