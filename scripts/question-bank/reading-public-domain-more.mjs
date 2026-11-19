import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'

const sources=new Map(JSON.parse(readFileSync(new URL('./public-domain-passages.json',import.meta.url),'utf8')).map(row=>[row.id,row]))
export const readingPublicDomainMore=[]
const used=new Set()
function add(id,skill,difficulty,context,prompt,correct,wrong,explanation,underline){
 const source=sources.get(id);assert(source,id);assert(!used.has(id),id);used.add(id)
 assert.equal(createHash('sha256').update(source.text).digest('hex'),source.textSha256,id)
 let text=source.text
 if(underline){assert(text.includes(underline),id);text=text.replace(underline,`_${underline}_`)}
 readingPublicDomainMore.push({source,skill,difficulty,passage:`The following text is adapted from ${source.author}’s ${source.title}.${context?` ${context}`:''}\n\n${text}`,prompt,correct,wrong,explanation})
}
const vocab=(id,d,context,word,c,w,e)=>add(id,'Words in Context',d,context,'As used in the text, what does the underlined word most nearly mean?',c,w,e,word)
const central=(id,d,context,c,w,e)=>add(id,'Central Ideas and Details',d,context,'Which choice best states the main idea of the text?',c,w,e)
const infer=(id,d,context,c,w,e)=>add(id,'Inferences',d,context,'Which choice is most logically supported by the text?',c,w,e)
const structure=(id,d,context,prompt,c,w,e)=>add(id,'Text Structure and Purpose',d,context,prompt,c,w,e)

structure('pd-persuasion-09','hard','','Which choice best describes the effect of repeating “most natural” in the text?',
 'It draws attention to Anne’s opposing responses before and after the visit.',
 ['It establishes that Anne has consistently wanted to meet the visitors immediately.','It explains why Lady Russell has forbidden Anne to walk outside.','It indicates that the narrator considers the visitors’ conduct unusually rude.'],
 'Anne first finds avoiding the visit natural and then finds regretting that avoidance natural. Repetition places those contradictory impulses together; it does not describe an unchanging wish or anyone else’s prohibition.')
central('pd-persuasion-10','medium','Anne Elliot considers a stay with her sister Mary and Mary’s family.',
 'Anne expects sources of companionship and useful activity to make the stay comfortable despite Mary’s shortcomings.',
 ['Anne fears that every member of Mary’s household will prevent her from enjoying the stay.','Anne regards the children as an obstacle to any worthwhile activity.','Anne prefers Elizabeth’s company because Elizabeth is more receptive to her influence.'],
 'The text explicitly says Anne has no dread of the stay, notes friendly relations with her brother-in-law, and identifies interest and useful exertion in caring for the children. It presents Mary as less difficult than Elizabeth, not the reverse.')
infer('pd-persuasion-11','medium','Charles Musgrove and his wife, Mary, have a child who is recovering.',
 'The child’s apparent improvement does not remove Mary’s objection to Charles leaving.',
 ['Mary encourages Charles to leave as soon as he describes the child’s recovery.','Charles intends to stay away for several days without returning home.','Charles says that he has no interest in meeting Captain Wentworth.'],
 'Charles cites the child’s progress and proposes a limited visit, but his wife eagerly opposes it and worries that something might happen. Her objection persists despite the favorable report.')
vocab('pd-persuasion-12','medium','Anne Elliot is the aunt mentioned in the text.','pretence',
 'Excuse',['Treatment','Prediction','Announcement'],
 'The child’s condition had supplied a reason Anne could use to absent herself from gatherings. Once that reason no longer applies, the repeated meetings begin. Pretence therefore means an excuse or pretext for avoiding them.')

vocab('pd-expectations-09','hard','The narrator recalls soldiers arriving at his family’s home.','apparition',
 'Sudden appearance',['Formal complaint','Official instruction','Concealed identity'],
 'The soldiers physically arrive on the doorstep, surprising the dinner party. Apparition describes their unexpected appearance here; it does not turn the sergeant’s arrival into a written order or identify a disguise.')
infer('pd-expectations-10','hard','The narrator reflects on his response after being cleared of blame for a theft.',
 'He admits failing to speak openly but hopes his state of mind was not entirely without good.',
 ['He claims to have given a complete and candid account as soon as he was cleared.','He insists that nothing about his response deserves moral reflection.','He states that he expected to be cleared and had planned every detail of that outcome.'],
 'The narrator acknowledges that his state of mind did not lead to frank disclosure, then qualifies that admission with a hope that some good remained. Neither a full confession nor certainty about his own innocence or planning is asserted.')
