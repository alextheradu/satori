export const readingMeasurement = []

function add(skill, difficulty, passage, prompt, correct, wrong, explanation) {
  readingMeasurement.push({ skill, difficulty, passage, prompt, correct, wrong, explanation })
}

const vocabulary = 'As used in the text, what does the underlined word most nearly mean?'

add('Words in Context', 'medium',
  'In a hypothetical museum exhibit, a mechanical indicator turns when the platform beneath it moves. The indicator can _register_ a shift of less than a millimeter: even a displacement too small for most visitors to see causes its needle to move.',
  vocabulary,
  'Detect', ['Authorize', 'Prevent', 'Generate'],
  'The moving needle signals a shift that has already occurred. The indicator detects the shift.')

add('Words in Context', 'medium',
  'Reviewing an imaginary play, a critic admires the stage designer’s _economy_. Two boards and a length of rope suggest a river crossing in one scene and a factory entrance in the next. The designer establishes both locations with just a few objects.',
  vocabulary,
  'Sparing use of resources', ['System of trade', 'Dependence on tradition', 'Precision of measurements'],
  'The critic singles out the designer’s ability to evoke two places with very few objects. Economy here describes restraint in the use of materials.')

add('Text Structure and Purpose', 'hard',
  'A hypothetical experiment measures whether stage musicians’ gestures affect listeners’ judgments of a performance. All listeners hear the same recording. _Half watch a silent video of the musicians synchronized to the recording, while the others face a blank screen._ Researchers then compare the groups’ ratings.',
  'Which choice best describes the function of the underlined sentence?',
  'It describes how the experiment varies visual information while keeping the sound constant.',
  ['It presents evidence that listeners prefer recordings made without an audience.', 'It explains how the researchers corrected a timing error in the recording.', 'It identifies a source of background noise that differed across performances.'],
  'Both groups hear the same audio. The sentence specifies that only one group can see the performers’ gestures, creating the visual comparison used to answer the research question.')

add('Text Structure and Purpose', 'hard',
  'In an original story, Mai brings a dented lunch tin to a repair stall. “It still closes,” she tells the repairer, before he has even looked up. While he works, she keeps repeating the words she plans to say to her brother when she returns the tin. After the repairer hands it back, she opens and closes it three times.',
  'What is the main effect of placing Mai’s remark before the repairer has looked at the tin?',
  'It suggests that Mai feels an immediate need to explain the tin’s condition.',
  ['It establishes that the repairer has already offered to replace the tin.', 'It identifies the precise method the repairer will use.', 'It shows that Mai has forgotten why she brought the tin.'],
  'Mai volunteers that the tin works before the repairer has examined it or asked a question. Her timing makes the remark sound like an explanation she is already eager to give.')

add('Cross-Text Connections', 'hard',
  'The following texts describe a hypothetical trial of raised-line maps.\n\n**Text 1**\nOn a map of five paths, readers using touch located intersections faster when each path had a different texture. The designer recommends giving every path its own texture on all maps of the park.\n\n**Text 2**\nOn maps with five paths, individually textured paths helped readers. On a map showing sixteen paths at the same scale, however, readers confused several of the textures and located intersections faster when textures were used only for the major paths.',
  'How would the author of Text 2 most likely respond to the recommendation in Text 1?',
  'Whether to give every path a distinct texture should depend on how many paths the map shows.',
  ['The five-path trial establishes that textures help only readers unfamiliar with the park.', 'Distinct textures should be reserved for maps that show at least sixteen paths.', 'Including textures for major paths prevents readers from ever finding minor paths.'],
  'Both texts report a benefit from distinct textures on a five-path map. Text 2 also reports that selective texturing worked better in the sixteen-path comparison, giving a reason to account for the number of paths.')

add('Inferences', 'hard',
  'In a fictional print shop that uses movable type, a curator examines an undated book and finds a capital R with a chipped leg on page 16 and the same distinctive mark on page 24. The records show that the type in the press was dismantled and returned to its case after each page was printed. Only one capital R in that case had the chip.',
  'Which inference about the two pages is best supported by the text?',
  'The same piece of type was likely used to print both pages.',
  ['Page 24 must have been printed before page 16.', 'The printer replaced all of the capital Rs between the two pages.', 'The distinctive mark most likely appeared after the book was bound.'],
  'Returning type to the case made the chipped R available for another page. The repeated distinctive mark and the presence of just one chipped R support reuse. The evidence gives no printing order.')

add('Command of Evidence (Quantitative)', 'hard',
  'A fictional stage crew tests two timings for a lighting cue and a sound cue. The table shows when each cue starts and ends, in seconds since the start of each trial. The sequence is complete when both cues have ended. The director observes that Trial B ended sooner even though each of its cues lasted longer than its counterpart in Trial A.\n\n| Trial | Lighting start | Lighting end | Sound start | Sound end |\n|---|---|---|---|---|\n| A | 0 | 12 | 9 | 20 |\n| B | 0 | 14 | 6 | 18 |',
  'Which choice uses data from the table to explain the director’s observation?',
  'The cues overlapped for 8 seconds in Trial B and 3 seconds in Trial A, so less time elapsed before both cues were complete in Trial B.',
  ['The sound cue lasted 2 seconds less in Trial B because it ended at 18 seconds rather than 20 seconds.', 'The lighting cue started 2 seconds earlier in Trial B, allowing the whole sequence to finish earlier.', 'The two cues were separated by a 6-second gap in Trial B but had no gap in Trial A.'],
  'In A, lighting lasted 12 seconds and sound lasted 11, with 3 seconds of overlap, for a total of 20 seconds. In B, they lasted 14 and 12 seconds, with 8 seconds of overlap, for a total of 18 seconds. The greater overlap more than offset the increase in cue durations.')

add('Command of Evidence (Quantitative)', 'hard',
  'In a hypothetical test, two temperature sensors take readings at three known temperatures. A positive error means the reading was too high, and a negative error means it was too low. A technician claims that averaging signed errors can hide errors in individual readings.\n\n| Reference temperature | Sensor A error | Sensor B error |\n|---|---|---|\n| 10°C | −3°C | +1°C |\n| 20°C | +2°C | +1°C |\n| 30°C | +1°C | +1°C |',
  'Which statement uses data from the table to best illustrate the technician’s claim?',
  'Sensor A’s average signed error was 0°C even though every individual reading had an error.',
  ['Sensor B had the same signed error at all three reference temperatures.', 'The sensors had equal signed errors at 10°C.', 'Both sensors had negative average signed errors.'],
  'Sensor A’s errors sum to −3 + 2 + 1 = 0, so their signed average is zero even though none of its readings was exact. Sensor B’s constant positive error illustrates a bias that remains visible in the average.')
