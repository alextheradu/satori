// Original paired-project contexts reused across explicit rhetorical goals.
import assert from 'node:assert/strict'
import { readFileSync,readdirSync,writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { expressionContexts } from './expression-contexts.mjs'
const root=fileURLToPath(new URL('../../',import.meta.url)),dir=join(root,'src/data/questions'),check=process.argv.includes('--check')
const families=[],questions=[],seen=new Set(),report=[]
const opt=(text,target,verify=()=>true)=>({text,target,verify})
const add=(key,skill,difficulty,make)=>families.push({key,skill,difficulty,make})
const data=expressionContexts.map(([a,b,category,goal,ma,mb,ra,rb],index)=>{
 for(const value of [a,b,category,goal,ma,mb,ra,rb])assert(typeof value==='string'&&value.trim()===value&&value.length>2)
 assert(a!==b&&ma!==mb&&ra!==rb)
 const yearA=2010+index%7,yearB=yearA+1+index%3,nA=40+5*index,nB=nA+10+5*(index%7)
 return {a,b,category,goal,ma,mb,ra,rb,yearA,yearB,nA,nB,index}
})
assert.equal(data.length,32)
const notes=d=>[
 `${d.a} and ${d.b} are fictional ${d.category}s.`,
 `Both aim to ${d.goal}.`,
 `${d.a} ${d.ma} to ${d.ra}.`,
 `${d.b} ${d.mb} to ${d.rb}.`,
 `${d.a}: introduced ${d.yearA}; ${d.b}: introduced ${d.yearB}.`,
 `Pilots involved ${d.nA} users for ${d.a} and ${d.nB} for ${d.b}; no comparative performance outcomes were reported.`,
]
const synthesis=(d,task,target,options,explanation)=>({passage:`A student has taken these notes about two fictional projects.\n\n${notes(d).map(n=>'- '+n).join('\n')}`,prompt:`The student wants to ${task}. Which choice most effectively uses relevant information from the notes?`,target,options,explanation})
add('shared-purpose','Rhetorical Synthesis','medium',d=>synthesis(d,'emphasize a purpose shared by the two projects','shared-purpose',[
 opt(`Both ${d.a} and ${d.b} aim to ${d.goal}.`,'shared-purpose'),
 opt(`${d.a} ${d.ma}, whereas ${d.b} ${d.mb}.`,'method-contrast'),
 opt(`${d.a} was introduced in ${d.yearA}, before ${d.b} in ${d.yearB}.`,'chronology',()=>d.yearA<d.yearB),
 opt(`${d.b} had ${d.nB} users in its pilot.`,'single-pilot-count',()=>d.nB>0),
],`The goal asks for a shared purpose, so the sentence must state what both projects aim to do: ${d.goal}. Their methods, dates, and pilot sizes are relevant facts for other goals but do not express that common purpose.`))
add('method-contrast','Rhetorical Synthesis','medium',d=>synthesis(d,'contrast the methods used by the two projects','method-contrast',[
 opt(`${d.a} ${d.ma}, whereas ${d.b} ${d.mb}.`,'method-contrast'),
 opt(`Both projects aim to ${d.goal}.`,'shared-purpose'),
 opt(`${d.a} was introduced in ${d.yearA}.`,'single-date'),
 opt(`${d.b} had ${d.nB-d.nA} more pilot users than ${d.a}.`,'pilot-comparison',()=>d.nB-d.nA>0),
],`The requested contrast concerns methods, not time or participation. The correct sentence places ${d.ma} beside ${d.mb}; the other choices state a similarity, one date, or a numerical comparison.`))
add('introduce-unfamiliar-project','Rhetorical Synthesis','medium',d=>synthesis(d,`introduce ${d.a} to unfamiliar readers by identifying its type and purpose`,'type-and-purpose',[
 opt(`${d.a}, a fictional ${d.category}, aims to ${d.goal}.`,'type-and-purpose'),
 opt(`${d.a} was introduced in ${d.yearA}.`,'single-date'),
 opt(`${d.a} had ${d.nA} pilot users.`,'single-pilot-count'),
 opt(`${d.b} ${d.mb}.`,'other-project-method'),
],`An introduction with the specified information needs both the category “${d.category}” and the purpose “${d.goal}.” A date or count alone does not tell unfamiliar readers what ${d.a} is for; the final option describes the other project.`))
add('compare-pilot-sizes','Rhetorical Synthesis','medium',d=>synthesis(d,'compare how many users participated in the two pilots','pilot-comparison',[
 opt(`${d.a} had ${d.nA} pilot users, while ${d.b} had ${d.nB}, a difference of ${d.nB-d.nA}.`,'pilot-comparison',()=>d.nA+(d.nB-d.nA)===d.nB),
 opt(`${d.a} was introduced before ${d.b}.`,'chronology',()=>d.yearA<d.yearB),
 opt(`Both projects aim to ${d.goal}.`,'shared-purpose'),
 opt(`${d.b} ${d.mb} to ${d.rb}.`,'method-and-rationale'),
],`Only the correct option compares participation in both pilots and gives the accurate difference, ${d.nB}−${d.nA}=${d.nB-d.nA}. Chronology, shared purpose, and design rationale do not answer the numerical goal.`))
add('chronological-order','Rhetorical Synthesis','easy',d=>synthesis(d,'state the order in which both projects were introduced','chronology',[
 opt(`${d.a} was introduced in ${d.yearA}, followed by ${d.b} in ${d.yearB}.`,'chronology',()=>d.yearA<d.yearB),
 opt(`${d.a} had ${d.nA} pilot users.`,'single-pilot-count'),
 opt(`${d.b} ${d.mb}.`,'single-method'),
 opt(`Both are fictional ${d.category}s.`,'shared-type'),
],`The goal requires both projects’ positions in a sequence. The dates place ${d.a} first and ${d.b} later. Counts, methods, and a shared category do not state that order.`))
add('explain-a-design-rationale','Rhetorical Synthesis','hard',d=>synthesis(d,`explain how ${d.a}'s method is intended to help its users`,'a-method-and-rationale',[
 opt(`${d.a} ${d.ma} to ${d.ra}.`,'a-method-and-rationale'),
 opt(`${d.b} ${d.mb} to ${d.rb}.`,'b-method-and-rationale'),
 opt(`${d.a} was introduced in ${d.yearA}.`,'single-date'),
 opt(`Both projects aim to ${d.goal}.`,'shared-purpose'),
],`The correct choice links ${d.a}'s specific method to its stated intended benefit. The other project’s rationale, an introduction date, or a broad shared goal omits part of the requested explanation.`))
add('identify-b-method','Rhetorical Synthesis','medium',d=>synthesis(d,`identify ${d.b}'s specific method for readers who already know the projects' shared purpose`,'b-method',[
 opt(`${d.b} ${d.mb}.`,'b-method'),
 opt(`Both projects aim to ${d.goal}.`,'shared-purpose'),
 opt(`${d.a} ${d.ma}.`,'a-method'),
 opt(`${d.b} had ${d.nB} pilot users.`,'single-pilot-count'),
],`The audience already knows the shared purpose, so the useful addition is ${d.b}'s method, ${d.mb}. Repeating the purpose, naming ${d.a}'s method, or reporting participation does not supply that information.`))
add('limit-pilot-size-inference','Rhetorical Synthesis','hard',d=>synthesis(d,'acknowledge the larger pilot while avoiding an unsupported conclusion about which project worked better','qualified-pilot-comparison',[
 opt(`${d.b}'s pilot involved more users, but participant counts alone do not establish greater effectiveness.`,'qualified-pilot-comparison',()=>d.nB>d.nA),
 opt(`Both projects aim to ${d.goal}.`,'shared-purpose'),
 opt(`${d.a} was introduced in ${d.yearA} and ${d.b} in ${d.yearB}.`,'chronology'),
 opt(`${d.b} ${d.mb} to ${d.rb}.`,'method-and-rationale'),
],`The notes report pilot size, not comparative performance. Only the correct choice both recognizes ${d.b}'s larger participation and states the limit on interpreting that fact. The other statements are true but do not meet both parts of the goal.`))

const transition=(passage,target,choices,explanation)=>({passage,target,options:choices,prompt:'Which choice completes the text with the most logical transition?',explanation})
add('contrasting-methods','Transitions','medium',d=>transition(
 `Two fictional projects share the aim of helping their users: ${d.a} and ${d.b}. ${d.a} ${d.ma}. ${d.b}, ______, takes a different approach: it ${d.mb}.`,
 'contrast',[opt('by contrast','contrast'),opt('therefore','consequence'),opt('for example','example'),opt('in other words','restatement')],
 `The explicit phrase “a different approach” establishes contrast between methods. “By contrast” fits; the second method is not a result, example, or restatement of the first.`))
add('similar-purpose','Transitions','medium',d=>transition(
 `${d.a}, a fictional ${d.category}, aims to ${d.goal}. ______, ${d.b} serves the same broad purpose, although it ${d.mb} rather than using ${d.a}'s approach.`,
 'similarity',[opt('Likewise','similarity'),opt('Consequently','consequence'),opt('Previously','earlier-time'),opt('On the contrary','opposition')],
 `The sentence emphasizes the same broad purpose, so “Likewise” connects similar aims. The different method does not make the shared purpose an opposite claim, an earlier event, or a causal result.`))
add('illustrating-a-general-point','Transitions','easy',d=>transition(
 `Fictional ${d.category}s can pursue a practical goal through specific design choices. ______, ${d.a} ${d.ma} to ${d.ra}. Its method provides one concrete illustration of that broader approach to design.`,
 'example',[opt('For example','example'),opt('Nevertheless','concession'),opt('As a result','consequence'),opt('Earlier','earlier-time')],
 `${d.a}'s method is a specific case illustrating the preceding general statement. “For example” signals that role. There is no opposition, causal result, or past-time contrast.`))
add('inferring-introduction-order','Transitions','medium',d=>transition(
 `In a hypothetical account, ${d.a} was introduced in ${d.yearA}, while ${d.b} was introduced in ${d.yearB}. ______, ${d.a}'s recorded introduction year was ${d.yearB-d.yearA} year${d.yearB-d.yearA===1?'':'s'} earlier than ${d.b}'s.`,
 'conclusion',[opt('Thus','conclusion'),opt('Nonetheless','concession'),opt('For instance','example'),opt('Meanwhile','simultaneity')],
 `The elapsed time follows directly from the dates: ${d.yearB}−${d.yearA}=${d.yearB-d.yearA}. “Thus” introduces that conclusion, rather than an exception, separate example, or simultaneous event.`))
add('consequence-of-pilot-counts','Transitions','medium',d=>transition(
 `${d.a}'s fictional pilot involved ${d.nA} users, and ${d.b}'s involved ${d.nB}. Every user submitted exactly one completed questionnaire. ______, ${d.b}'s pilot produced more completed questionnaires than ${d.a}'s.`,
 'consequence',[opt('Consequently','consequence'),opt('Nevertheless','concession'),opt('For example','example'),opt('Conversely','reversal')],
 `With one questionnaire per user, the larger pilot necessarily produces more questionnaires. “Consequently” expresses that implication. The result is not an exception to or reversal of the stated counts.`))
add('later-event-sequence','Transitions','easy',d=>transition(
 `The fictional project ${d.a} was introduced in ${d.yearA}; ${d.b} followed in ${d.yearB}. ______, in ${d.yearB+1}, a report described both projects and compared their methods for the first time.`,
 'later-time',[opt('Later','later-time'),opt('Beforehand','earlier-time'),opt('Conversely','reversal'),opt('Similarly','similarity')],
 `The report’s year, ${d.yearB+1}, comes after both introduction dates. “Later” accurately marks the sequence. The other transitions reverse time or assert an unrelated logical relation.`))
add('concession-to-cost','Transitions','hard',d=>transition(
 `In a hypothetical planning exercise, the budget was limited, and testing ${d.a} required expensive equipment. ______, the team chose to test its approach because the project ${d.ma} to ${d.ra}.`,
 'concession',[opt('Nevertheless','concession'),opt('For that reason alone','cost-as-sole-cause'),opt('Similarly','similarity'),opt('For example','example')],
 `The team proceeds despite a cost obstacle because of a different, stated benefit. “Nevertheless” captures that concession. The cost is not the sole reason to proceed, and the sentence does not present a similar case or an example of the obstacle.`))
add('restating-design-purpose','Transitions','hard',d=>transition(
 `${d.a}, a fictional ${d.category}, ${d.ma} to ${d.ra}. ______, the team values the feature for its intended practical effect, rather than merely for its presence in the design.`,
 'restatement',[opt('In other words','restatement'),opt('On the contrary','opposition'),opt('For example','example'),opt('Previously','earlier-time')],
 `The second sentence reformulates the first sentence’s method-and-purpose connection at a more general level. “In other words” marks that restatement. It is not an opposing claim, a new concrete example, or an earlier event.`))

for(const file of readdirSync(dir).filter(f=>f.endsWith('.json')&&f!=='generated-rw-expression.json'))for(const q of JSON.parse(readFileSync(join(dir,file),'utf8')))seen.add(`${q.passage??''}\n${q.prompt}`.replace(/\s+/g,' ').trim())
for(const [fi,family] of families.entries()) {
 const start=questions.length
 for(const d of data) {
  assert(d.yearA<d.yearB&&d.nA<d.nB)
  const row=family.make(d),matches=row.options.map(o=>o.target===row.target)
  assert(row.options.every(o=>o.verify()),`${family.key}/${d.index}: factual/numeric option check failed`)
  assert.equal(matches.filter(Boolean).length,1)
  assert.equal(new Set(row.options.map(o=>o.text)).size,4)
  const words=row.passage.trim().split(/\s+/).length;assert(words>=25&&words<=150,`${family.key}/${d.index}: ${words} words`)
  const key=`${row.passage}\n${row.prompt}`.replace(/\s+/g,' ').trim();assert(!seen.has(key),`${family.key}/${d.index}: repeated stimulus`);seen.add(key)
  const correct=row.options[matches.indexOf(true)].text,choices=row.options.filter((_,i)=>!matches[i]).map(o=>o.text),answer=(fi+d.index)%4;choices.splice(answer,0,correct)
  questions.push({id:`rw-gen-expression-${family.key}-${String(d.index+1).padStart(3,'0')}`,section:'rw',domain:'Expression of Ideas',skill:family.skill,difficulty:family.difficulty,passage:row.passage,prompt:row.prompt,choices,answer,explanation:row.explanation})
 }
 report.push({family:family.key,skill:family.skill,difficulty:family.difficulty,questions:questions.length-start})
}
assert.equal(questions.length,512)
const save=(path,value)=>{const text=JSON.stringify(value,null,2)+'\n';if(check)assert.equal(readFileSync(path,'utf8'),text);else writeFileSync(path,text)}
save(join(dir,'generated-rw-expression.json'),questions)
save(join(root,'docs/expression-generation-report.json'),{provenance:'Original structured practice: 16 task patterns applied to 32 fictional project comparisons. Construction/relevance tags and numerical facts are checked; not independent natural-language certification.',contexts:data.length,total:questions.length,families:report})
console.log(`${check?'Verified':'Generated'} ${questions.length} Expression of Ideas variants: ${families.length} task patterns across ${data.length} original paired-project contexts.`)
