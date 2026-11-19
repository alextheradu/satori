import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'

const excerpts=JSON.parse(readFileSync(new URL('./public-domain-passages.json',import.meta.url),'utf8'))
const sources=new Map(excerpts.map(row=>[row.id,row]))
export const readingPublicDomain=[]
const used=new Set()
function add(id,skill,difficulty,context,prompt,correct,wrong,explanation,underline) {
 const source=sources.get(id)
 assert(source,id);assert(!used.has(id),`${id}: reused excerpt`);used.add(id)
 assert.equal(createHash('sha256').update(source.text).digest('hex'),source.textSha256,id)
 let text=source.text
 if(underline){assert(text.includes(underline),id);text=text.replace(underline,`_${underline}_`)}
 const passage=`The following text is adapted from ${source.author}’s ${source.title}.${context?` ${context}`:''}\n\n${text}`
 readingPublicDomain.push({source,skill,difficulty,passage,prompt,correct,wrong,explanation})
}
const vocab=(id,d,context,word,c,w,e)=>add(id,'Words in Context',d,context,'As used in the text, what does the underlined word most nearly mean?',c,w,e,word)
const central=(id,d,context,c,w,e)=>add(id,'Central Ideas and Details',d,context,'Which choice best states the main idea of the text?',c,w,e)
const infer=(id,d,context,c,w,e)=>add(id,'Inferences',d,context,'Which choice is most logically supported by the text?',c,w,e)
const structure=(id,d,context,prompt,c,w,e)=>add(id,'Text Structure and Purpose',d,context,prompt,c,w,e)

structure('pd-persuasion-01','hard','','Which choice best describes Mr. Shepherd’s behavior as presented in the text?',
 'He leaves difficult advice to someone whose recommendations he expects to support his own aims.',
 ['He challenges Lady Russell’s judgment because her advice conflicts with his plans.','He volunteers to deliver unwelcome advice so that Lady Russell can avoid doing so.','He withholds advice because he believes that no practical measures are available.'],
 'Shepherd would rather have someone else introduce the disagreeable subject, yet expects Lady Russell to advise the resolute measures he wants adopted. He delegates the uncomfortable task rather than opposing her judgment or abandoning a solution.')
vocab('pd-persuasion-02','medium','Sir Walter Elliot is reacting to proposed reductions in his household expenses.','contractions',
 'Reductions',['Agreements','Recoveries','Concealments'],
 'The surrounding complaints concern comforts being removed and restrictions on spending. Contractions therefore means reductions, rather than agreements or improvements in finances.')
central('pd-persuasion-03','medium','',
 'Lady Russell believes that spending time in Bath would benefit her young friend, with summer visits elsewhere addressing concerns about health.',
 ['Lady Russell thinks that her young friend should avoid society and remain permanently at Kellynch Lodge.','Lady Russell fears that Bath would worsen her young friend’s spirits even if it improved her health.','Lady Russell plans to abandon Bath because it offers too few opportunities to meet people.'],
 'Lady Russell favors Bath, thinks a larger society would improve Anne’s spirits, and sees warm-month visits to Kellynch Lodge as a way to avoid health risks. None of the alternatives reflects that combined plan.')
infer('pd-persuasion-04','medium','Mr. Shepherd is discussing the possibility of renting Sir Walter Elliot’s home.',
 'Mr. Shepherd regards the arrival of peace as an opportunity to find a financially suitable tenant.',
 ['Mr. Shepherd believes that naval officers will be unable to afford homes after the war.','Mr. Shepherd expects Sir Walter to join the navy in order to increase his income.','Mr. Shepherd thinks that peace will eliminate the demand for rented homes.'],
 'Shepherd connects peace with wealthy officers coming ashore and needing homes. His description of responsible tenants and fortunes made during the war supports a favorable rental opportunity.')
vocab('pd-persuasion-05','medium','Sir Walter Elliot is considering the possibility of renting his home, Kellynch Hall, to a wealthy admiral.','prize',
 'Valued acquisition',['Monetary fine','Official rank','Contest participant'],
 'Calling Kellynch Hall a prize praises it as something desirable for the admiral to obtain. The reference to prizes taken earlier also plays on naval captures, but the house is neither a rank nor a participant in a contest.')
structure('pd-persuasion-06','medium','Anne Elliot is speaking about whether naval officers deserve comfortable homes.','Which choice best describes the main purpose of the text?',
 'To argue that sailors’ service and labor entitle them to the same domestic comforts as other people',
 ['To explain why sailors should receive fewer comforts than people in other occupations','To describe the design features that distinguish naval housing from other homes','To claim that sailors work only when they are promised unusually luxurious homes'],
 'The speaker explicitly asserts an equal claim to comforts and privileges, citing the navy’s service and sailors’ hard work. No house design or special condition for working is discussed.')
