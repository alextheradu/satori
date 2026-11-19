export const readingComparisons = []

function add(skill, difficulty, passage, prompt, correct, wrong, explanation) {
  readingComparisons.push({ skill, difficulty, passage, prompt, correct, wrong, explanation })
}

add('Words in Context', 'medium',
  'At a fictional metalworking exhibit, a demonstrator starts with a short, thick rod. The rod is _drawn_ through a series of openings, each narrower than the last. Gripping the end with tongs, the demonstrator pulls it through until it becomes a long, thin wire.',
  'As used in the text, what does the underlined word most nearly mean?',
  'Pulled', ['Illustrated', 'Selected', 'Shortened'],
  'The demonstrator uses tongs to pull the metal through the openings. Drawn describes that movement.')

add('Cross-Text Connections', 'hard',
  'The following texts describe approaches to photographing a fictional dance performance.\n\n**Text 1**\nThe company’s wide photograph shows the entire group at once. The scattering of dancers across the stage traces a curved line that a viewer close to any one dancer could easily miss.\n\n**Text 2**\nA photographer framing only one dancer can capture how she changes her grip on a scarf just before the group turns. The grip gives a clue to how she prepares for the movement, even if the group’s shape lies outside the frame.',
  'Which choice best describes the relationship between the two texts?',
  'They identify different aspects of the performance that become visible at different photographic scales.',
  ['They disagree about whether the dancers ever turn as a group.', 'They both argue that the best photographs exclude most of the stage.', 'The second text explains how the photographer captured the entire group’s curved formation.'],
  'The wide view reveals the group’s overall formation. The close view reveals a small movement by one dancer. Each text explains what its framing makes visible.')

add('Command of Evidence (Textual)', 'hard',
  'In an original story, Veda was preparing a window display of wind chimes. When the door of the shop opened, air sent the chimes ringing all at once. A customer asked to hear how the small copper chime sounded on its own. Veda slipped a strip of felt between the other chimes’ tubes and their clappers. Then she stood back while the customer nudged the copper chime.',
  'Which quotation best supports the claim that Veda takes a specific action to isolate the sound of a single chime?',
  'Veda slipped a strip of felt between the other chimes’ tubes and their clappers.',
  ['In an original story, Veda was preparing a window display of wind chimes.', 'When the door of the shop opened, air sent the chimes ringing all at once.', 'Then she stood back while the customer nudged the copper chime.'],
  'The felt prevents the other clappers from striking their tubes, allowing the customer to hear the copper chime separately. The other lines describe the setting, the initial noise, and the customer’s action.')

add('Central Ideas and Details', 'medium',
  'In a fictional town, a covered market occupies a building with entrances on two streets. For an evening sale, the organizers keep the sloped western entrance open to shoppers. Delivery crews use the eastern entrance because it leads directly to the storage area. The separation lets shoppers browse without crossing the delivery route.',
  'According to the text, why do delivery crews use the eastern entrance?',
  'It gives them direct access to the storage area.',
  ['Its slope lets them move carts without help.', 'It is the only entrance that faces a street.', 'It is closer to the displays that shoppers are browsing.'],
  'The third sentence gives the reason for using the eastern entrance. The text associates the slope with the western entrance and places the storage area on the delivery route.')

add('Command of Evidence (Quantitative)', 'hard',
  'In a hypothetical shipping trial, two samples are weighed inside reusable containers. The gross weight includes the sample and its container. The sample weight is the gross weight minus the empty container weight. An analyst suspects that ranking the samples by gross weight gives the reverse of their ranking by sample weight.\n\n| Sample | Gross weight (g) | Empty container weight (g) |\n|---|---|---|\n| R | 1,400 | 600 |\n| S | 1,300 | 300 |',
  'Which choice best uses the table to support the analyst’s suspicion?',
  'R has a greater gross weight, but its sample weighs 800 grams compared with 1,000 grams for S.',
  ['R has a greater gross weight and its sample weighs 200 grams more than S.', 'S has a lower gross weight and its sample also weighs less than R.', 'The containers differ in weight by 300 grams, while the two samples have the same weight.'],
  'Subtracting each container weight gives 800 grams for R and 1,000 grams for S. The gross weights rank R first, while the sample weights rank S first.')

add('Transitions', 'medium',
  'A fictional public garden wants visitors to compare how a leaf looks under sunlight and under shade without moving the plant from its bed. ______, volunteers mount a small shade on a hinge beside the viewing station. Visitors can swing it over the leaf briefly and then move it away.',
  'Which choice completes the text with the most logical transition?',
  'To that end', ['By comparison', 'Even so', 'In retrospect'],
  'The volunteers install the movable shade to accomplish the comparison the garden wants visitors to make. To that end introduces the action taken for that purpose.')

add('Rhetorical Synthesis', 'hard',
  'While researching a topic, a student has taken the following notes.\n- Two fictional composers set the same poem to music.\n- Laleh Omari repeats the poem’s last line after each stanza.\n- Omari gives the repeated line the same melody each time.\n- Dev Shah presents the last line only once, at the end.\n- Shah has the singers pause for a full measure just before that line.',
  'The student wants to contrast how the two composers call attention to the same line. Which choice most effectively uses relevant information from the notes to accomplish this goal?',
  'Omari gives the last line prominence by repeating it with the same melody, while Shah saves it for the end and places a pause immediately before it.',
  ['Omari and Shah each set the same poem to music.', 'Omari repeats a line, and the singers in Shah’s setting pause for one measure.', 'Shah presents the last line once and gives it the melody Omari uses for her repeated line.'],
  'The keyed choice identifies the same final line in both settings and explains each composer’s way of emphasizing it. The notes do not say the composers use the same melody.')

add('Form, Structure, and Sense', 'medium',
  'In a hypothetical orchestra seating trial, the conductor lets players request a different seat during each rehearsal. Fewer players asked to move under the second seating plan than ______ under the first, even though the two plans were tested by the same musicians.',
  'Which choice completes the text so that it conforms to the conventions of Standard English?',
  'did', ['has', 'does', 'having done'],
  'Did stands in for the earlier verb phrase asked to move. It makes the comparison between the players who requested a move under each plan.')
