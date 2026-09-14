import re

with open("src/app/layout.tsx", "r") as f:
    content = f.read()

content = content.replace('import BottomNav from "@/components/BottomNav";\n', '')
content = content.replace('<BottomNav />\n', '')

with open("src/app/layout.tsx", "w") as f:
    f.write(content)
print("Removed BottomNav from layout.tsx")