infer('pd-persuasion-07','hard','Sir Walter Elliot is responding to the prospect of his daughter’s marriage.',
 'Sir Walter communicates strong disapproval without explicitly refusing to allow the marriage.',
 ['Sir Walter enthusiastically supports the marriage but conceals that support from Lady Russell.','Sir Walter formally forbids the marriage while promising substantial financial help.','Sir Walter remains undecided because he has not yet formed an opinion of the alliance.'],
 'Although he does not withhold consent or say the marriage can never occur, his coldness, silence, and refusal to do anything for his daughter convey opposition. His stated view that the alliance is degrading rules out indecision or hidden enthusiasm.')
central('pd-persuasion-08','hard','',
 'As Anne grows older, she comes to favor hopeful attachment over the excessive caution imposed on her when she was young.',
 ['Anne’s increasing age causes her to distrust the romantic hopes she freely pursued in her youth.','Anne concludes that both prudence and romance are equally impossible at every stage of life.','Anne wishes that others would exercise stricter control over her future choices.'],
 'The text places Anne’s wishes on the side of warm attachment and confidence, against overanxious caution. Its final sentence explicitly contrasts enforced youthful prudence with the romance she learns later.')

central('pd-expectations-01','easy','The narrator recalls his early childhood.',
 'The narrator’s childhood difficulty pronouncing his names produced the nickname by which he became known.',
 ['The narrator adopted a nickname to conceal his family’s identity from strangers.','The narrator’s family chose his names to honor a relative called Pip.','The narrator abandoned his nickname once he learned to pronounce his full name.'],
 'The narrator says his infant speech could produce only Pip from Pirrip and Philip, so he called himself Pip and others did too. There is no secrecy, namesake, or later abandonment of the name.')
structure('pd-expectations-02','medium','','Which choice best describes how the text presents the man?',
 'It accumulates physical details that suggest both the man’s harsh experiences and his threatening presence.',
 ['It contrasts the man’s elegant clothing with his unusually polite conversation.','It provides a chronological account explaining why the man first entered the area.','It argues that the man’s alarming appearance is entirely a deliberate disguise.'],
 'Broken shoes, wounds, mud, and shivering indicate hardship, while glaring, growling, and seizing the narrator’s chin convey menace. The text does not explain the man’s arrival or establish a disguise.')
infer('pd-expectations-03','medium','Pip, the narrator, recalls an encounter with a man in a churchyard.',
 'The apparent movement of the church reflects Pip’s disorientation as the man turns him upside down.',
 ['The man knocks the church building over before seating Pip on a tombstone.','Pip imagines the church moving because he has fallen asleep in the churchyard.','The church’s steeple has been removed and placed at Pip’s feet.'],
 'The man turns Pip upside down, and Pip immediately describes seeing the steeple beneath his feet. The apparent motion describes the change in his viewpoint, rather than literal movement of the building or a dream.')
vocab('pd-expectations-04','medium','The narrator describes his sister and her husband, Joe.','mild',
 'Gentle',['Uncertain','Unimportant','Unhealthy'],
 'Mild appears beside good-natured, sweet-tempered, and easygoing, all describing Joe’s disposition. The uncertainty mentioned earlier concerns the color of his eyes, not the meaning of mild.')
infer('pd-expectations-05','medium','Pip is the narrator; Joe is his sister’s husband.',
 'Pip views Joe as an ally with whom shared difficulties encourage private communication.',
 ['Pip regards Joe as a stranger whose intentions he has no reason to trust.','Pip thinks Joe’s work prevents him from ever spending time inside the house.','Pip believes Joe shares secrets primarily to display his authority over him.'],
 'Calling themselves fellow-sufferers and describing confidences arising from that relationship supports mutual trust. Joe is inside the kitchen and shares a confidence, without any suggestion of an assertion of power.')
structure('pd-expectations-06','medium','The narrator approaches someone whom he believes he recognizes.','Which choice best describes the function of the final sentence in the text?',
 'It overturns the narrator’s expectation that he has approached a particular person.',
 ['It confirms that the narrator’s surprise pleased the person exactly as intended.','It explains why the narrator decided to bring breakfast on a different day.','It describes the narrator’s gradual recognition that the person has changed his clothing.'],
 'The narrator expects to please a particular man with breakfast, but the final sentence reveals that the person is another man. That reverses the assumption motivating his approach; it does not confirm a welcome or describe a clothing change.')
vocab('pd-expectations-07','medium','The narrator is watching a man eat on a marsh.','start',
 'Sudden fright',['New beginning','Head start','Signal to depart'],
 'The man repeatedly stops to listen, and a possible sound gives him a start. In this setting the word denotes a sudden alarm, consistent with his distrustful watchfulness, rather than the beginning of an activity.')
