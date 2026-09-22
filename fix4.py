with open('src/views/BookDetail.tsx', 'r', encoding='utf-8') as f:
    bd = f.read()

import re
bd = re.sub(
    r'(Bob ma\'lumotlari yuklanmoqda\s*</div>\s*)</div>(\s*)\)}',
    r'\1\2)}',
    bd
)
with open('src/views/BookDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(bd)
