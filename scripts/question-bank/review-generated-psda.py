"""Exact models for the selected Problem-Solving and Data Analysis candidates."""
from collections import Counter
from hashlib import sha256
from itertools import combinations, product
import json
from pathlib import Path

import sympy as s

from review_math_common import expression

ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / 'docs/generated-psda-review.json'
generation = json.loads((ROOT / 'docs/math-generation-report.json').read_text())
families = {
    row['family']: row['reviewCandidate']
    for row in generation['families']
    if row['domain'] == 'Problem-Solving and Data Analysis'
}
active = json.loads((ROOT / 'src/data/questions/generated-math-data.json').read_text())
history = json.loads((ROOT / 'src/data/retired/generated-math-data.json').read_text())
by_id = {question['id']: question for question in active + history}
active_ids = {question['id'] for question in active}
reviews = []
R = s.Rational
x = s.Symbol('x', real=True)


def finish(family, result, model):
    """Compute valid responses independently from the stored key."""
    q = by_id[families[family]]
    flags = None
    if 'choices' in q:
        flags = [expression(choice, {}) == result for choice in q['choices']]
        assert flags.count(True) == 1 and flags[q['answer']], (q['id'], result, flags)
    else:
        for answer in q['answer']:
            assert expression(answer, {}) == result, (q['id'], result, answer)
    digest = sha256(json.dumps(q, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())
    reviews.append({
        'id': q['id'],
        'sourceSha256': digest.hexdigest(),
        'model': model,
        'derivedResult': str(result),
        'validChoices': flags,
        'active': q['id'] in active_ids,
        'editorialNotes': [],
    })


def mean(values):
    return sum(values) / R(len(values))


def affine(a, b, value):
    return a * R(value) + b


finish('ratio-part', 156 * R(8, 8 + 4), 'The red group occupies 8 of the 12 ratio parts.')
finish('unit-rate', 92 * R(40, 4), 'Scale the earlier output by the ratio of production times.')
finish('speed-conversion', R(28) * (3 * 60), 'Convert the duration to seconds and multiply by meters per second.')
finish('density', s.solve(3*x - 195, x)[0], 'The mass equation is 3 grams per cubic centimeter times the unknown volume.')
finish('combined-rate', s.solve(4*x + 10*x - 238, x)[0], 'Solve the total delivered volume with both pumps running for the same time.')
finish('percent-of', 960 * R(70, 100), 'Take exactly 70 hundredths of 960.')
finish('reverse-percent', s.solve(R(15, 100)*x - 240, x)[0], 'Find the original amount by solving the proportional equation.')
finish('discount-price', 1300 - 1300 * R(35, 100), 'Subtract the dollar amount of the discount from the original price.')
marked_up = 4700 + 4700 * R(15, 100)
finish('successive-percent', marked_up - marked_up * R(20, 100), 'Compute both dollar changes using their corresponding price bases.')
finish('percent-change', (R(1120, 640) - 1) * 100, 'The final-to-initial ratio minus one is the proportional increase.')
finish('mean-missing', s.solve(mean([31, 36, 33, 28, x]) - 32, x)[0], 'Solve the exact mean equation with the unknown fifth observation.')
finish('median-unsorted', sorted([47, 23, 59, 35, 41, 29, 53])[3], 'Sort all seven observations and return the fourth.')
finish('weighted-mean', mean([13]*4 + [14]*9), 'Expand the frequencies into individual observations before averaging.')
finish('mean-shift', mean([53 + 9] * 22), 'A translation adds the same constant to the mean by linearity, so the result is determined by the mean alone.')
frequency_values = sorted([28]*4 + [34]*6 + [40]*3)
finish('frequency-median', frequency_values[len(frequency_values)//2], 'Expand the frequency table and locate its middle observation.')
finish('linear-prediction', affine(4, 11, 6), 'Evaluate the model at the stated six hours.')
finish('residual', 63 - affine(2, 31, 10), 'Take the signed difference of observed and predicted values at x=10.')
line = s.interpolate([(4, 64), (11, 99)], x)
finish('model-slope', line.subs(x, 5) - line.subs(x, 4), 'Interpolate the line, then compare its predictions one input unit apart.')
finish('inverse-prediction', s.solve(4*x + 47 - 195, x)[0], 'Invert the model for the required prediction of 195.')
finish('probability-basic', R(21, 21 + 10 + 23), 'Count all equally likely counters, with red as the favorable event.')
finish('conditional-table', R(10, 10 + 20), 'Use only the two cells in the art row as the conditional sample space.')

draws = list(combinations(range(11), 2))
finish('without-replacement', R(sum(all(counter < 6 for counter in draw) for draw in draws), len(draws)), 'Count every unordered pair of distinct counters and the pairs with two reds.')
exactly_one = 23 - 15 + 27 - 15
finish('probability-union', R(exactly_one + 15, 44), 'Count the disjoint categories of chess only, soccer only, and both.')
finish('sample-estimate', 2200 * R(66, 100), 'Multiply the proportion supporting the proposal in the random sample by the population size.')
finish('margin-interval', 31 + 11, 'The upper endpoint adds the margin in percentage points to the estimate.')
endpoints = (61 - 6, 61 + 6)
finish('interval-width', endpoints[1] - endpoints[0], 'Construct the two endpoints around the given center, then subtract.')
constant = 15 * s.sqrt(600)
finish('sample-size-margin', constant / s.sqrt(2400), 'Determine the constant in the inverse-square-root model from the original sample.')
size = s.solve((10*17 + 57*x) / (10 + x) - 49, x)[0]
finish('combined-mean-group-size', size, 'Solve the exact ratio of total measurement sum to total count.')
extra_water = s.solve(190 * R(9, 100) / (190 + x) - R(3, 100), x)[0]
finish('dilution-to-target', extra_water, 'Conserve the salt amount while increasing the final volume by the added water.')
residuals = [observed - (6*input_value + x) for input_value, observed in [(9, 84), (11, 51), (13, 108)]]
finish('mean-zero-residual-intercept', s.solve(mean(residuals), x)[0], 'Use the signed residuals of all three observations and require their average to vanish.')
pass_a = R(1, 2) * R(20, 100)
pass_b = R(1, 2) * R(60, 100)
finish('bayes-two-groups', pass_a / (pass_a + pass_b), 'Normalize the factory A passing share by the overall passing share.')
finish('area-unit-density', 2 / (10 * R(1, 100)**2), 'Convert the given area to square meters before dividing the mass by that area.')
original_price = s.solve(x * R(130, 100) * R(70, 100) - 5096, x)[0]
finish('reverse-two-price-changes', original_price, 'Apply both exact forward multipliers to the unknown original price and solve.')
a, b = R(1, 5), R(1, 10)
finish('independent-at-least-one', a + b - a*b, 'Add the event probabilities and subtract their intersection, which factors by independence.')
finish('conditional-count-from-percent', 1500 * R(40, 100)**2, 'Count the joint event with the train proportion and the conditional bicycle proportion.')
finish('mean-after-removal', (29*101 - 7*13) / R(29-7), 'Use the sum and count of the remaining observations.')
finish('mean-frequency-missing-count', s.solve((3*7 + 7*x + 11*9) / (7 + x + 9) - R(169, 23), x)[0], 'Solve the ratio including the unknown frequency in both numerator and denominator.')
converted = (11*x + 48) / R(1000)
finish('model-unit-change-slope', converted.subs(x, 1) - converted.subs(x, 0), 'Compare converted distance predictions one minute apart.')
finish('interval-center-recovery', mean([17, 31]), 'A symmetric interval has its center at the average of the endpoints.')
kept = s.solve(R(60, 100)*x - 40*R(15, 100), x)[0]
finish('drain-refill-concentration', 40 - kept, 'Infer the amount of original solution left after draining from the concentrate in the refilled tank.')
initial_scale = s.solve(5*x / (9*x + 72) - R(65, 189), x)[0]
finish('ratio-after-adding-one-group', 5*initial_scale, 'Use a common scale for the original counts and solve the changed ratio.')

colors = Counter({0: 180, 1: 60})
same_color_pairs = sum(colors[first]*colors[second] for first, second in product(colors, repeat=2) if first == second)
finish('same-color-with-replacement', R(same_color_pairs, colors.total()**2), 'Count ordered pairs with the same color in two independent draws from the original bag.')
finish('equal-distance-average-speed', 2 / (R(1, 30) + R(1, 15)), 'Use a unit-length segment for each leg and divide total length by total time.')
finish('changing-share-and-population', 1900 * (R(60, 100)*R(70, 100) - R(40, 100)), 'Express both user counts as fractions of the original population before subtracting.')
variance = 8**2 * (-5)**2
finish('negative-affine-standard-deviation', s.sqrt(variance), 'Translations leave variance invariant and scaling multiplies it by the square of the scale.')
finish('observed-value-from-model-residual', s.solve(x - affine(2, 16, 15) - (-11), x)[0], 'Solve the signed residual equation for the observed output.')
finish('stratified-population-count-estimate', 700*R(80, 100) + 1500*R(20, 100), 'Apply each random-sample estimate to the population count of its own group.')
reference_constant = 5 * s.sqrt(325)
target = R(5, 5)
minimum_count = s.ceiling((reference_constant / target)**2)
assert reference_constant/s.sqrt(minimum_count) <= target < reference_constant/s.sqrt(minimum_count - 1)
finish('minimum-sample-for-margin', minimum_count, 'Invert the monotone square-root model. Check that the preceding integer still exceeds the target margin.')
finish('map-area-scale-conversion', 13 * 10**2, 'Each square centimeter on the map represents a square 10 meters on a side.')

selected = list(families.values())
assert [row['id'] for row in reviews] == selected
hashfile = lambda path: sha256(path.read_bytes()).hexdigest()
report = {
    'scope': '49 selected Problem-Solving and Data Analysis family candidates, including 17 retired overlaps.',
    'method': 'Exact models using manually transcribed givens, event counts, signed predictions, and bounded integer checks. All options and typed aliases were compared to the derived values.',
    'engine': f'SymPy {s.__version__}',
    'solverSha256': hashfile(Path(__file__)),
    'helperSha256': hashfile(Path(__file__).with_name('review_math_common.py')),
    'requirementsSha256': hashfile(Path(__file__).with_name('requirements-review.txt')),
    'selectionSha256': sha256(json.dumps(selected, separators=(',', ':')).encode()).hexdigest(),
    'questionsReviewed': len(reviews),
    'activeQuestionsReviewed': sum(row['active'] for row in reviews),
    'items': reviews,
}
REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(f'Independently checked {len(reviews)} selected data-analysis candidates ({report["activeQuestionsReviewed"]} active).')
