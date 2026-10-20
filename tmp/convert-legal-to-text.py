from pathlib import Path
import re
from lxml import html

source = Path('terminos-incorporacion.html')
target = Path('legal/terminos-incorporacion.txt')
if target.exists():
    raise FileExistsError(target)

doc = html.parse(str(source)).xpath('//faust-legal-document')[0]
header = doc.xpath('./header')[0]
metadata = header.xpath('./p')[0]
spans = metadata.xpath('./span')
if len(spans) != 3:
    raise ValueError('Unexpected metadata structure')

def inline(element):
    result = [element.text or '']
    for child in element:
        if child.tag == 'br':
            result.append('\\\n')
        elif child.tag in ('strong', 'b'):
            result.append('**' + inline(child) + '**')
        elif child.tag in ('span', 'a', 'em', 'i'):
            result.append(inline(child))
        else:
            raise ValueError(f'Unsupported inline element: {child.tag}')
        result.append(child.tail or '')
    return ''.join(result).strip()

version = spans[0].text_content().strip()
date = spans[1].text_content().strip()
if not date.startswith('Emisión: '):
    raise ValueError('Unexpected emission date')
lines = ['---', f'Versión: {version}', f'Emisión: {date.removeprefix("Emisión: ")}',
         f'Marco: {(metadata.text or "").strip()}', f'Marca: {spans[2].text_content().strip()}',
         '---', '', '# ' + inline(header.xpath('./h1')[0]), '']

def alphabetic(number):
    result = ''
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(ord('a') + remainder) + result
    return result

def convert(container):
    for element in container:
        if element.tag in ('section', 'div'):
            convert(element)
        elif element.tag in ('p', 'h2', 'h3'):
            prefix = {'p': '', 'h2': '## ', 'h3': '### '}[element.tag]
            lines.extend([prefix + inline(element), ''])
        elif element.tag in ('ol', 'ul'):
            classes = element.get('class', '').split()
            indent = '    ' if 'legal-document__list--deep' in classes else '  ' if 'legal-document__list--nested' in classes else ''
            number = int(element.get('start', '1'))
            for item in element:
                if item.tag != 'li':
                    raise ValueError(f'Unsupported list child: {item.tag}')
                marker = '-' if element.tag == 'ul' else alphabetic(number) + ')' if element.get('type') == 'a' else str(number) + '.'
                lines.append(indent + marker + ' ' + inline(item))
                number += 1
            lines.append('')
        else:
            raise ValueError(f'Unsupported block element: {element.tag}')

convert(doc.xpath('./article')[0])
target.write_text('\n'.join(lines) + '\n', encoding='utf-8', newline='\n')
print(f'Converted {source} to {target}')