central('pd-expectations-11','medium','The narrator recalls learning basic literacy and arithmetic.',
 'With effort and some help, the narrator makes limited progress in skills he initially finds difficult.',
 ['The narrator finds letters and numbers immediately easy to recognize.','Mr. Wopsle’s great-aunt supplies all the help the narrator needs.','The narrator gives up every attempt to learn after finding the alphabet difficult.'],
 'The bramble-bush and disguised-thieves comparisons convey difficulty, while the final sentence records eventual, modest progress. Biddy contributes more help than the great-aunt, and the narrator does not abandon the work.')
structure('pd-expectations-12','hard','Pip, the narrator, describes Mr. Pumblechook’s departure after a young lady refuses to admit him.','What is the main effect of the narrator’s imagining that Mr. Pumblechook might return?',
 'It conveys anxiety that lingers even after Mr. Pumblechook has departed.',
 ['It confirms that Mr. Pumblechook actually returns and questions the narrator again.','It shows that the narrator is eager to invite Mr. Pumblechook back.','It explains how Mr. Pumblechook repairs the gate before leaving.'],
 'The narrator explicitly describes apprehension about a possible return, then says it did not occur. The imagined question extends the sense of unease without reporting a real return or a wish for one.')

central('pd-antonia-09','medium','',
 'The girls retain their cheerfulness and readiness for recreation despite difficulties at home.',
 ['The girls refuse to leave home because the prairie frightens them.','The narrator believes the neighbors’ lives are easy and free of trouble.','The girls complain continuously during every outing with the narrator.'],
 'The text contrasts known hardship with the girls’ lightheartedness, lack of complaints, and willingness to join the narrator outside. It neither denies the hardship nor portrays the outings as unwelcome.')
structure('pd-antonia-10','medium','','Which choice best describes the main purpose of the text?',
 'To establish a pleasant setting while drawing attention to signs of approaching winter',
 ['To explain why the narrator has stopped all reading lessons','To argue that winter has already destroyed every plant on the prairie','To describe a badger’s method of storing food'],
 'Warm grass and amber sunlight establish an appealing afternoon, while the shiver of winter, morning ice, and collapsed asparagus mark seasonal change. The passage does not cancel the lesson or discuss the badger’s behavior.')
infer('pd-antonia-11','hard','',
 'The narrator can like Ántonia while resenting the unequal standing he feels in their relationship.',
 ['The narrator refuses to acknowledge any difference in their ages or experience.','The narrator’s dislike of every aspect of Ántonia prevents them from having adventures together.','Ántonia becomes steadily more protective and less willing to defer to the narrator.'],
 'He begins by affirming his liking while objecting to her superior, protecting manner. His account of her later treating him more like an equal supports concern about their relative standing, not complete dislike or increasing subordination.')
vocab('pd-antonia-12','medium','The narrator is visiting a sick neighbor.','emaciated',
 'Very thin',['Unusually broad','Well protected','Brightly illuminated'],
 'Emaciated describes the man’s wasted physical condition. His difficult breathing and coughing reinforce the portrayal of illness; the word concerns thinness rather than lighting, protection, or breadth.')

structure('pd-innocence-09','hard','','What is the main purpose of comparing Mr. Jackson to a collector and a naturalist?',
 'To characterize his gathering of social information as patient and systematic',
 ['To establish that he studies plants professionally and avoids other people','To explain why he refuses all information supplied by his sister','To show that Mrs. Archer has no interest in learning about society'],
 'The comparison applies a collector’s patience and a naturalist’s method to investigating friends’ affairs. His sister fills gaps in that social picture, and Mrs. Archer wants to be informed despite avoiding society herself.')
central('pd-innocence-10','medium','',
 'Archer returns to a familiar, carefully maintained study that feels welcoming.',
 ['Archer finds that his study has been abandoned and its books removed.','Archer reluctantly enters a room whose unfamiliar contents alarm him.','The household has extinguished the study’s fire and lamp to discourage his return.'],
 'The maintained fire and lamp, familiar decorative objects, and explicit description of the room as homelike and welcoming support the main idea. Nothing suggests abandonment, unfamiliarity, or a hostile preparation.')
vocab('pd-innocence-11','hard','','clemency',
 'Leniency',['Secrecy','Indifference','Severity'],
 'Mrs. van der Luyden initially appears inclined toward a favorable, merciful response rather than an outright refusal. Clemency names that apparent leniency, although her habitual reply defers the decision to consultation with her husband.')
infer('pd-innocence-12','medium','',
 'The Countess appears composed in a setting about which Archer feels anxious on her behalf.',
 ['Archer has no concern about how the Countess will behave at the dinner.','The Countess rushes in before any of the other guests have arrived.','The Countess’s visible embarrassment confirms Archer’s worst expectations.'],
 'Archer wonders nervously how she will manage the occasion, but she enters without haste or embarrassment. The contrast supports outward composure rather than an assertion about her private feelings.')

assert.equal(readingPublicDomainMore.length,16)