central('pd-expectations-08','medium','The narrator describes preparations for a holiday meal.',
 'Extensive preparations for a large dinner lead Mrs. Joe to dispense with a formal breakfast.',
 ['Mrs. Joe prepares an unusually elaborate breakfast to make up for a canceled dinner.','A shortage of food forces the household to postpone all meals until the next day.','The narrator volunteers to cook dinner because Mrs. Joe has completed no preparations.'],
 'The planned dinner includes meat, fowls, pie, and pudding. The narrator explicitly links these extensive arrangements with the curtailed breakfast, and Mrs. Joe complains about the work still before her.')

vocab('pd-antonia-01','medium','The narrator recalls a long journey west through the United States.','dull',
 'Unresponsive',['Poorly illuminated','Sharp-edged','Morally objectionable'],
 'After crossing many rivers, the narrator no longer registers another crossing in memory. Being dull to the rivers means being insufficiently responsive to notice them distinctly, rather than being dimly lit.')
infer('pd-antonia-02','medium','The narrator, Jimmy, has recently arrived at his grandparents’ home.',
 'Waking Jimmy reminds his grandmother of caring for his father when he was a child.',
 ['Jimmy’s grandmother mistakes him for his father throughout their conversation.','Jimmy’s grandmother has never before noticed any resemblance between Jimmy and his father.','Jimmy believes that his father has just arrived and is waiting in the kitchen.'],
 'His grandmother remarks that Jimmy looks like his father, and Jimmy reflects that she must have awakened her own son similarly. She addresses Jimmy by name, so the passage suggests remembered similarity rather than mistaken identity.')
structure('pd-antonia-03','medium','The narrator describes a morning in his grandmother’s kitchen.','Which choice best describes the main purpose of the text?',
 'To evoke a comfortable domestic scene through small observations and a playful interaction',
 ['To argue that a kitchen is an unsuitable place for a child to bathe','To explain the technical steps required to repair a damaged stove','To portray a lasting conflict between the narrator and his grandmother'],
 'Sunlight, the curious cat, and the grandmother’s laughing response develop a pleasant atmosphere. The narrator’s momentary anxiety about the cakes does not become a serious dispute, and the text gives no repair instructions.')
vocab('pd-antonia-04','medium','The narrator is describing part of his grandparents’ house.','wing',
 'Section',['Roof','Staircase','Entrance'],
 'The cellar is under a wing of the house, meaning a section of the building. The text separately mentions a stairway and a door, but neither is what wing denotes.')
central('pd-antonia-05','medium','',
 'The narrator’s grandfather combines restrained affection with an impressive dignity that inspires the narrator’s respect.',
 ['The narrator’s grandfather is openly hostile and refuses to acknowledge his arrival.','The narrator admires his grandfather primarily for his ability to tell entertaining stories.','The narrator finds that his grandfather’s informal manner eliminates any feeling of awe.'],
 'The grandfather kisses the narrator and speaks kindly while remaining undemonstrative. The narrator explicitly feels his dignity and is in awe; the striking beard reinforces the impression rather than replacing that central characterization.')
infer('pd-antonia-06','hard','Otto is discussing purchases made by a newly arrived Bohemian family.',
 'Otto thinks distrust would limit the usefulness of his intervention, despite some possibility of communicating with the family.',
 ['Otto considers the prices fair and sees no reason anyone would wish to intervene.','Otto believes the family is unable to understand any language that he can speak.','Otto has already forced the seller to replace the animals with better ones.'],
 'Otto says the animals were overpriced and notes that the old man understands some German. His conditional statement that he would have interfered if it would help, followed by his comment about distrust, indicates why he refrained. It does not establish a universal fact about the groups he names.')
structure('pd-antonia-07','medium','The narrator’s grandmother is visiting Mrs. Shimerda, who speaks little English.','Which choice best describes the main purpose of the text?',
 'To describe a friendly attempt at communication despite a language difference',
 ['To explain why the grandmother refuses to share the food she has brought','To show that Mrs. Shimerda rejects the visitors’ intentions as hostile','To establish that speaking loudly is necessary whenever people use different languages'],
 'The grandmother conveys the visit’s friendly intention, and Mrs. Shimerda responds with interest, thanks, and a handshake. The narrator’s comparison to deafness makes the grandmother’s loudness an assumption, not a demonstrated requirement for understanding.')
central('pd-antonia-08','medium','The narrator has recently begun riding a pony named Dude.',
 'Learning to ride enables the narrator to perform errands that save the working men time.',
 ['The narrator’s rides prevent him from contributing to the work of the household.','Otto continues to carry every message because the narrator cannot ride independently.','The narrator travels to the post office only when there is a service at the schoolhouse.'],
 'After the first supervised ride, the narrator regularly visits the post office and carries messages. The text explicitly says he saves the men time and that Fuchs formerly did such tasks after work; the preaching notice is one example, not the condition for every ride.')

