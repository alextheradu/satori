// Original SAT-style evidence passages with numerical variants, not scraped questions.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { familyOverlapsByName, partitionReviewedFamily } from './partition-family.mjs'
const root=fileURLToPath(new URL('../../',import.meta.url)),directory=join(root,'src/data/questions')
const check=process.argv.includes('--check'),families=[]
let state
const int=(lo,hi)=>{state^=state<<13;state^=state>>>17;state^=state<<5;return lo+(state>>>0)%(hi-lo+1)}
const table=(headers,rows)=>`| ${headers.join(' | ')} |\n|${headers.map(()=>'---').join('|')}|\n${rows.map(r=>`| ${r.join(' | ')} |`).join('\n')}`
const approximately=(a,b)=>Math.abs(a-b)<1e-8
const fmt=n=>String(Number(n.toFixed(4)))
// Each option has a numerical truth check and a claim-relevance classification.
// True-but-irrelevant options are permitted; exactly one must support the stated claim.
const choice=(text,truth,relevant=true)=>({text,truth,relevant})
const add=(key,difficulty,make)=>families.push({key,difficulty,make})
const result=(intro,headers,rows,choices,explanation,prompt='Which choice most effectively uses data from the table to support the researcher’s claim?')=>({intro,headers,rows,choices,explanation,prompt})
add('gain-comparison','hard',()=>{
 const easy=int(65,78),hard=int(22,38),a=int(3,8),b=int(15,25),rows=[['Easy',easy,easy+a],['Difficult',hard,hard+b]]
 return result('In a hypothetical training study, a researcher claims that instruction improved accuracy more on difficult tasks than on easy tasks.',['Task','Accuracy before (%)','Accuracy after (%)'],rows,[
  choice(`Accuracy increased by ${b} percentage points on difficult tasks, compared with ${a} points on easy tasks.`,()=>rows[1][2]-rows[1][1]===b&&rows[0][2]-rows[0][1]===a&&b>a),
  choice(`Difficult-task accuracy was ${hard+b}% after training.`,()=>rows[1][2]===hard+b,false),
  choice(`Easy-task accuracy increased by ${b} percentage points.`,()=>rows[0][2]-rows[0][1]===b),
  choice(`Difficult-task accuracy increased by only ${a} percentage points.`,()=>rows[1][2]-rows[1][1]===a),
 ],`Compare within-task changes: ${hard+b}−${hard}=${b} points and ${easy+a}−${easy}=${a} points. The larger difficult-task gain supports the claim. A single endpoint does not show a gain, and the other statements exchange the two changes.`)
})
add('proportional-recovery','hard',()=>{
 const a=int(4,12)*10,scale=int(4,6),b=a*scale,pa=int(6,10)*10,pb=int(2,4)*10,da=a*pa/100,db=b*pb/100,rows=[['A',a,a+da],['B',b,b+db]]
 return result('In a hypothetical recovery study, a researcher claims that site A recovered more in proportional terms even though site B gained more individuals.',['Site','Initial count','Later count'],rows,[
  choice(`A increased by ${pa}%, while B increased by ${pb}%; their gains were ${da} and ${db} individuals respectively.`,()=>approximately((rows[0][2]-rows[0][1])/rows[0][1]*100,pa)&&approximately((rows[1][2]-rows[1][1])/rows[1][1]*100,pb)&&pa>pb&&db>da),
  choice(`B had ${b} individuals initially.`,()=>rows[1][1]===b,false),
  choice(`A gained more individuals than B.`,()=>da>db),
  choice(`B’s proportional increase exceeded A’s.`,()=>pb>pa),
 ],`A’s proportional gain is ${da}/${a}=${pa}%, while B’s is ${db}/${b}=${pb}%. Absolute gains use different starting populations, so a larger count increase can accompany a smaller percentage increase.`)
})
add('total-versus-rate','medium',()=>{
 const rate=int(12,48),hours=int(12,30),extra=int(5,18),rows=[['Earlier',hours,rate*hours],['Later',hours+extra,rate*(hours+extra)]]
 return result('In a fictional library study, a researcher claims that extended opening increased weekly visits without changing visits per open hour.',['Period','Open hours','Visits'],rows,[
  choice(`Visits rose from ${rows[0][2]} to ${rows[1][2]}, while both periods averaged ${rate} visits per open hour.`,()=>rows[1][2]>rows[0][2]&&rows.every(r=>r[2]/r[1]===rate)),
  choice(`The later period had ${hours+extra} open hours.`,()=>rows[1][1]===hours+extra,false),
  choice(`Visits per hour increased by ${extra}.`,()=>approximately(rows[1][2]/rows[1][1]-rows[0][2]/rows[0][1],extra)),
  choice(`Weekly visits remained at ${rows[0][2]}.`,()=>rows[1][2]===rows[0][2]),
 ],`Divide visits by open hours in each period: both rates are ${rate}. The total rises because more hours are available. Neither the raw increase in hours nor a visit total alone establishes a change in the rate.`)
})
add('opposite-treatment-effects','hard',()=>{
 const a=int(35,55),b=int(40,65),up=int(8,20),down=int(7,18),rows=[['Cool',a,a+up],['Warm',b,b-down]]
 return result('A hypothetical researcher claims that a coating’s effect on survival depends on temperature: it helps in cool conditions but harms in warm conditions.',['Condition','Uncoated survival (%)','Coated survival (%)'],rows,[
  choice(`Coating raised survival by ${up} points in cool conditions but lowered it by ${down} points in warm conditions.`,()=>rows[0][2]-rows[0][1]===up&&rows[1][1]-rows[1][2]===down),
  choice(`Uncoated survival in warm conditions was ${b}%.`,()=>rows[1][1]===b,false),
  choice(`Coating improved survival in both conditions.`,()=>rows.every(r=>r[2]>r[1])),
  choice(`Coating reduced survival in cool conditions by ${up} points.`,()=>rows[0][1]-rows[0][2]===up),
 ],`Evaluate the treatment within each temperature, rather than comparing unrelated endpoints. The cool-condition gain is ${up} points, while the warm-condition change is −${down} points, supporting opposite effects.`)
})
add('dose-plateau','medium',()=>{
 const base=int(5,20),gain=int(6,18),dose=int(2,8),rows=[[0,base],[dose,base+gain],[2*dose,base+gain]]
 return result('In a hypothetical trial, a researcher claims that adding a moderate dose increased growth but doubling that dose provided no further increase.',['Dose (units)','Mean growth (cm)'],rows,[
  choice(`Growth rose from ${base} to ${base+gain} cm at dose ${dose}, then remained ${base+gain} cm at dose ${2*dose}.`,()=>rows[1][1]>rows[0][1]&&rows[2][0]===2*rows[1][0]&&rows[2][1]===rows[1][1]),
  choice(`The highest tested dose was ${2*dose} units.`,()=>rows[2][0]===2*dose,false),
  choice(`Doubling the moderate dose doubled growth.`,()=>rows[2][1]===2*rows[1][1]),
  choice(`The moderate dose produced less growth than no treatment.`,()=>rows[1][1]<rows[0][1]),
 ],`The first increase is ${gain} cm, but the second is zero. This supports a plateau across the two nonzero doses tested; it does not establish what every possible higher dose would do.`)
})
add('partial-rebound','hard',()=>{
 const start=int(80,200),loss=int(25,50),rebound=int(5,20),rows=[['Before',start],['After disruption',start-loss],['After restoration',start-loss+rebound]]
 return result('A hypothetical researcher claims that restoration produced a partial recovery rather than a complete return to the earlier level.',['Period','Recorded count'],rows,[
  choice(`The count recovered from ${start-loss} to ${start-loss+rebound}, but remained below the original ${start}.`,()=>rows[2][1]>rows[1][1]&&rows[2][1]<rows[0][1]),
  choice(`The original count was ${start}.`,()=>rows[0][1]===start,false),
  choice(`Restoration returned the count to exactly ${start}.`,()=>rows[2][1]===start),
  choice(`The count continued declining after restoration.`,()=>rows[2][1]<rows[1][1]),
 ],`The post-restoration increase of ${rebound} is smaller than the initial loss of ${loss}. Both the rebound and the remaining gap are needed to support partial rather than complete recovery.`)
})
add('narrowing-group-gap','hard',()=>{
 const a=int(30,45),gap=int(30,40),gainA=int(20,30),gainB=int(3,8),rows=[['New users',a,a+gainA],['Experienced users',a+gap,a+gap+gainB]],after=gap+gainB-gainA
 return result('In a hypothetical interface study, a researcher claims that a redesign narrowed the completion-rate gap between new and experienced users.',['Group','Before (%)','After (%)'],rows,[
  choice(`The gap decreased from ${gap} to ${after} percentage points after redesign.`,()=>rows[1][1]-rows[0][1]===gap&&rows[1][2]-rows[0][2]===after&&after<gap),
  choice(`Experienced users had a completion rate of ${a+gap}% before redesign.`,()=>rows[1][1]===a+gap,false),
  choice(`The gap increased to ${gap+gainA-gainB} points after redesign.`,()=>rows[1][2]-rows[0][2]===gap+gainA-gainB),
  choice(`New users improved by only ${gainB} points.`,()=>rows[0][2]-rows[0][1]===gainB),
 ],`Compare the between-group gaps at both times: ${gap} before and ${after} after. The groups can retain different final rates even while the disparity narrows.`)
})
add('adoption-versus-intensity','medium',()=>{
 const small=int(65,85),large=int(30,55),usesA=int(2,5),usesB=int(8,14),rows=[['Small workshops',small,usesA],['Large workshops',large,usesB]]
 return result('A hypothetical researcher claims that a tool is adopted more widely in small workshops but used more frequently by adopters in large workshops.',['Workshop group','Adoption (%)','Weekly uses per adopter'],rows,[
  choice(`Adoption was ${small}% versus ${large}% in small and large workshops, but adopters averaged ${usesA} versus ${usesB} weekly uses respectively.`,()=>rows[0][1]>rows[1][1]&&rows[0][2]<rows[1][2]),
  choice(`Large-workshop adopters averaged ${usesB} weekly uses.`,()=>rows[1][2]===usesB,false),
  choice(`Small workshops had both greater adoption and greater use per adopter.`,()=>rows[0][1]>rows[1][1]&&rows[0][2]>rows[1][2]),
  choice(`Large workshops had the higher adoption rate.`,()=>rows[1][1]>rows[0][1]),
 ],`Adoption describes how widely the tool is used across workshops; uses per adopter describes intensity among users. The table supports opposite rankings on these two measures.`)
})
add('same-center-different-range','hard',()=>{
 const mean=int(30,70),narrow=int(2,8),wide=int(12,25),rows=[['A',mean,mean-narrow,mean+narrow],['B',mean,mean-wide,mean+wide]]
 return result('A hypothetical analyst claims that equal average completion times can conceal different ranges of individual times.',['Method','Mean time (s)','Minimum (s)','Maximum (s)'],rows,[
  choice(`Both means were ${mean} seconds, but the ranges were ${2*narrow} seconds for A and ${2*wide} for B.`,()=>rows[0][1]===rows[1][1]&&rows[0][3]-rows[0][2]===2*narrow&&rows[1][3]-rows[1][2]===2*wide&&wide>narrow),
  choice(`Method B’s maximum was ${mean+wide} seconds.`,()=>rows[1][3]===mean+wide,false),
  choice(`A’s mean was ${wide-narrow} seconds lower than B’s.`,()=>rows[1][1]-rows[0][1]===wide-narrow),
  choice(`The two methods had equal ranges.`,()=>rows[0][3]-rows[0][2]===rows[1][3]-rows[1][2]),
 ],`A range subtracts the minimum from the maximum. The ranges differ despite equal means, demonstrating a difference in spread that a shared average does not display. Range alone does not identify a particular standard deviation.`)
})
add('count-versus-share','hard',()=>{
 const n=int(4,12)*20,ratio=int(4,6),smallRate=int(6,8)*10,largeRate=int(2,4)*10,small=n*smallRate/100,large=n*ratio*largeRate/100,rows=[['Small district',n,small],['Large district',n*ratio,large]]
 return result('A fictional survey report claims that the larger district had more program participants but a lower participation share.',['District','Residents surveyed','Participants'],rows,[
  choice(`The larger district had ${large} participants versus ${small}, but participation was ${largeRate}% versus ${smallRate}% respectively.`,()=>large>small&&approximately(rows[1][2]/rows[1][1]*100,largeRate)&&approximately(rows[0][2]/rows[0][1]*100,smallRate)&&largeRate<smallRate),
  choice(`The larger district surveyed ${n*ratio} residents.`,()=>rows[1][1]===n*ratio,false),
  choice(`The larger district had a participation share of ${smallRate}%.`,()=>approximately(rows[1][2]/rows[1][1]*100,smallRate)),
  choice(`The smaller district had more participants.`,()=>small>large),
 ],`Use each district’s own surveyed population as the denominator. Larger raw participation can coexist with a smaller participation percentage when the groups differ in size.`)
})
add('preference-versus-performance','hard',()=>{
 const pref=int(60,85),old=int(82,94),drop=int(5,15),rows=[['Original',100-pref,old],['Revised',pref,old-drop]]
 return result('In a hypothetical interface trial, an analyst concludes that the more popular design was also more accurate. Another researcher questions that conclusion.',['Design','Preferred by participants (%)','Task accuracy (%)'],rows,[
  choice(`The revised design was preferred by ${pref}% of participants but had accuracy ${drop} points lower than the original.`,()=>rows[1][1]>rows[0][1]&&rows[0][2]-rows[1][2]===drop),
  choice(`The original design’s accuracy was ${old}%.`,()=>rows[0][2]===old,false),
  choice(`The revised design had both higher preference and higher accuracy.`,()=>rows[1][1]>rows[0][1]&&rows[1][2]>rows[0][2]),
  choice(`The original design was preferred by ${pref}% of participants.`,()=>rows[0][1]===pref),
 ],`Preference and measured accuracy are separate outcomes. The preferred revised design had lower, not higher, accuracy. The full comparison directly challenges the proposed link.`, 'Which choice most effectively uses the table to challenge the analyst’s conclusion?')
})
add('relative-cost-burden','hard',()=>{
 const income=int(8,15)*100,ratio=int(3,5),lowRate=int(15,22),highRate=int(4,8),lowCost=income*lowRate/100,highCost=income*ratio*highRate/100,rows=[['Lower income',income,lowCost],['Higher income',income*ratio,highCost]]
 return result('In a hypothetical budget study, a researcher claims that travel used a larger share of income in the lower-income group, regardless of the absolute travel-cost comparison.',['Group','Monthly income','Monthly travel cost'],rows,[
  choice(`Travel cost represented ${lowRate}% of lower-group income and ${highRate}% of higher-group income.`,()=>approximately(rows[0][2]/rows[0][1]*100,lowRate)&&approximately(rows[1][2]/rows[1][1]*100,highRate)&&lowRate>highRate),
  choice(`Higher-group monthly income was ${income*ratio}.`,()=>rows[1][1]===income*ratio,false),
  choice(`Travel represented only ${highRate}% of lower-group income.`,()=>approximately(rows[0][2]/rows[0][1]*100,highRate)),
  choice(`The two groups spent identical shares of income on travel.`,()=>approximately(lowCost/income,highCost/(income*ratio))),
 ],`The claim concerns relative burden: divide each travel cost by that group’s income. Comparing costs alone would ignore the different financial bases.`)
})
add('nonmonotonic-growth','medium',()=>{
 const low=int(4,10),gain=int(6,12),drop=int(2,5),temp=int(10,18),step=int(5,10),rows=[[temp,low],[temp+step,low+gain],[temp+2*step,low+gain-drop]]
 return result('A hypothetical researcher claims that growth did not increase continuously across the tested temperatures, instead reaching its highest value at the middle temperature.',['Temperature','Mean growth (cm)'],rows,[
  choice(`Growth rose from ${low} to ${low+gain} cm and then fell to ${low+gain-drop} cm at the highest temperature.`,()=>rows[1][1]>rows[0][1]&&rows[1][1]>rows[2][1]),
  choice(`The highest temperature tested was ${temp+2*step}.`,()=>rows[2][0]===temp+2*step,false),
  choice(`Growth was greatest at the highest tested temperature.`,()=>rows[2][1]>rows[1][1]&&rows[2][1]>rows[0][1]),
  choice(`Growth fell between every pair of consecutive temperatures.`,()=>rows[1][1]<rows[0][1]&&rows[2][1]<rows[1][1]),
 ],`Reading all three measurements reveals a rise and then a fall. The conclusion applies to the tested temperatures; the table does not locate the exact optimum among untested values.`)
})
add('universal-claim-exception','hard',()=>{
 const a=int(30,55),b=int(35,60),c=int(35,65),gainA=int(8,20),gainB=int(7,18),rows=[['A',a,a+gainA],['B',b,b+gainB],['C',c,c]]
 return result('A hypothetical researcher claims that adding reminders increased completion in every tested location. A reviewer argues that the table contains an exception.',['Location','Without reminder (%)','With reminder (%)'],rows,[
  choice(`Location C remained at ${c}% with or without reminders.`,()=>rows[2][1]===rows[2][2]),
  choice(`Location A increased from ${a}% to ${a+gainA}%.`,()=>rows[0][2]>rows[0][1],false),
  choice(`Location C increased by ${gainA} percentage points.`,()=>rows[2][2]-rows[2][1]===gainA),
  choice(`Location B showed no change in completion.`,()=>rows[1][1]===rows[1][2]),
 ],`An unchanged location is an exception to the claim of an increase everywhere. Gains in A or B support a narrower claim, but cannot remove the counterexample at C.`, 'Which choice most effectively uses the table to support the reviewer’s objection?')
})
add('aggregate-reversal','hard',()=>{
 const scale=int(1,12),offset=int(0,8),ae=80+offset,be=ae-10,ah=30+offset,bh=ah-10
 const rows=[['A, easy',10*scale,ae],['B, easy',90*scale,be],['A, difficult',90*scale,ah],['B, difficult',10*scale,bh]],overallA=(ae+9*ah)/10,overallB=(9*be+bh)/10
 return result('In a hypothetical test of two methods, a researcher claims that the overall success rate alone can hide a different ranking within each task type.',['Method and task','Trials','Success rate (%)'],rows,[
  choice(`A outperformed B within both task types, although the weighted overall rate was ${fmt(overallA)}% for A and ${fmt(overallB)}% for B.`,()=>ae>be&&ah>bh&&overallA<overallB&&approximately((rows[0][1]*ae+rows[2][1]*ah)/(100*scale),overallA)&&approximately((rows[1][1]*be+rows[3][1]*bh)/(100*scale),overallB)),
  choice(`Method A had ${90*scale} difficult trials.`,()=>rows[2][1]===90*scale,false),
  choice(`B had higher success within both task types.`,()=>be>ae&&bh>ah),
  choice(`The unweighted average of the two percentages equals each method’s overall rate.`,()=>approximately((ae+ah)/2,overallA)&&approximately((be+bh)/2,overallB)),
 ],`Weight success rates by trial counts. A was tested mainly on difficult tasks and B mainly on easy tasks, so B’s aggregate rate can be higher even though A’s rate is higher within both types. Ignoring the unequal trial mix conceals that distinction.`)
})
add('accuracy-without-delay','medium',()=>{
 const errors=int(6,14),decrease=int(2,5),time=int(60,110),faster=int(2,9),rows=[['Original',errors,time],['Revised',errors-decrease,time-faster]]
 return result('A hypothetical design team claims that its revision reduced errors without making participants take longer.',['Design','Mean errors','Mean completion time (s)'],rows,[
  choice(`Mean errors fell by ${decrease}, while completion time fell by ${faster} seconds.`,()=>rows[0][1]-rows[1][1]===decrease&&rows[0][2]-rows[1][2]===faster),
  choice(`The original design took ${time} seconds on average.`,()=>rows[0][2]===time,false),
  choice(`The revised design required ${faster} more seconds.`,()=>rows[1][2]-rows[0][2]===faster),
  choice(`Mean errors increased by ${decrease}.`,()=>rows[1][1]-rows[0][1]===decrease),
 ],`The table supports both required outcomes: fewer errors and no added time. Reporting only the original time is insufficient, and the other options reverse the directions of change.`)
})

