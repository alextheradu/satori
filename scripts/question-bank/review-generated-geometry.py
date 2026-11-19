"""Independently derive the answers to all selected Geometry candidates."""
from hashlib import sha256
import json
from pathlib import Path

import sympy as s

from review_math_common import expression

ROOT = Path(__file__).resolve().parents[2]
generation = json.loads((ROOT / 'docs/math-generation-report.json').read_text())
families = {
    row['family']: row['reviewCandidate']
    for row in generation['families']
    if row['domain'] == 'Geometry and Trigonometry'
}
active = json.loads((ROOT / 'src/data/questions/generated-math-geometry.json').read_text())
history = json.loads((ROOT / 'src/data/retired/generated-math-geometry.json').read_text())
by_id = {question['id']: question for question in active + history}
active_ids = {question['id'] for question in active}
reviews = []
R = s.Rational
x, y, k = s.symbols('x y k', real=True)
r, h = s.symbols('r h', positive=True)


def finish(family, result, model):
    q = by_id[families[family]]
    flags = None
    if 'choices' in q:
        flags = [s.simplify(expression(choice, {}) - result) == 0 for choice in q['choices']]
        assert flags.count(True) == 1 and flags[q['answer']], (q['id'], result, flags)
    else:
        for answer in q['answer']:
            assert s.simplify(expression(answer, {}) - result) == 0, (q['id'], result, answer)
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


