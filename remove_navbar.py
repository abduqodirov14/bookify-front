import os

files_to_check = [
    r"d:\my start Up\fianny-v2\frontend\src\app\page.tsx",
    r"d:\my start Up\fianny-v2\frontend\src\app\profile\page.tsx",
    r"d:\my start Up\fianny-v2\frontend\src\app\zen\page.tsx",
    r"d:\my start Up\fianny-v2\frontend\src\app\read\[id]\page.tsx"
]

for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        import re
        
        # Remove import
        content = re.sub(r'import Navbar from "@/components/Navbar";\n', '', content)
        
        # Remove <Navbar />
        content = content.replace('<Navbar />\n', '')
        content = content.replace('<Navbar />', '')
        content = content.replace('{/* iOS Style Minimal Navbar */}\n', '')
        content = content.replace('{/* Top Navbar */}\n', '')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Removed Navbar from {filepath}")
    except Exception as e:
        print(f"Failed on {filepath}: {e}")
