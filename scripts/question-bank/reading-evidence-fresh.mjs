import assert from 'node:assert/strict'

export const readingEvidenceFresh=[]
const quote=text=>`“${text}”`
const evidence=(difficulty,text,claim,correct,wrong,explanation,poem=false)=>{
 for(const choice of [correct,...wrong])assert(text.includes(choice),'Evidence choice must quote the passage exactly')
 readingEvidenceFresh.push({skill:'Command of Evidence (Textual)',difficulty,
  passage:`The following text is ${poem?'an original poem':'from an original short story'}.\n\n${text}`,
  prompt:`Which quotation from the text most effectively supports the idea that ${claim}?`,correct:quote(correct),wrong:wrong.map(quote),explanation})
}
const cross=(difficulty,context,first,second,prompt,correct,wrong,explanation)=>readingEvidenceFresh.push({skill:'Cross-Text Connections',difficulty,
 passage:`The following texts describe ${context}.\n\n**Text 1**\n${first}\n\n**Text 2**\n${second}`,prompt,correct,wrong,explanation})

evidence('medium',
 'Miri listened while the visiting violinist described a roughness in her final phrase. She said nothing until he had put the score away. Outside, her friends complained that he had praised almost no one. She copied his comment beside the next morning’s practice plan. The tram arrived, and she closed the notebook carefully before stepping aboard.',
 'Miri treats the violinist’s criticism as useful guidance',
 'She copied his comment beside the next morning’s practice plan.',
 ['She said nothing until he had put the score away.','Outside, her friends complained that he had praised almost no one.','The tram arrived, and she closed the notebook carefully before stepping aboard.'],
 'Placing the comment in her practice plan shows that Miri intends to use it in further work. Her silence alone does not reveal her response, and the friends’ complaint describes their attitude rather than hers.')
evidence('medium',
 'Tomas reached the footbridge just after the repair crew had left. Fresh boards shone among the older planks. Several walkers crossed without slowing, and a bicycle rattled over the far end. Before taking the loaded cart across, he asked whether the old weight limit still applied. Only after reading the inspector’s notice did he turn the cart toward the bridge.',
 'Tomas checks whether the bridge is suitable for his intended use instead of relying only on appearances',
 'Before taking the loaded cart across, he asked whether the old weight limit still applied.',
 ['Fresh boards shone among the older planks.','Several walkers crossed without slowing, and a bicycle rattled over the far end.','Tomas reached the footbridge just after the repair crew had left.'],
 'The question about a weight limit concerns the loaded cart, his particular use of the bridge. New boards and other people crossing provide visual impressions, but do not establish that the cart’s load is permitted.')
evidence('hard',
 'Orla’s grandmother said the cup had belonged to a queen. The museum’s purchase book named only a local dealer, and no earlier record had survived. Orla did not remove the family story from the display. She placed it on a separate card headed Family Tradition, beside the card describing the documented purchase. Visitors could read both without being asked to mistake one kind of account for the other.',
 'Orla preserves an inherited account while distinguishing it from documented history',
 'She placed it on a separate card headed Family Tradition, beside the card describing the documented purchase.',
 ['Orla’s grandmother said the cup had belonged to a queen.','The museum’s purchase book named only a local dealer, and no earlier record had survived.','Orla did not remove the family story from the display.'],
 'The separate, differently identified cards establish both preservation and a distinction in evidentiary status. Merely retaining the story supports preservation but does not by itself show how Orla distinguishes it from the purchase record.')
evidence('medium',
 'Sami had insisted that he could pack the parcel himself. Twice the cord slipped while he pressed the springing lid with one elbow. Inez waited by the doorway without offering advice. He finally asked Inez to hold the box while he tied the cord. Once the knot was secure, he carried the parcel out with a newly careful expression.',
 'Sami eventually accepts assistance with a task he initially intended to complete alone',
 'He finally asked Inez to hold the box while he tied the cord.',
 ['Sami had insisted that he could pack the parcel himself.','Twice the cord slipped while he pressed the springing lid with one elbow.','Inez waited by the doorway without offering advice.'],
 'Sami’s request directly shows his change from insisting on doing everything himself to accepting a specific form of help. The other quotations establish the earlier intention, the difficulty, and Inez’s restraint.')
evidence('hard',
 'The ferry bell has ceased beyond the rain.\nThe notice says no boats will come tonight.\nI fold the empty cloth beside the door\nand draw the curtain from the harbor light.\nStill I set a lamp against the pane.\nIts small reflection trembles on the floor.\nI cannot hear a footstep on the quay;\nthe lamp keeps room for one arrival more.',
 'the speaker maintains an act of welcome despite the absence of an expected arrival',
 'Still I set a lamp against the pane.',
 ['The notice says no boats will come tonight.','I fold the empty cloth beside the door','I cannot hear a footstep on the quay;'],
 'Setting the lamp is an action that continues despite the cancellation and lack of footsteps. The final image links it to room for an arrival. The notice and silence establish the absence rather than the continuing welcome.',true)
