with open('src/views/BookDetail.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

import re
c = re.sub(
    r'(<span className="font-mono text-xs text-muted ml-2">\{book\.rating \|\| 4\.5\}</span>\s*)<span',
    r'\1</div>\n              <span',
    c
)

with open('src/views/BookDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
