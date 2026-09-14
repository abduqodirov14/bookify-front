import re

with open("src/app/read/[id]/page.tsx", "r") as f:
    content = f.read()

# Replace React.use(params) with useParams()
if "useParams" not in content:
    content = content.replace('import { ArrowLeft, Clock', 'import { useParams } from "next/navigation";\nimport { ArrowLeft, Clock')

content = content.replace(
    'export default function ReadBookPage({ params }: { params: Promise<{ id: string }> }) {',
    'export default function ReadBookPage() {'
)
content = content.replace(
    '  const { id } = React.use(params);',
    '  const params = useParams();\n  const id = params.id as string;'
)
with open("src/app/read/[id]/page.tsx", "w") as f:
    f.write(content)

# Same for book/[id]/page.tsx if it's a client component
with open("src/app/book/[id]/page.tsx", "r") as f:
    bookContent = f.read()

if "useParams" not in bookContent and '"use client"' in bookContent:
    bookContent = bookContent.replace('import { ArrowLeft,', 'import { useParams } from "next/navigation";\nimport { ArrowLeft,')
    bookContent = re.sub(r'export default function BookDetailPage\(\{ params \}: \{ params: \{ id: string \} \}\) \{', 'export default function BookDetailPage() {\n  const params = useParams();\n  const id = params.id as string;', bookContent)
    bookContent = bookContent.replace('params.id', 'id')
    with open("src/app/book/[id]/page.tsx", "w") as f:
        f.write(bookContent)
print("Fixed useParams")