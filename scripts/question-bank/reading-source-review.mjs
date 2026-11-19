export const readingSourceReview = []

function add(skill, difficulty, passage, prompt, correct, wrong, explanation) {
  readingSourceReview.push({ skill, difficulty, passage, prompt, correct, wrong, explanation })
}

const vocab = 'As used in the text, what does the underlined word most nearly mean?'
const convention = 'Which choice completes the text so that it conforms to the conventions of Standard English?'
const synthesis = 'Which choice most effectively uses relevant information from the notes to accomplish this goal?'

add('Rhetorical Synthesis', 'hard',
  'While researching a topic, a student has taken the following notes.\n- NASA sent two Viking missions to Mars, each with an orbiter and a lander.\n- Images taken from orbit indicated that the terrain at Viking 1’s originally targeted site was unsuitable.\n- Orbital photographs also showed rough terrain at the site originally chosen for Viking 2.\n- Planners selected new landing sites for both spacecraft.\n- The landers reached Chryse Planitia and Utopia Planitia, respectively, in 1976.',
  'The student wants to explain how the orbiters influenced the landers’ destinations. '+synthesis,
  'For both Viking missions, photographs taken from orbit revealed problems with the proposed terrain, prompting planners to choose different landing sites.',
  ['Viking 1 landed at Chryse Planitia, and Viking 2 landed at Utopia Planitia.', 'NASA sent an orbiter and a lander to Mars on each of the two Viking missions.', 'By the end of 1976, the two Viking landers had reached different regions of Mars.'],
  'The orbital images provided evidence about the original locations that led planners to select new ones. The other choices identify equipment, destinations, or timing without explaining the change.')

add('Inferences', 'hard',
  'The Sanborn Map Company sometimes updated published fire insurance maps by pasting correction slips onto the sheets. The Library of Congress describes a Chicago volume marked “1912–May 1950.” The first date identifies the original edition, while the second identifies the latest revision shown in the correction record. The slips allowed information to be revised without printing a new edition.',
  'Which inference about the Chicago volume is best supported by the text?',
  'A building depicted on a sheet from the volume may reflect a revision made after 1912.',
  ['Every building pictured in the volume was constructed between 1912 and 1950.', 'The date 1950 gives the year the original sheets were printed.', 'The two dates refer to separate maps of the same buildings printed thirty-eight years apart.'],
  'A sheet printed for the 1912 edition could later receive a correction slip. The dates identify the original edition and the latest revision of the volume, with no building construction dates specified.')

add('Words in Context', 'medium',
  'After exposure to ultraviolet light, the Hope Diamond gives off a red glow. In a study of blue diamonds, researchers compared both the colors of the emitted light and the _decay_ of the glow after the ultraviolet source was switched off. How quickly the light weakened helped distinguish individual diamonds.',
  vocab,
  'Fading', ['Breakdown of the stone', 'Change in direction', 'Sudden appearance'],
  'The text explains that researchers tracked how quickly the emitted light weakened. The decay is the fading of that light.')

add('Text Structure and Purpose', 'hard',
  'Years after a sudden release of carbon dioxide from Lake Nyos in Cameroon in 1986, researchers documented ongoing replenishment of dissolved gas in its deep waters. A controlled project began removing gas in 2001. _The natural supply of carbon dioxide persisted while the project was removing it._ Researchers therefore assessed both the removal rate and the continuing input of gas when estimating how the lake’s gas content would change.',
  'Which choice best describes the function of the underlined sentence?',
  'It explains why estimates of future gas levels had to account for ongoing replenishment as well as removal.',
  ['It identifies the exact process that initiated the sudden gas release in 1986.', 'It describes how the researchers measured the depth of the lake before removal began.', 'It establishes that removing gas necessarily increases the lake’s total gas content.'],
  'The sentence identifies a second process affecting the amount of gas in the lake. Gas enters and leaves, so forecasting the amount requires accounting for both processes.')

add('Words in Context', 'medium',
  'In a fictional exhibition, visitors can run their fingers over a model of the carved doorway. Its rosettes are in _relief_. Their petals stand above the flat stone behind them, so a visitor can trace each petal’s outline by touch.',
  vocab,
  'Projection from a surface', ['Freedom from distress', 'Replacement of a worker', 'Variation in color'],
  'The petals stand above their background, so relief describes a raised design that projects from a surface.')

add('Central Ideas and Details', 'medium',
  'In this original poem, the speaker describes replacing a garden gate.\n\nI fitted new wood where the old boards fell\nand moved the brass latch one hand lower.\nThe child next door has been growing tall,\nbut her small brother comes by now.\nAt dusk I hear him lift the latch,\nthen call my name before he closes it.',
  'According to the poem, what change did the speaker make when replacing the gate?',
  'The speaker placed the latch lower than it had been.',
  ['The speaker painted the new wood a darker color.', 'The speaker made the gate narrower than it had been.', 'The speaker replaced the brass latch with a wooden one.'],
  'The second line says the latch moved one hand lower. The poem gives no change in color, width, or latch material.')

add('Command of Evidence (Textual)', 'hard',
  'The following text is from an original story. In the school’s shadow play, Celia was assigned to hold the paper bird above the lantern. She had practiced making its shadow sweep grandly across the curtain. On opening night, she saw Milo kneel to retrieve a fallen prop just behind the screen. Celia held the bird low so its shadow would cover the outline of his hand. After he slid back out of view, she let the bird rise.',
  'Which quotation most directly supports the claim that Celia changes the performance to keep a mishap from being visible?',
  'Celia held the bird low so its shadow would cover the outline of his hand.',
  ['She had practiced making its shadow sweep grandly across the curtain.', 'On opening night, she saw Milo kneel to retrieve a fallen prop just behind the screen.', 'After he slid back out of view, she let the bird rise.'],
  'The low position is the intentional adjustment, and the purpose clause explains what it hides. The other lines show the original plan, the mishap, or the later movement.')

