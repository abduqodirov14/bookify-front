import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# Remove the bottom nav from page.tsx
content = re.sub(r'\{\/\* Floating Bottom Navigation Bar.*?<\/div>\s*<\/div>', '', content, flags=re.DOTALL)
with open("src/app/page.tsx", "w") as f:
    f.write(content)

with open("src/app/book/[id]/page.tsx", "r") as f:
    content2 = f.read()

# Remove the bottom nav from book/[id]/page.tsx
content2 = re.sub(r'\{\/\* FIXED BOTTOM NAVIGATION BAR.*?<\/div>\s*<\/div>', '', content2, flags=re.DOTALL)
with open("src/app/book/[id]/page.tsx", "w") as f:
    f.write(content2)

print("Removed hardcoded navs")