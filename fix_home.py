import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# Replace the Zen button with a Link to /zen
content = content.replace(
    '<button className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors"> \n            <Clock size={22} className="mb-1" /> \n            <span className="text-[10px] font-bold">Zen Mutolaa</span> \n          </button>',
    '<Link href="/zen" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"> \n            <Clock size={22} className="mb-1" /> \n            <span className="text-[10px] font-bold">Zen Mutolaa</span> \n          </Link>'
)

# And make Kutubxona a link if not already (it's the active one on home, but maybe it should link to /?)
content = content.replace(
    '<button className="flex-1 flex flex-col items-center justify-center py-2 text-orange-500">',
    '<Link href="/" className="flex-1 flex flex-col items-center justify-center py-2 text-orange-500 cursor-pointer">'
).replace(
    '<span className="text-[10px] font-bold">Kutubxona</span> \n          </button>',
    '<span className="text-[10px] font-bold">Kutubxona</span> \n          </Link>'
)

# Saqlangan
content = content.replace(
    '<button className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors"> \n            <Heart size={22} className="mb-1" /> \n            <span className="text-[10px] font-bold">Saqlangan</span> \n          </button>',
    '<Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"> \n            <Heart size={22} className="mb-1" /> \n            <span className="text-[10px] font-bold">Saqlangan</span> \n          </Link>'
)

with open("src/app/page.tsx", "w") as f:
    f.write(content)
print("Updated Bottom Nav on Home Page to use Links!")