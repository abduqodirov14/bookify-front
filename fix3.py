with open('src/views/Admin.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
import re
# Fix Badge
c = re.sub(
    r'(\s*</span>\s*\))\s*</div>',
    r'\1\n}',
    c
)
with open('src/views/Admin.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

with open('src/views/BookDetail.tsx', 'r', encoding='utf-8') as f:
    bd = f.read()
bd = re.sub(
    r'(Bob ma\'lumotlari yuklanmoqda\s*</div>\s*</div>)',
    r'\1\n            )}',
    bd
)
with open('src/views/BookDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(bd)
