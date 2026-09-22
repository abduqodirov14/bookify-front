with open('src/views/BookDetail.tsx', 'r', encoding='utf-8') as f:
    bd = f.read()

import re
bd = re.sub(
    r'(\s*Bob ma\'lumotlari yuklanmoqda\s*</div>\s*)\s*\}\)\s*</div>\s*</div>\s*\)\s*\}',
    r'\1            )}\n          </div>\n        </div>\n      </div>\n    </div>\n  )\n}',
    bd
)
with open('src/views/BookDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(bd)
