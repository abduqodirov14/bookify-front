import re

with open('src/views/Admin.tsx', 'r', encoding='utf-8') as f:
    ad = f.read()

ad = re.sub(
    r'(\s*<span className=".*">\s*\{labels\[status\]\}\s*</span>\s*\))(\s*</div>)',
    r'\1\n}',
    ad
)
with open('src/views/Admin.tsx', 'w', encoding='utf-8') as f:
    f.write(ad)
