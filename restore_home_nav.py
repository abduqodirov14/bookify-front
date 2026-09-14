import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

original_nav = """      {/* Floating Bottom Navigation Bar (iOS Style) */} 
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"> 
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[32px] p-2 flex items-center justify-between"> 
          
          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-2 text-orange-500 hover:text-orange-600 transition-colors"> 
            <BookOpen size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Kutubxona</span> 
          </Link> 
          
          <Link href="/zen" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-900 transition-colors"> 
            <Clock size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Zen Mutolaa</span> 
          </Link> 
          
          <Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-red-500 transition-colors"> 
            <Heart size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Saqlangan</span> 
          </Link> 
          
          <Link href="/profile" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-blue-500 transition-colors"> 
            <User size={22} className="mb-1" /> 
            <span className="text-[10px] font-bold">Profil</span> 
          </Link>

        </div> 
      </div> 
 
    </div>"""

if "Floating Bottom Navigation Bar" not in content:
    content = content.replace("    </div>\n  );\n}", original_nav + "\n  );\n}")

# Also need to make sure User, Link are imported
if "import { User " not in content and "User," not in content:
    content = content.replace("BookOpen, Clock, Heart", "BookOpen, Clock, Heart, User")

with open("src/app/page.tsx", "w") as f:
    f.write(content)
print("Restored bottom nav in page.tsx")