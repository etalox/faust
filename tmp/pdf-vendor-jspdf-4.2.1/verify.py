from pathlib import Path
import re
import unicodedata

import fitz
from lxml import html
from pypdf import PdfReader

base = Path(__file__).parent
document = html.parse('terminos-incorporacion.html')
source = document.xpath('//faust-legal-document')[0]
nodes = source.xpath('./header/h1 | ./header/p | ./article//h2 | ./article//h3 | ./article//p | ./article//li')
normal = lambda s: re.sub(r'\s+', '', unicodedata.normalize('NFKC', s))

def pdf_text(path):
    pages = []
    for number, page in enumerate(PdfReader(path).pages, 1):
        lines = (page.extract_text() or '').splitlines()
        assert lines[-1].strip() == str(number), (path, number, lines[-1])
        pages.append(''.join(lines[:-1]))
    return normal(''.join(pages))

original = pdf_text(base / 'original.pdf')
changed = pdf_text(base / 'modified.pdf')
assert normal('PRUEBA DINÁMICA: cláusula actualizada con ñ, á, é y ™.') not in original
assert normal('PRUEBA DINÁMICA: cláusula actualizada con ñ, á, é y ™.') in changed

cursor = 0
for node in nodes:
    text = normal(node.text_content())
    if not text:
        continue
    offset = original.find(text, cursor)
    assert offset >= 0, f'Block at HTML line {node.sourceline} missing: {text[:100]}'
    if node.tag == 'li':
        parent = node.getparent()
        siblings = parent.xpath('./li')
        index = siblings.index(node)
        if parent.tag == 'ul':
            marker = '•'
        else:
            number = int(parent.get('start', '1')) + index
            marker = chr(ord('a') + number - 1) + ')' if parent.get('type') == 'a' else str(number) + '.'
        assert original[max(0, offset - len(normal(marker))):offset] == normal(marker), (node.sourceline, marker)
    cursor = offset + len(text)

pdf = fitz.open(base / 'original.pdf')
for number, page in enumerate(pdf, 1):
    for word in page.get_text('words'):
        x0, y0, x1, y1 = word[:4]
        assert x0 >= 0 and y0 >= 0 and x1 <= page.rect.width and y1 <= page.rect.height, (number, word)
    page.get_pixmap(matrix=fitz.Matrix(0.75, 0.75), alpha=False).save(base / f'page-{number:02}.png')
print(f'OK: {len(nodes)} source blocks and list markers in order, {len(pdf)} pages within bounds; dynamic text included.')
