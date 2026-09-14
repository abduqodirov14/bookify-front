import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

if "import Link from" not in content:
    content = content.replace("import Image from", "import Image from \"next/image\";\nimport Link from \"next/link\";\n// import Image from")

content = content.replace('<div className="group cursor-pointer">', '<Link href="/book/1" className="group cursor-pointer block">')
content = content.replace('Abdulla Qodiriy</p>\n              </div>\n            </div>', 'Abdulla Qodiriy</p>\n              </div>\n            </Link>')
content = content.replace('F. Dostoyevskiy</p>\n              </div>\n            </div>', 'F. Dostoyevskiy</p>\n              </div>\n            </Link>')
content = content.replace('<button className="flex-1 sm:flex-none bg-orange-500', '<Link href="/book/1" className="flex-1 sm:flex-none bg-orange-500 flex items-center justify-center')
content = content.replace('Mutolaani boshlash\n                </button>', 'Mutolaani boshlash\n                </Link>')

with open("src/app/page.tsx", "w") as f:
    f.write(content)
print("Links updated successfully")