evidence('hard',
 'At dawn I wrote: the garden has turned white.\nThe frost had made a country of the glass.\nAt noon the pane is clear; the grass is green.\nI cross the sentence out and let it pass.\nI leave the first crossed sentence where it lies.\nThe page need not pretend I always knew\nwhich white belonged to window, which to field:\nmy later words can keep the earlier view.',
 'the speaker preserves a record of an interpretation that has been revised',
 'I leave the first crossed sentence where it lies.',
 ['The frost had made a country of the glass.','At noon the pane is clear; the grass is green.','At dawn I wrote: the garden has turned white.'],
 'Leaving the crossed sentence on the page preserves evidence of the earlier interpretation after correction. The other lines describe either the misleading appearance, the new observation, or the initial statement without indicating its retention.',true)
evidence('medium',
 'The audience began applauding before Ren had reached the last slide. The chair thanked her for designing the entire exhibit. Ren reopened the slide naming Lu and Mateo and explained which sections each had built. The chair leaned forward to read the names. Only then did Ren switch off the projector and gather the loose pages from the lectern.',
 'Ren actively corrects an impression that she alone deserves credit for the exhibit',
 'Ren reopened the slide naming Lu and Mateo and explained which sections each had built.',
 ['The audience began applauding before Ren had reached the last slide.','The chair thanked her for designing the entire exhibit.','The chair leaned forward to read the names.'],
 'Ren identifies the others and specifies their contributions, correcting the chair’s attribution of the entire exhibit to her. The chair’s thanks creates the mistaken impression, while the other quotations describe the audience’s or chair’s actions.')
evidence('medium',
 'The traveler gave Bina no answer when she offered supper. She set down the tray more sharply than she intended. Later she found him asleep on the bench, still wearing his wet coat, with the untouched letter open in his hand. By morning she understood his silence as weariness rather than contempt. She warmed the bread again before he woke.',
 'Bina revises her interpretation of the traveler’s earlier behavior',
 'By morning she understood his silence as weariness rather than contempt.',
 ['The traveler gave Bina no answer when she offered supper.','She set down the tray more sharply than she intended.','She warmed the bread again before he woke.'],
 'The contrast between weariness and contempt explicitly states the change in Bina’s interpretation. Warming the bread is consistent with a kinder response, but does not alone identify what she has reconsidered.')

cross('hard','a hypothetical archaeological investigation',
 'An ash layer directly beneath a paved courtyard has the chemical signature of a known volcanic eruption. Because the ash is below the paving, an archaeologist concludes that the courtyard was built within a year or two of that eruption.',
 'The ash grains beneath the courtyard are rounded and sorted into channels. These features indicate that water transported them there after their initial fall. Ash from an eruption can be carried to a new location many years later, so its origin does not by itself closely date the paving.',
 'Based on the texts, the author of Text 2 would most directly question which assumption in Text 1?',
 'The ash reached the courtyard site at approximately the time of the eruption.',
 ['The ash lies beneath the courtyard paving.','An eruption can produce ash with an identifiable chemical signature.','Water can transport material that was originally deposited elsewhere.'],
 'Text 2 distinguishes the eruption date from the later arrival of reworked ash at the site. That distinction challenges the tight construction date, while leaving the ash’s chemical identification and position beneath the paving intact.')
cross('hard','a hypothetical manuscript study',
 'Two unsigned manuscripts use many of the same uncommon technical terms. A scholar takes that similarity as strong evidence that a single person wrote both works. The terms, the scholar argues, are too unusual to have been shared by unrelated writers.',
 'A survey of manuscripts from the same workshop finds those technical terms throughout texts written by several identified authors. The two unsigned works also differ consistently in small grammatical preferences, including their use of conjunctions. Workshop vocabulary may therefore be less useful for distinguishing authors than the first scholar assumes.',
 'Which choice best describes the relationship between the texts?',
 'Text 2 challenges the distinctiveness of the evidence on which Text 1 relies.',
 ['Text 2 confirms that technical vocabulary must uniquely identify an individual writer.','Text 2 rejects the claim that the two unsigned manuscripts contain similar terms.','Text 2 establishes that no writer can use more than one grammatical construction.'],
 'Text 2 accepts the vocabulary similarity but shows that it is shared by multiple workshop authors. It thereby weakens the claim that the terms are distinctive evidence of one author; it does not prove a universal rule about grammatical variation.')
cross('hard','a hypothetical study of a historical theater',
 'Tickets for the upper side boxes cost more than seats near the stage. A historian argues that the boxes must have offered the best sound: high prices, she reasons, reveal which seats audiences considered acoustically superior.',
 'Letters from regular patrons praise the expensive boxes for their view of the royal box and their visibility to other guests. Several complain that words sung onstage were difficult to distinguish there. These accounts suggest that social visibility could outweigh acoustic quality in determining a seat’s desirability.',
 'How would the author of Text 2 most likely respond to the argument in Text 1?',
 'Ticket prices may reflect advantages other than sound quality, so they are insufficient evidence for the proposed acoustic ranking.',
 ['The letters demonstrate that the expensive boxes always had the clearest sound.','A seat’s social visibility can matter only when every seat has identical acoustics.','The location of the royal box makes information about historical ticket prices irrelevant to every question.'],
 'The letters identify a competing reason to pay more and even describe poor sound in the boxes. They challenge the inference from price to acoustic superiority without rendering prices irrelevant to all historical questions.')
