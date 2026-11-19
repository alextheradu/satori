"""Independent review of the 48 legacy Problem-Solving/Data Analysis items.

Numerical givens are manually transcribed into exact models, independently of
keys. English choices are explicitly interpreted into mathematical statements
or study-design categories; those interpretations are editorial judgments.
"""
import hashlib
import json
import re
from pathlib import Path
import sympy as s
from review_math_common import expression

ROOT=Path(__file__).resolve().parents[2]
QUESTIONS=json.loads((ROOT/'src/data/questions/m-psda-2.json').read_text())
BY_ID={q['id']:q for q in QUESTIONS}
x=s.Symbol('x',real=True)
reviews=[]


def expr(text):
    return expression(text.replace(',','').replace('\\%','').replace('%',''),{'x':x})


def finish(number,model,result,flags=None,notes=None):
    q=BY_ID[f'm-psda-{number}']
    if flags is not None:
        flags=[bool(value) for value in flags]
        assert len(flags)==4 and sum(flags)==1,(q['id'],flags)
        assert flags[q['answer']],(q['id'],'incorrect stored key',flags)
    else:
        for answer in q['answer']:
            assert s.simplify(expr(answer)-result)==0,(q['id'],answer,result)
    digest=hashlib.sha256(json.dumps(q,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    reviews.append({'id':q['id'],'sourceSha256':digest,'model':model,'derivedResult':str(result),'validChoices':flags,'editorialNotes':notes or []})


def numeric(number,result,model,notes=None):
    q=BY_ID[f'm-psda-{number}']
    flags=[s.simplify(expr(z)-result)==0 for z in q['choices']] if 'choices' in q else None
    finish(number,model,result,flags,notes)


def interpreted(number,model,result,interpretations,predicate,notes=None):
    """Guard wording before applying an explicit interpretation predicate."""
    q=BY_ID[f'm-psda-{number}']
    assert set(interpretations)==set(q['choices']),q['id']
    finish(number,model,result,[predicate(interpretations[z]) for z in q['choices']],notes)


def mean(values): return sum(values)/s.Integer(len(values))
def variance(values): return mean([(v-mean(values))**2 for v in values])
def median(values):
    ordered=sorted(values);n=len(ordered)
    return ordered[n//2] if n%2 else s.Rational(ordered[n//2-1]+ordered[n//2],2)


numeric(101,12*s.Rational(2,3),'Scale dried-fruit cups by the 2/3 fruit-to-oats ratio.')
numeric(102,s.Rational(240,15)*40,'Convert to bottles/minute before scaling to 40 minutes.')
numeric(103,s.Integer(5)*3600/1000,'Convert meters/second to kilometers/hour using 3600 seconds/hour.')
numeric(104,9*s.Rational(15,2),'Apply the actual-distance-per-map-centimeter scale.')
numeric(105,s.Integer(2700)/(s.Rational(1200,4*30)*6),'Find flyers per printer-minute, then use six printers.')
numeric(106,s.Integer(2025)/s.Rational(75,10)/s.Rational(75,100)/60,'Convert gallons to cubic feet, divide by cubic feet/minute, then convert minutes to hours.')
kk=s.solve(4*5*x-5*(3*x+6),x)[0]
numeric(107,5*kk,'Represent the original groups as 5k and 3k; impose the changed 5:4 ratio and return boys.')
numeric(108,s.Rational(35,100)*260,'Convert 35% to a proportion and multiply.')
numeric(109,s.Rational(18,100)*400,'Convert 18% to a proportion and multiply.')
numeric(110,100*s.Rational(80-64,64),'Use the original price as the percent-change denominator.')
numeric(111,s.Integer(49)/s.Rational(7,10),'The sale price is 70% of the original price.')
change=100*(s.Rational(9,10)**2*s.Rational(12,10)-1)
interpretations={'A decrease of 8%':-8,'A decrease of 2.8%':s.Rational(-28,10),'No change':0,'An increase of 2.8%':s.Rational(28,10)}
interpreted(112,'Multiply successive growth factors, then convert the net change to percent.',change,interpretations,lambda value:value==change)
numeric(113,100*s.Rational(150,100)*s.Rational(40,100),'Compose the two proportions relative to z>0.')
numeric(114,s.Integer(96)/(s.Rational(16,10)*s.Rational(75,100)),'Reverse the 60% markup and 25% reduction multiplicatively.')
numeric(115,median([12,15,9,20,15,18,11]),'Sort the seven values and take the fourth.')
numeric(116,7+s.Integer(18),'With x>22, x is the maximum and 7 remains the minimum.')
aa=[78,79,80,80,81,82];bb=[60,70,80,80,90,100]
facts={'sd_A':s.sqrt(variance(aa)),'sd_B':s.sqrt(variance(bb)),'mean_A':mean(aa),'mean_B':mean(bb),'median_A':median(aa),'median_B':median(bb)}
interpretations={
 'The standard deviation of the Group A scores is less than the standard deviation of the Group B scores.':('sd_A','<','sd_B'),
 'The mean of the Group A scores is greater than the mean of the Group B scores.':('mean_A','>','mean_B'),
 'The median of the Group B scores is greater than the median of the Group A scores.':('median_B','>','median_A'),
 'The standard deviation of the Group A scores is greater than the standard deviation of the Group B scores.':('sd_A','>','sd_B'),
}
interpreted(117,'Compute exact means, medians, and population variances. Equal sample sizes also preserve the SD comparison with sample SDs.',facts,interpretations,lambda z:facts[z[0]]<facts[z[2]] if z[1]=='<' else facts[z[0]]>facts[z[2]],['Corrected the explanation: the claims comparing means and medians are false, not the first two listed statements.'])
old=[12,14,15,15,17,19,21,22,48];new=[12,14,15,15,17,19,21,22,84]
changes=(s.sign(mean(new)-mean(old)),s.sign(median(new)-median(old)))
interpretations={'Both the mean and the median increase.':(1,1),'The median increases, and the mean does not change.':(0,1),'Neither the mean nor the median changes.':(0,0),'The mean increases, and the median does not change.':(1,0)}
interpreted(118,'Compute both centers before and after replacing the largest value.',changes,interpretations,lambda z:z==changes)
frequencies={0:4,1:6,2:7,3:5,4:3}
assert sum(frequencies.values())==25
numeric(119,sum(v*n for v,n in frequencies.items())/s.Integer(sum(frequencies.values())),'Use the frequency-weighted sum and the total number of students.')
result=(2*14+5,2*3)
flags=[tuple(map(int,re.findall(r'\d+',z)))==result for z in BY_ID['m-psda-120']['choices']]
finish(120,'An affine transformation sends mean to 2*14+5 and SD to abs(2)*3.',result,flags)
numeric(121,s.solve(18*72+84*x-80*(18+x),x)[0],'Equate the sum of group score totals to the combined mean times combined count.')
interpretations={
 'The estimated height of the candle decreases by 1.5 centimeters for each hour it burns.':('rate',s.Rational(-15,10)),
 'The estimated height of the candle when it was lit is 1.5 centimeters.':('initial',s.Rational(15,10)),
 'The candle is estimated to burn completely in 1.5 hours.':('zero_time',s.Rational(15,10)),
 'The estimated height of the candle decreases by 22 centimeters for each hour it burns.':('rate',-22),
}
facts={'rate':s.Rational(-15,10),'initial':22,'zero_time':s.Rational(44,3)}
interpreted(122,'The coefficient of elapsed hours has units centimeters/hour; compare other interpretations to intercept and zero time.',facts,interpretations,lambda z:facts[z[0]]==z[1])
numeric(123,s.Rational(32,10)*15+41,'Substitute 15 into the given best-fit line.')
points=[(0,s.Rational(51,10)),(2,s.Rational(89,10)),(4,s.Rational(132,10)),(6,s.Rational(168,10)),(8,21)]
errors=[sum((expr(z.split('=')[1]).subs(x,u)-v)**2 for u,v in points) for z in BY_ID['m-psda-124']['choices']]
finish(124,'Compare the total squared prediction errors of all four proposed linear models.',errors,[error==min(errors) for error in errors])
line=s.interpolate([(2,13),(10,37)],x)
numeric(125,line.subs(x,7),'Interpolate the two points on the line and evaluate at x=7.')
points=[(0,200),(1,240),(2,288),(3,s.Rational(3456,10))]
finish(126,'Test every candidate model at every table input; fractional values are estimates rather than exact people counts.',points,[all(expr(z.split('=')[1]).subs(x,u)==v for u,v in points) for z in BY_ID['m-psda-126']['choices']],['Relabeled table entries as model estimates and asked which equation could define the model. Exact membership counts cannot be 345.6.'])
numeric(127,45-(s.Rational(18,10)*20+12),'Residual is actual minus predicted, in that order.')
interpretations={'It decreases by 8% every 2 years.':(2,s.Rational(8,100)),'It decreases by 4% every year.':(1,s.Rational(4,100)),'It decreases by 8% every year.':(1,s.Rational(8,100)),'It decreases by 16% every 2 years.':(2,s.Rational(16,100))}
interpreted(128,'The exact factor over d years is (23/25)^(d/2).',s.Rational(23,25),interpretations,lambda z:s.simplify(s.Rational(23,25)**s.Rational(z[0],2)-(1-z[1]))==0)
numeric(129,s.Rational(len([v for v in range(1,9) if v>5]),8),'Count the three equally likely spinner outcomes greater than 5.')
numeric(130,s.Rational(9,6+9+5),'Blue marbles divided by all marbles.')
cars=[[14,18],[22,26]]
assert [sum(row) for row in cars]==[32,48]
assert [sum(row[i] for row in cars) for i in range(2)]==[36,44]
numeric(131,s.Rational(cars[1][1],sum(map(sum,cars))),'Check all row/column totals and use white SUVs over all 80 cars.')
commutes=[[42,30,8],[51,45,24]]
assert [sum(row) for row in commutes]==[80,120]
assert [sum(row[i] for row in commutes) for i in range(3)]==[93,75,32]
numeric(132,s.Rational(commutes[1][2],sum(commutes[1])),'Condition on engineering; the denominator is 120, not all 200 employees or the bicycle column.')
sports=[[28,22,14],[36,30,30]]
assert [sum(row) for row in sports]==[64,96]
assert [sum(row[i] for row in sports) for i in range(3)]==[64,52,44]
numeric(133,s.Rational(sports[0][0],sum(row[0] for row in sports)),'Condition on soccer preference; count grade 10 within that column.')
owners=s.Rational(40,100)*250
owner_apartments=s.Rational(35,100)*owners
other_apartments=s.Rational(60,100)*(250-owners)
numeric(134,owner_apartments/(owner_apartments+other_apartments),'Construct joint counts before conditioning on apartment residence.')
passed=s.solve(x-s.Rational(4,10)*(x+45),x)[0]
numeric(135,passed+12,'Solve for course-takers who passed, then include the 12 who did not pass.')
interval=s.Interval(34-3,34+3)
finish(136,'Compare each option to the reported estimate-plus/minus-margin interval.',interval,[expr(z) in interval for z in BY_ID['m-psda-136']['choices']],['Clarified the reported interval without asserting that all outside values are logically impossible.'])
numeric(137,s.Rational(9,300)*15000,'Apply the random-sample defect fraction to the week production.')
interpretations={
 'Surveying a random sample of 1,200 registered voters in the state instead':('state_random',1200),
 'Surveying a random sample of 300 registered voters in the state instead':('state_random',300),
 'Surveying 600 registered voters who respond to an online advertisement instead':('volunteers',600),
 "Surveying 600 registered voters from the state's largest city instead":('one_city',600),
}
interpreted(138,'For otherwise comparable statewide random samples at fixed confidence, 1/sqrt(n) decreases with n. Different frames do not supply the same inference.',s.sqrt(s.Rational(600,1200)),interpretations,lambda z:z[0]=='state_random' and z[1]>600,['Distinguished self-selection in an advertisement from restricted coverage in a one-city sample.'])
interpretations={'All adults who exercise at any fitness center':'all_centers','All adults in the city where the fitness center is located':'city','All 2,400 members of the fitness center':'center_members','Only the 150 members who were surveyed':'sample_only'}
interpreted(139,'The complete sampling frame is this fitness center membership; choose the largest supported population.','center_members',interpretations,lambda z:z=='center_members')
first=s.Interval(s.Rational(425,10)-s.Rational(18,10),s.Rational(425,10)+s.Rational(18,10))
second=s.Interval(s.Rational(451,10)-s.Rational(12,10),s.Rational(451,10)+s.Rational(12,10))
overlap=s.Intersection(first,second)
interpretations={
 'The mean height of all such plants in Field 2 is greater than the mean height of all such plants in Field 1.':'definite_order',
 'Every such plant in Field 2 is taller than every such plant in Field 1.':'individual_order',
 'The mean height of all such plants in Field 2 is exactly 2.6 centimeters greater than that of Field 1.':'exact_difference',
 'It is plausible that the mean height of all such plants in Field 1 is equal to the mean height of all such plants in Field 2.':'possible_equality',
}
supported={'possible_equality':overlap!=s.EmptySet,'definite_order':second.inf>first.sup,'individual_order':False,'exact_difference':first.measure==0 and second.measure==0}
interpreted(140,'Compute both reported marginal intervals. Their overlap permits equal means within those intervals; this is not a formal two-sample significance test.',{'first':first,'second':second,'overlap':overlap},interpretations,lambda z:supported[z])
interpretations={
 'It is plausible that between 8% and 12% of all adults in the state own an electric vehicle.':('state_population_interval',8,12),
 'The proportion of adults in the sample who own an electric vehicle is unknown and could be any value from 8% to 12%.':('unknown_sample_interval',8,12),
 'Exactly 10% of all adults in the state own an electric vehicle.':('exact_population',10,10),
 'Between 8% and 12% of all adults in the country own an electric vehicle.':('country_population_interval',8,12),
}
interval=(10-2,10+2)
interpreted(141,'The sample fraction is known: 90/900=10%. The reported uncertainty concerns the state population fraction.',interval,interpretations,lambda z:z[0]=='state_population_interval' and z[1:]==interval,['Replaced a logically true distractor: the known sample proportion of 10% is itself between 8% and 12%. The replacement incorrectly treats that known sample proportion as unknown.'])
interval=(s.Rational(300-55,1000)*18000,s.Rational(300+55,1000)*18000)
flags=[]
for z in BY_ID['m-psda-142']['choices']:
    values=tuple(int(v.replace(',','')) for v in re.findall(r'[\d,]+',z))
    if len(values)==1:values=values*2
    flags.append(values==interval)
finish(142,'Convert the percentage-point interval 24.5%-35.5% to population counts, not percentages of the estimated count.',interval,flags)
interpretations={
 'Fertilizer X caused an increase in tomato production for the plants in the study.':('causal','study'),
 'Fertilizer X increases tomato production for every tomato plant in the world.':('universal','world_tomatoes'),
 'No conclusion about cause and effect can be made, because the plants were not randomly selected from all tomato plants.':('no_causal','study'),
 'Fertilizer X increases production for all types of vegetable plants.':('universal','all_vegetables'),
}
interpreted(143,'Treatment assignment was randomized among the 60 study plants; recruitment was not a world-wide sample.',('causal','study'),interpretations,lambda z:z==('causal','study'))
interpretations={
 "Let each student choose whether to use the new method, and then compare the two groups' test scores.":'self_selection',
 "Have all 80 students use the new method, and then compare their test scores with those of last year's students.":'historical_control',
 "Have the 40 students with the highest grades use the new method, and then compare the two groups' test scores.":'prior_grade_assignment',
 "Randomly assign half of the 80 students to use the new method and the other half to use their usual method, and then compare the two groups' test scores.":'random_assignment',
}
interpreted(144,'Identify the design that reduces systematic pretreatment group differences by random assignment.','random_assignment',interpretations,lambda z:z=='random_assignment',['Removed the false guarantee that random assignment makes groups identical in all other respects.'])
interpretations={
 'The participants were not randomly selected from all adults.':'sampling',
 'The study included fewer than 1,000 participants.':'size_threshold',
 'The participants were not randomly assigned to meditate or not meditate.':'self_selected_treatment',
 "The participants' stress levels were measured at the end of the study.":'outcome_timing',
}
interpreted(145,'Self-selection into meditation permits preexisting differences to explain the observed stress association.','self_selected_treatment',interpretations,lambda z:z=='self_selected_treatment',['Explained the causal limitation of this design without treating random assignment as a universal logical prerequisite for every possible causal inference.'])
interpretations={
 'No, because the respondents were not randomly selected and are likely more supportive of cycling than city residents in general.':'selection_bias',
 'Yes, because 3,000 is a large number of respondents.':'large_size',
 'Yes, because more than 80% of the respondents support more bike lanes.':'sample_majority',
 "No, because a sample must include at least half of a city's residents.":'half_population_threshold',
}
interpreted(146,'A voluntary cycling-site poll has both coverage and self-selection concerns; size alone does not address either.','selection_bias',interpretations,lambda z:z=='selection_bias')
interpretations={
 'Select 200 students at random from the district, let each student decide whether to use the app, and compare the scores of users and nonusers.':(True,False),
 'Select 200 volunteers from one school in the district, randomly assign 100 of them to use the app and 100 not to use it, and compare their scores.':(False,True),
 'Compare the scores of all district students who already use the app with the scores of those who do not.':(False,False),
 'Select 200 students at random from the district, randomly assign 100 of them to use the app and 100 not to use it, and compare their scores.':(True,True),
}
interpreted(147,'Among the proposed designs, combine district-wide random selection and randomized treatment for population-level causal inference.',('random_selection','random_assignment'),interpretations,lambda z:all(z),['Reworded the explanation around what sampling and assignment support, rather than absolute guarantees.'])
interpretations={
 'Owning a dog causes adults in the country to take more steps per day.':('causal','country'),
 'If an adult in the country who does not own a dog gets one, that adult will take more steps per day.':('individual_causal','country'),
 'Among adults in every country, owning a dog is associated with taking more steps per day.':('association','every_country'),
 'Among adults in the country, owning a dog is associated with taking more steps per day.':('association','country'),
}
interpreted(148,'Random country-wide sampling supports generalizing an association; no dog ownership treatment was assigned.',('association','country'),interpretations,lambda z:z==('association','country'))

assert len(reviews)==len(QUESTIONS)==48
assert {row['id'] for row in reviews}==set(BY_ID)
hashfile=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
report={'scope':'48 original Problem-Solving and Data Analysis questions in m-psda-2.json only.','method':'Independent manually transcribed givens with exact arithmetic, weighted data, probability, model comparisons and reported uncertainty intervals. English choices and study-design features have explicit editorial interpretations; these are not automatically inferred from natural language.','engine':f'SymPy {s.__version__}','solverSha256':hashfile(Path(__file__)),'helperSha256':hashfile(Path(__file__).with_name('review_math_common.py')),'requirementsSha256':hashfile(ROOT/'scripts/question-bank/requirements-review.txt'),'questionsReviewed':len(reviews),'items':reviews}
(ROOT/'docs/legacy-psda-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'Independently checked {len(reviews)} original PSDA questions; recorded calculations, editorial interpretations, and source hashes.')