vocab('pd-innocence-01','medium','A group at the opera awaits Mr. Sillerton Jackson’s reaction to something they have observed.','scrutinised',
 'Examined closely',['Greeted noisily','Dismissed hastily','Praised extravagantly'],
 'Jackson silently studies the attentive group before giving a considered response. Scrutinised refers to close observation, rather than a loud greeting, an immediate dismissal, or praise.')
infer('pd-innocence-02','hard','',
 'A breach of social standards in someone’s clothing can disturb Archer even when he finds that person’s face appealing.',
 ['Archer pays little attention to clothing because he considers taste irrelevant.','Archer concludes that Madame Olenska’s dress is entirely appropriate to the occasion.','Archer believes May Welland’s influence is responsible for Madame Olenska’s clothing.'],
 'The text contrasts the appeal of Madame Olenska’s face with Archer’s shock at her dress. His concern about May being exposed to her influence shows the importance he assigns to social standards; it does not attribute her dress to May.')
structure('pd-innocence-03','medium','','Which choice best describes the main purpose of the text?',
 'To explain how Mrs. Beaufort’s opera attendance displays her freedom from the practical demands of hosting',
 ['To show that Mrs. Beaufort’s servants are incapable of preparing a ball without her supervision','To explain why Mrs. Beaufort has decided to stop giving an annual ball','To contrast Mrs. Beaufort’s dislike of the opera with her guests’ enthusiasm for it'],
 'The text explicitly states that scheduling the ball on an opera night emphasizes her superiority to household cares and her competent servants. It does not suggest that she supervises them from home, cancels the ball, or dislikes opera.')
central('pd-innocence-04','hard','',
 'Despite Beaufort’s social and professional success, uncertainty about his background and concern about his character cause misgivings.',
 ['Beaufort’s inability to obtain introductions prevents him from entering society or business.','Everyone regards Beaufort’s impeccable behavior as proof that his background requires no scrutiny.','Beaufort’s only obstacle to acceptance is that his English relatives refuse to recommend him.'],
 'Recommendations help Beaufort become important in business, and he is agreeable and hospitable. The passage then contrasts those advantages with dissipated habits, a bitter tongue, and mysterious antecedents, culminating in concern about the engagement.')
vocab('pd-innocence-05','medium','Mrs. Beaufort holds an annual ball after attending the opera.','meant',
 'Signaled',['Intended','Required','Caused'],
 'Mrs. Beaufort’s departure tells observers that the ball will begin in half an hour. Here meant concerns what her departure signifies to New York society, rather than a personal intention or a rule requiring the event.')
structure('pd-innocence-06','hard','The narrator describes the approach to a ballroom.','Which choice best describes the function of the room-by-room description in the text?',
 'It emphasizes the house’s grand arrangement and the lavish view available to arriving guests.',
 ['It suggests that guests cannot distinguish the ballroom from a cramped passageway.','It traces the household’s gradual decision to replace expensive decoration with plain furniture.','It explains how each room was converted from a place of work into a living space.'],
 'The extended view through colored drawing rooms, reflected lights, and costly foliage presents a deliberately impressive approach. The narrow passage belongs to the contrasting example at the Chiverses, not to this house.')
central('pd-innocence-07','medium','Newland Archer and May Welland have become engaged.',
 'A precise social ritual determines the sequence of visits following the engagement.',
 ['Newland and May invent a sequence of visits in order to reject New York conventions.','Newland refuses to visit May’s family until they have visited his home first.','The relatives leave all arrangements to chance because betrothal visits are considered unimportant.'],
 'The narrator calls the ritual precise and inflexible and says that Newland follows it in making the visits. The ordered calls illustrate conformity, rather than improvisation, refusal, or indifference.')
infer('pd-innocence-08','medium','Mrs. Welland suggests delaying a wedding; the older Mrs. Mingott responds.',
 'Mrs. Mingott considers further acquaintance an unnecessary reason for delaying the wedding because the families already know one another.',
 ['Mrs. Mingott favors postponement until the couple has lived outside New York.','Mrs. Mingott believes the couple has met too recently for their families to approve a marriage.','Mrs. Mingott agrees with Mrs. Welland that there is no reason to arrange the wedding soon.'],
 'Mrs. Mingott answers the appeal for more time by saying everyone in New York has always known everyone. Her requests to marry before Lent and hold the wedding breakfast while she is well reinforce her preference for proceeding promptly.')

assert.equal(readingPublicDomain.length,32)
assert.equal(used.size,readingPublicDomain.length)
assert.equal(new Set(excerpts.map(row=>row.text)).size,excerpts.length)