finish('rectangle-area', s.Polygon((0, 0), (36, 0), (36, 31), (0, 31)).area, 'Evaluate the area of a coordinate rectangle with the stated dimensions.')
finish('triangle-area', s.Polygon((0, 0), (16, 0), (0, 23)).area, 'Place the base on an axis and take the stated perpendicular height. Horizontal placement of the apex does not affect area.')
finish('prism-height', s.solve(22*13*h - 858, h)[0], 'Equate the base area times the unknown height to the given volume.')
finish('cylinder-volume', 17**2 * 25, 'Integrate a constant cross-sectional area coefficient over the height.')
finish('cone-volume', s.integrate((8*x/6)**2, (x, 0, 6)), 'Use horizontal circular sections whose radii grow linearly from the tip.')
finish('scale-volume', 33 * s.det(s.diag(6, 6, 6)), 'Uniform scaling changes volume by the determinant of the three-dimensional dilation.')
finish('triangle-angle', 180 - (35 + 64), 'Subtract the two stated interior angles from the triangle angle sum.')
finish('exterior-angle', 180 - (180 - 97) - 40, 'Find the adjacent interior angle from the linear pair and subtract the known interior angles from 180.')
finish('isosceles-angle', s.solve(x + 2*32 - 180, x)[0], 'The vertex angle and two base angles together sum to 180.')
finish('similar-side', 20 * R(96, 12), 'Scale the side corresponding to BC by the ratio DE to AB.')
finish('parallel-angle', s.solve(7*x + 5 - 61, x)[0], 'The transversal makes equal corresponding angles on parallel lines.')
finish('pythagorean-leg', s.sqrt(375**2 - 105**2), 'Use the positive root of the squared-distance constraint.')
assert 196**2 + 672**2 == 700**2
finish('sine-ratio', R(196, 700), 'The given lengths form a right triangle. Divide the opposite length by the hypotenuse.')
finish('tangent-side', 96 * R(12, 12), 'The ray describing the hypotenuse has slope equal to the tangent, so its run of 96 gives the rise.')
finish('special-triangle', 16 * s.sin(s.pi/6), 'Project the hypotenuse onto the leg opposite the 30 degree angle.')
finish('circle-area', s.Circle((0, 0), R(20, 2)).area/s.pi, 'Use the diameter to construct its circle and evaluate the area coefficient.')
finish('circle-radius-equation', s.solve(r**2 - 100, r)[0], 'In center-radius form the right side is the squared positive radius.')
expanded = x*x + y*y - 26*x - 36*y + 52
center = s.solve([s.diff(expanded, x), s.diff(expanded, y)], (x, y))
finish('circle-complete-square', s.sqrt(-expanded.subs(center)), 'Locate the center as the minimum of the expanded distance polynomial, then recover its radius from the level set.')
finish('arc-length', 12 * (R(135, 180)*s.pi) / s.pi, 'Multiply the radius by the central angle expressed in radians and remove the requested pi factor.')
finish('sector-area', R(150, 360) * 15**2, 'Take the angular fraction of the whole circular area coefficient.')
finish('radians', R(600, 360) * 2, 'Count revolutions, then multiply by 2 pi radians per revolution.')
intersections = s.Circle((0, 0), 52).intersection(s.Line((48, -1), (48, 1)))
assert len(intersections) == 2
finish('chord-distance', abs(intersections[1].y - intersections[0].y)/2, 'Place the chord horizontally with endpoints at x=±48. Intersect the circle with x=48 to recover the positive level of that chord.')
finish('tangent-segment', s.sqrt(306**2 - 144**2), 'Use orthogonality of the radius and the tangent segment at their contact.')
circle = x*x + y*y - 34*x - 4*y + k
tangent_constant = s.solve(s.discriminant(circle.subs(y, 0), x), k)[0]
finish('circle-axis-tangency', tangent_constant, 'Set y=0 and require one double intersection of the resulting quadratic with the axis.')
finish('inscribed-angle', R(106, 2), 'The inscribed angle subtends half the measure of the same intercepted arc.')
complement = s.solve((5*x + 12) + (3*x + 46) - 90, x)[0]
assert 0 < 5*complement + 12 < 90 and 0 < 3*complement + 46 < 90
finish('complementary-trig-parameter', complement, 'Cosine of an acute angle equals sine of its complement, and sine is injective on acute angles.')
finish('similar-area-to-side', 24 * s.sqrt(R(320, 45)), 'Take the positive square root of the ratio of the areas to obtain the side scale.')
whole = s.integrate((20*x/60)**2, (x, 0, 60))
small_height = s.solve(20*x/60 - 4, x)[0]
finish('truncated-cone-volume', whole - s.integrate((20*x/60)**2, (x, 0, small_height)), 'Integrate the square of the cross-section radius over the original height and subtract the tip integral.')
radius = s.solve(4*r**2 - 18496, r)[0]
sphere = s.integrate(s.pi*(radius**2 - x*x), (x, -radius, radius))
finish('sphere-area-to-volume-ratio', sphere/(18496*s.pi), 'Recover the radius from the surface area and use a cross-sectional volume integral.')
triangle = s.Triangle((0, 0), (2720, 0), (0, 5100))
hypotenuse = s.Line((2720, 0), (0, 5100))
assert s.Point(2720, 0).distance(s.Point(0, 5100)) == 5780
finish('hypotenuse-altitude', hypotenuse.distance(triangle.vertices[0]), 'The altitude is the perpendicular distance from the right-angle vertex to the hypotenuse line.')
finish('similar-perimeter-difference', s.solve(x - R(7, 8)*x - 15, x)[0], 'Write the smaller perimeter as seven eighths of the larger and impose the difference.')
side_count = s.solve(140*x - 180*(x - 2), x)[0]
finish('regular-polygon-perimeter', 9*side_count, 'Use the interior angle sum of a polygon to derive the number of sides.')
finish('annulus-outer-radius', s.solve(r**2 - 13**2 - 672, r)[0], 'The difference of disk areas determines the positive outer radius.')
radius = s.solve(4*r**3 - 2048000, r)[0]
finish('sphere-inscribed-cube', 2*radius, 'Recover the sphere radius and use the distance between opposite tangent faces of the cube.')
finish('equal-volume-cone-cylinder', s.solve(R(1, 3)*5**2*h - 10**2*6, h)[0], 'Equate the two volumes after canceling the common pi factor.')
perimeter = 74 + R(1110, 180)*s.pi
finish('sector-perimeter-radius', s.solve((2 + s.pi/6)*r - perimeter, r)[0], 'Use two radial segments and the 30 degree arc to form the perimeter.')
finish('cyclic-opposite-angle-parameter', s.solve((5*x + 12) + (5*x + 68) - 180, x)[0], 'Opposite inscribed angles intercept arcs with total measure 360, so their measures sum to 180.')
short_side = s.solve(x*x + (R(12, 5)*x)**2 - (2*78)**2, x)
short_side = next(length for length in short_side if length > 0)
finish('rectangle-in-circle-perimeter', 2*short_side*(1 + R(12, 5)), 'Use the given aspect ratio and the circle diameter as the diagonal, then compute the perimeter.')
radius = s.sqrt(2916)
inscribed_square = s.Polygon((radius, 0), (0, radius), (-radius, 0), (0, -radius))
finish('inscribed-square-from-circle-area', inscribed_square.area, 'Put the square vertices at the four cardinal points of the circle and evaluate its area.')
leg = s.sqrt(45**2/(1 + R(3, 4)**2))
finish('right-triangle-area-from-tangent', leg * (R(3, 4)*leg)/2, 'Use the hypotenuse and leg ratio to recover both legs, then compute the area.')
finish('same-side-interior-angle-parameter', s.solve(7*x + 14 + 2*x + 121 - 180, x)[0], 'Same-side interior angles of parallel lines are supplementary.')
finish('similar-cone-cut-volume', 128 * (1 - R(2, 4)**3), 'Use the cube of the tip-to-original height ratio to get the removed share.')
cylinder = s.solve([r*r*h - 4693, 2*r*h - 494], (r, h))
assert len(cylinder) == 1
finish('cylinder-radius-two-measures', cylinder[0][0], 'Solve the exact volume and lateral area constraints for positive radius and height.')
finish('nested-similar-triangle-side', 30 * R(10 + 20, 10), 'Use the full side AB to scale the parallel segment DE back to the large triangle.')
finish('two-tangents-minor-arc', 360 - 90 - 90 - 62, 'Two perpendicular tangencies determine two angles of the quadrilateral with the center and the exterior point.')

selected = list(families.values())
assert [row['id'] for row in reviews] == selected
hashfile = lambda path: sha256(path.read_bytes()).hexdigest()
report = {
    'scope': '45 selected Geometry and Trigonometry family candidates, including 12 retired overlaps.',
    'method': 'Independently transcribed givens and exact models using coordinates, symbolic constraints, areas and volumes, and angle relationships. Every mathematical option and typed alias is checked.',
    'engine': f'SymPy {s.__version__}',
    'solverSha256': hashfile(Path(__file__)),
    'helperSha256': hashfile(Path(__file__).with_name('review_math_common.py')),
    'requirementsSha256': hashfile(Path(__file__).with_name('requirements-review.txt')),
    'selectionSha256': sha256(json.dumps(selected, separators=(',', ':')).encode()).hexdigest(),
    'questionsReviewed': len(reviews),
    'activeQuestionsReviewed': sum(row['active'] for row in reviews),
    'items': reviews,
}
(ROOT / 'docs/generated-geometry-review.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(f'Independently checked {len(reviews)} selected Geometry candidates ({report["activeQuestionsReviewed"]} active).')