const seen=new Set(),all=[],archived=[],report=[],sourceById=new Map()
const overlaps=familyOverlapsByName('rw-gen-quant-')
for(const file of readdirSync(directory).filter(f=>f.endsWith('.json')&&f!=='generated-rw-quantitative.json')){
 for(const q of JSON.parse(readFileSync(join(directory,file),'utf8'))){
  seen.add(`${q.passage??''}\n${q.prompt}`)
  sourceById.set(q.id,q)
 }
}
for(const [familyIndex,family] of families.entries()) {
 state=0x75faca19;for(const ch of family.key)state=Math.imul(state^ch.charCodeAt(0),16777619)
 const items=[]
 for(let attempt=0;items.length<32&&attempt<10000;attempt++) {
  const item=family.make(),truth=item.choices.map(c=>Boolean(c.truth())),valid=item.choices.map((c,i)=>truth[i]&&c.relevant)
  // Degenerate random combinations are rejected rather than published with an invalid key.
  if(!valid[0])continue
  assert.equal(valid.filter(Boolean).length,1,`${family.key}: ambiguous evidence choices`)
  assert.equal(new Set(item.choices.map(c=>c.text)).size,4)
  assert(item.rows.every(r=>r.length===item.headers.length))
  const passage=`${item.intro}\n\n${table(item.headers,item.rows)}`
  const fingerprint=`${passage}\n${item.prompt}`
  if(seen.has(fingerprint))continue
  const n=items.length,answer=(familyIndex+n)%4,choices=item.choices.map(c=>c.text),correct=choices.shift();choices.splice(answer,0,correct)
  items.push({id:`rw-gen-quant-${family.key}-${String(n+1).padStart(3,'0')}`,section:'rw',domain:'Information and Ideas',skill:'Command of Evidence (Quantitative)',difficulty:family.difficulty,passage,prompt:item.prompt,choices,answer,explanation:item.explanation})
  seen.add(fingerprint)
 }
 assert.equal(items.length,32,`${family.key}: not enough unique variants`)
 const representative=items[0],overlap=overlaps.get(family.key)
 const partition=partitionReviewedFamily(items,representative,overlap,sourceById)
 all.push(...partition.active);archived.push(...partition.retired)
 report.push({family:family.key,difficulty:family.difficulty,questions:partition.active.length,representative:overlap?.retainedQuestionId??representative.id,archived:partition.retired.length,...(overlap?{reviewCandidate:representative.id,overlap}: {})})
}
assert.equal(report.filter(row=>row.overlap).length,overlaps.size,'Every quantitative overlap must resolve to a generated family')
const save=(path,value)=>{const text=JSON.stringify(value,null,2)+'\n';if(check)assert.equal(readFileSync(path,'utf8'),text,`${path}: regenerate question content`);else writeFileSync(path,text)}
save(join(directory,'generated-rw-quantitative.json'),all)
save(join(root,'src/data/retired/generated-rw-quantitative.json'),archived)
save(join(root,'docs/quantitative-reading-report.json'),{provenance:'One active representative per table-evidence family; numerical siblings are historical only. Arithmetic and answer-relevance tags are checked; not independent editorial certification.',maximumActivePerFamily:1,candidatesPerFamily:32,archivedTotal:archived.length,total:all.length,families:report})
console.log(`${check?'Verified':'Generated'} ${all.length} active quantitative Reading and Writing representatives; ${archived.length} historical variants; arithmetic and single-supporting-choice checks passed.`)
