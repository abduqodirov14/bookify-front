import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# I will just replace the entire Bottom Nav section!
old_nav = """      {/* Floating Bottom Navigation Bar (iOS Style) */} 
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"> 
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[32px] p-2 flex items-center justify-between"> 
          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-2 text-orange-500 cursor-pointer"> 
            <BookOpen size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Kutubxona</span> 
          </button> 
          <button className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors"> 
            <Clock size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Zen Mutolaa</span> 
          </button> 
          <button className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors"> 
            <Heart size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Saqlangan</span> 
          </button> 
        </div> 
      </div>"""

# Wait, let's just use regex to replace everything from "Floating Bottom Navigation Bar (iOS Style)" to "</div> \n    </div>"

new_nav = """      {/* Floating Bottom Navigation Bar (iOS Style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[32px] p-2 flex items-center justify-between">
          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-2 text-orange-500 cursor-pointer">
            <BookOpen size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Kutubxona</span>
          </Link>
          <Link href="/zen" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
            <Clock size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Zen Mutolaa</span>
          </Link>
          <Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
            <Heart size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Saqlangan</span>
          </Link>
        </div>
      </div>"""

content = re.sub(r'\{\/\* Floating Bottom Navigation Bar.*?<\/div>\s*<\/div>', new_nav, content, flags=re.DOTALL)

with open("src/app/page.tsx", "w") as f:
    f.write(content)
print("Replaced completely via regex")