cross('medium','a hypothetical flower-choice experiment',
 'Researchers photograph two flower varieties with an ordinary camera. Their visible petal colors look nearly identical, but bees visit one variety more frequently. A researcher concludes that the bees’ preference cannot depend on differences in the petals’ appearance.',
 'Images made with equipment sensitive to ultraviolet light reveal different petal patterns in the two varieties. In a controlled test, bees change their choices when those patterns are masked, even though the visible colors remain unchanged.',
 'Based on the texts, what would the author of Text 2 most likely point out about the conclusion in Text 1?',
 'The camera images omit an aspect of the petals’ appearance that can influence the bees’ choices.',
 ['The bees must be unable to perceive any difference between the varieties.','Masking ultraviolet patterns necessarily changes the visible petal colors.','Identical visible colors prove that all other features of the flowers are identical.'],
 'The ultraviolet images and masking test identify a visually relevant feature that the ordinary camera did not capture. Visible similarity alone therefore does not exclude appearance as a contributor to preference.')
cross('hard','a hypothetical investigation of historical reed instruments',
 'Instruments found in two settlements have different arrangements of finger holes. A researcher argues that the communities probably used different sets of musical pitches, since hole placement helps determine which pitches an instrument can produce.',
 'Replicas with identical finger-hole arrangements produce different pitch ranges when fitted with reeds of different stiffness. The experiment does not show that hole placement is unimportant, but it indicates that another component must be considered when reconstructing how the original instruments sounded.',
 'Which choice best describes what Text 2 contributes to the discussion in Text 1?',
 'It identifies an additional factor that could complicate the proposed reconstruction.',
 ['It demonstrates that finger-hole placement has no influence on any instrument’s sound.','It establishes that the two settlements used identical reeds and identical pitches.','It proves that experiments with replicas cannot provide any relevant evidence.'],
 'Text 2 explicitly retains a role for hole placement while adding reed stiffness as a factor affecting pitch. Its experiment qualifies the reconstruction rather than eliminating hole placement or experimental evidence.')
cross('hard','a hypothetical study of pottery exchange',
 'Pottery recovered in one district contains minerals characteristic of clay beds in a distant district. An archaeologist concludes that the finished vessels were made near those beds and then traded to the place where they were found.',
 'Kilns in the recovery district contain unfinished vessels and discarded clay with the same distant mineral signature. Tool marks on the finished vessels also match those on the local unfinished pieces. Raw clay may have traveled between the districts, rather than every vessel being imported after manufacture.',
 'The author of Text 2 would most likely object to which aspect of the conclusion in Text 1?',
 'It treats evidence about the origin of clay as sufficient evidence about where finished vessels were manufactured.',
 ['It allows that minerals can be used to investigate a clay’s geographic origin.','It acknowledges that pottery was found outside the district containing the clay beds.','It assumes that unfinished vessels can occur at a kiln site.'],
 'The local production evidence separates raw-material origin from manufacturing location. The mineral signature may support movement of clay without establishing that all finished vessels were made near the original clay beds.')
cross('medium','a hypothetical fish-behavior study',
 'Fish in a fast stream respond to food more quickly than fish in a nearby pond. A researcher proposes that a fixed inherited difference between the populations accounts for the entire difference in feeding response.',
 'Young fish from both populations are raised under the same laboratory conditions. Their feeding responses do not differ consistently. Changing the water movement during rearing changes the response in fish from both populations, suggesting that the conditions in which they develop can affect the behavior.',
 'Which conclusion is best supported by considering both texts?',
 'The original behavioral difference need not be entirely explained by a fixed inherited difference.',
 ['Inherited traits can never influence feeding behavior in any fish.','Fish from the stream always respond faster under every rearing condition.','The laboratory results establish that water movement has no effect on the response.'],
 'The shared-rearing and changed-condition results provide an environmental explanation that challenges an entirely fixed inherited account. They do not rule out every possible genetic influence or support an unchanging population difference.')
cross('hard','a hypothetical coastal measurement study',
 'A gauge records a rise in water level relative to a marsh surface over several years. Assuming that the marsh surface has remained at a fixed elevation, a researcher attributes the entire relative rise to an increase in the elevation of the water itself.',
 'Independent measurements tied to a stable reference show that the marsh surface has been sinking during the same period. A gauge attached to that surface can record a relative water-level rise even when part of the change results from the land’s downward movement.',
 'Which choice best describes how Text 2 bears on Text 1?',
 'It provides evidence against an assumption needed to attribute the entire recorded change to rising water.',
 ['It shows that the gauge could not have recorded any relative change.','It demonstrates that sinking land necessarily makes relative water levels fall.','It confirms that the marsh surface remained fixed throughout the measurements.'],
 'The fixed-land assumption is explicit in Text 1, and the independent evidence in Text 2 contradicts it. Relative rise can combine water movement and land movement, so the gauge alone does not isolate the former.')

assert.equal(readingEvidenceFresh.length,16)
