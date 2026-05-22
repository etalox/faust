from html.parser import HTMLParser

class MyParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.legends = []
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        class_str = attrs_dict.get('class', '')
        node = {'tag': tag, 'class': class_str, 'children': []}
        if self.stack:
            self.stack[-1]['children'].append(node)
        self.stack.append(node)
        
        if 'canvas-legend' in class_str:
            path = [(n['tag'], n['class']) for n in self.stack]
            self.legends.append(path)
            
    def handle_endtag(self, tag):
        if self.stack:
            for i in reversed(range(len(self.stack))):
                if self.stack[i]['tag'] == tag:
                    self.stack = self.stack[:i]
                    break

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to sanitize void elements to avoid stack issues.
# simple hack: replace <path ... /> with nothing since we only care about divs
import re
content = re.sub(r'<path[^>]*>', '', content)
content = re.sub(r'<stop[^>]*>', '', content)
content = re.sub(r'<br[^>]*>', '', content)

parser = MyParser()
parser.feed(content)

for i, legend_path in enumerate(parser.legends):
    print(f'Legend {i}:')
    for depth, (tag, cls) in enumerate(legend_path):
        indent = "  " * depth
        print(f'{indent}<{tag} class="{cls}">')