add('Cross-Text Connections', 'hard',
  'The texts describe a hypothetical community language program.\n\n**Text 1**\nA project records many speakers pronouncing the same list of words. Repeating a fixed prompt makes it possible to compare how speakers pronounce the same sounds across generations.\n\n**Text 2**\nA project instead records conversations among neighbors. Because speakers choose their own words, the collection reveals routines that readers of isolated examples seldom demonstrate, such as how they enter a conversation politely or disagree without interrupting.',
  'How would the author of Text 2 most likely respond to the approach described in Text 1?',
  'A fixed list can support comparisons of pronunciation, while spontaneous dialogue can document social uses of language that the list may miss.',
  ['A fixed list is suitable only if every generation pronounces each word identically.', 'Spontaneous conversation is preferable because it guarantees that every speaker will use the same vocabulary.', 'Recording isolated words directly reveals more about turn-taking than recording interactions does.'],
  'The two methods answer different questions. Text 1 values comparable pronunciations, while Text 2 identifies patterns of interaction that become available when people converse.')

add('Inferences', 'medium',
  'In an original story, Rafi helps pack the contents of a café that is moving. He turns over six serving trays and finds a different number on the underside of each, from one through six. Along the counter stand six empty padded boxes bearing those same numbers. The trays and boxes look alike at a glance, but the trays vary slightly in width, and the boxes’ padding differs in thickness.',
  'What is most reasonably inferred about the purpose of the numbers?',
  'They help the movers match each tray to the box prepared for it.',
  ['They record how many trays are meant to fit inside each box.', 'They allow customers to identify the ordering counter from across the café.', 'They show the number of times each tray has been used.'],
  'Each tray number appears on one box, and slight differences in width and padding give the movers a reason to make the correct match.')

add('Transitions', 'medium',
  'A fictional theater publishes its weekly rehearsal updates as new files. The stage manager asks actors to use the date printed in the header when deciding which file is newest. ______, actors who rely on the order in which messages appear could follow an older schedule, since an old attachment may be forwarded after a new one.',
  'Which choice completes the text with the most logical transition?',
  'Otherwise', ['For example', 'Likewise', 'Previously'],
  'The final sentence describes a possible consequence of ignoring the stage manager’s instruction. Otherwise introduces that alternative condition.')

add('Boundaries', 'medium',
  'In an original story, two neighbors inspect a cabinet they found at a market. “The cabinet will fit,” Mara ______ the hinges will need replacing.” Jules measures the cabinet to confirm her estimate.',
  convention,
  'said, “although', ['said, “Although', 'said. “Although', 'said “although'],
  'Mara speaks one sentence whose dependent clause begins with although. The reporting clause interrupts the quotation, so it takes a comma after said and the continued quotation begins with lowercase although.')

add('Form, Structure, and Sense', 'hard',
  'At a fictional workshop, volunteers were preparing to dismantle several window frames. To prevent a piece from going back into the wrong opening, the conservator directed that each volunteer ______ the parts with their location codes before removing them.',
  convention,
  'label', ['to label', 'labeling', 'having labeled'],
  'The directive uses a that-clause with the subject each volunteer and the base-form verb label. The infinitive and participial choices cannot serve as the verb of that clause.')

add('Rhetorical Synthesis', 'hard',
  'While researching a topic, a student has taken the following notes.\n- A fictional design team made a tactile alphabet embossed on metal cards.\n- The first prototype used raised circles for both punctuation and letter features.\n- Readers sometimes mistook the circles that marked punctuation for parts of letters.\n- The revised prototype represented punctuation with raised horizontal bars.\n- It retained the original circles within letters.',
  'The student wants to explain how the revision addressed the readers’ specific confusion. '+synthesis,
  'The team used horizontal bars for punctuation and kept circles within letters, giving readers distinct shapes for marks they had previously confused.',
  ['The original prototype used raised circles for punctuation and for certain features of letters.', 'The team revised its metal cards after readers tried the first prototype.', 'The revised cards still included the original raised circles.'],
  'The correct choice connects the new punctuation shape to the mistaken grouping of punctuation with letters. The other choices give individual facts without explaining how the two roles became distinguishable.')

add('Command of Evidence (Quantitative)', 'hard',
  'A hypothetical exhibit can run either of two fans at constant power during a daily demonstration. The total energy a fan uses equals its power in watts multiplied by its running time in hours. A technician argues that choosing the fan with the lower wattage would increase the energy used each day under the proposed schedules.\n\n| Fan | Power (watts) | Hours per day |\n|---|---|---|\n| M | 80 | 4 |\n| N | 50 | 8 |',
  'Which choice uses the table to support the technician’s argument?',
  'Fan N draws 30 fewer watts but uses 400 watt-hours per day, 80 more than Fan M.',
  ['Fan N draws 30 fewer watts and uses 80 fewer watt-hours per day.', 'Fan M runs four fewer hours per day but uses 80 more watt-hours.', 'Fan N uses 400 watt-hours per day, the same daily total as Fan M.'],
  'Multiplying each wattage by its own running time gives 80 × 4 = 320 watt-hours for M and 50 × 8 = 400 for N. The difference is 80 watt-hours per day.')
