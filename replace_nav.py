import os

def replace_navbar_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if '<nav ' not in content:
            return

        import re
        
        # We need to find the start and end of the <nav> element
        # It usually starts with <nav className="sticky top-0
        # and ends with </nav>
        start_idx = content.find('<nav className="sticky top-0')
        if start_idx == -1:
            start_idx = content.find('<nav className="')
        
        if start_idx != -1:
            # find corresponding </nav>
            end_idx = content.find('</nav>', start_idx)
            if end_idx != -1:
                end_idx += len('</nav>')
                
                # Replace with <Navbar />
                new_content = content[:start_idx] + '<Navbar />' + content[end_idx:]
                
                # Add import Navbar at the top if not exists
                if 'import Navbar' not in new_content:
                    lines = new_content.split('\n')
                    for i, line in enumerate(lines):
                        if line.startswith('import ') and 'lucide-react' in line:
                            lines.insert(i + 1, 'import Navbar from "@/components/Navbar";')
                            break
                    new_content = '\n'.join(lines)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Replaced Navbar in {filepath}")
    except Exception as e:
        print(f"Failed on {filepath}: {e}")

files_to_check = [
    r"d:\my start Up\fianny-v2\frontend\src\app\page.tsx",
    r"d:\my start Up\fianny-v2\frontend\src\app\profile\page.tsx",
    r"d:\my start Up\fianny-v2\frontend\src\app\zen\page.tsx",
    r"d:\my start Up\fianny-v2\frontend\src\app\read\[id]\page.tsx"
]

for f in files_to_check:
    if os.path.exists(f):
        replace_navbar_in_file(f)
