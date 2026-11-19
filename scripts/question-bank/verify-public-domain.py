"""Verify committed excerpts against source paragraphs and public-domain notices.

Downloads the four source editions, or accepts an existing --directory cache with
persuasion.xhtml, expectations.xhtml, antonia.xhtml, and innocence.xhtml.
Only whitespace and invisible word joiners are normalized.
This checks provenance, not question interpretations.
"""
import argparse
import hashlib
import json
from pathlib import Path
import urllib.request
import xml.etree.ElementTree as E

parser = argparse.ArgumentParser()
parser.add_argument('--directory',type=Path)
options = parser.parse_args()
rows = json.loads(Path(__file__).with_name('public-domain-passages.json').read_text())
ns = {'h':'http://www.w3.org/1999/xhtml'}
cache = {}
for row in rows:
    url = row['sourceUrl']
    if url not in cache:
        key = row['id'].split('-')[1]
        if options.directory:
            source = (options.directory/f'{key}.xhtml').read_bytes()
        else:
            request=urllib.request.Request(url,headers={'User-Agent':'SAT-practice-provenance-check/1.0'})
            with urllib.request.urlopen(request,timeout=45) as response:
                source = response.read()
        root = E.fromstring(source)
        cache[url] = {section.get('id'):section for section in root.findall('.//h:section',ns)}
        license_text=' '.join(''.join(cache[url]['uncopyright'].itertext()).split())
        assert 'United States public domain' in license_text and 'CC0 1.0' in license_text,url
    paragraph = cache[url][row['chapter']].findall('.//h:p',ns)[row['paragraphIndex']]
    text = ' '.join(''.join(paragraph.itertext()).replace('\u2060','').split())
    assert text == row['text'],f"{row['id']}: source paragraph differs"
    assert hashlib.sha256(text.encode()).hexdigest() == row['textSha256'],row['id']
assert len(rows)==len({row['text'] for row in rows})==len({row['id'] for row in rows})==48
print(f'Verified all {len(rows)} distinct excerpts against {len(cache)} source editions and their public-domain notices.')
