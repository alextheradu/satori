"""Restricted mathematical parser for independently reviewed legacy questions.

Accepts only numbers, named symbols, arithmetic, tuples and the listed TeX forms.
It deliberately does not evaluate Python calls or arbitrary identifiers.
"""
import ast
import re
import sympy as s


def group(text, start):
    assert text[start] == '{', text[start:]
    depth = 1
    for end in range(start + 1, len(text)):
        depth += (text[end] == '{') - (text[end] == '}')
        if not depth:
            return text[start + 1:end], end + 1
    raise ValueError('Unclosed TeX group')


def ascii_math(text):
    text = text.replace('$', '').replace('−', '-').replace('{,}', '')
    text = text.replace('\\left', '').replace('\\right', '')
    # Replace outer commands recursively, preserving nested fractions and roots.
    while match := re.search(r'\\(frac|sqrt)', text):
        start, end = match.span()
        if match.group(1) == 'frac':
            numerator, end = group(text, end)
            denominator, end = group(text, end)
            replacement = f'(({ascii_math(numerator)})/({ascii_math(denominator)}))'
        else:
            index = '2'
            if text[end] == '[':
                close = text.index(']', end)
                index, end = text[end + 1:close], close + 1
            radicand, end = group(text, end)
            replacement = f'(({ascii_math(radicand)})**(1/({ascii_math(index)})))'
        text = text[:start] + replacement + text[end:]
    for old, new in [('\\cdot', '*'), ('\\times', '*'), ('\\pi', 'pi')]:
        text = text.replace(old, new)
    text = text.replace('{', '(').replace('}', ')').replace('^', '**')
    text = re.sub(r'\s+', '', text)
    # All variables here have one-letter names; pi is a reserved constant.
    text = re.sub(r'(?<=[0-9)])(?=[A-Za-z(])', '*', text)
    text = re.sub(r'(?<=[A-Za-z])(?=[A-Za-z(])', '*', text).replace('p*i', 'pi')
    return text


def expression(text, symbols):
    node = ast.parse(ascii_math(text), mode='eval').body

    def visit(n):
        if isinstance(n, ast.Constant) and type(n.value) in (int, float):
            return s.Rational(str(n.value))
        if isinstance(n, ast.Name):
            if n.id == 'pi': return s.pi
            if n.id in symbols: return symbols[n.id]
        if isinstance(n, ast.Tuple): return s.Tuple(*(visit(e) for e in n.elts))
        if isinstance(n, ast.UnaryOp) and isinstance(n.op, (ast.USub, ast.UAdd)):
            return -visit(n.operand) if isinstance(n.op, ast.USub) else visit(n.operand)
        if isinstance(n, ast.BinOp):
            left, right = visit(n.left), visit(n.right)
            if isinstance(n.op, ast.Add): return left + right
            if isinstance(n.op, ast.Sub): return left - right
            if isinstance(n.op, ast.Mult): return left * right
            if isinstance(n.op, ast.Div): return left / right
            if isinstance(n.op, ast.Pow): return left ** right
        raise ValueError(f'Unsupported mathematical syntax: {ast.dump(n)}')

    return visit(node)


def solution_choice(text, symbols):
    if text == 'The equation has no solution.': return s.EmptySet
    parts = re.findall(r'\$([^$]+)\$', text)
    values = []
    for part in parts:
        part = part.replace('x =', '').strip()
        if '\\pm' in part:
            values.extend(expression(part.replace('\\pm', sign), symbols) for sign in ('+', '-'))
        else:
            part = part.replace('\\{', '').replace('\\}', '')
            values.extend(expression(piece, symbols) for piece in part.split(','))
    assert values, text
    return s.FiniteSet(*values)
