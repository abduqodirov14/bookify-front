import re

with open("src/app/book/[id]/page.tsx", "r") as f:
    content = f.read()

# We need to insert the 3-button Action Pill back under the "Tinglash" button.
pill_code = """
          </div>

          {/* 3-Button Action Pill (Kutubxona, Zen Mutolaa, Saqlangan) */}
          <div className="w-full sm:w-[400px] mt-8 bg-white rounded-[32px] shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-gray-100 p-2 flex items-center justify-between relative z-30">
            <Link href="/" className="flex-1 flex flex-col items-center justify-center py-3 gap-1.5 hover:bg-orange-50/50 rounded-[24px] transition-colors cursor-pointer group">
              <BookOpen size={24} className="text-orange-500" strokeWidth={2} />
              <span className="text-[11px] font-extrabold text-orange-500 tracking-wide">Kutubxona</span>
            </Link>
            
            <Link href="/zen" className="flex-1 flex flex-col items-center justify-center py-3 gap-1.5 hover:bg-slate-50/50 rounded-[24px] transition-colors cursor-pointer group">
              <Clock size={24} className="text-[#5B6371] group-hover:text-slate-900" strokeWidth={2} />
              <span className="text-[11px] font-extrabold text-[#5B6371] group-hover:text-slate-900 tracking-wide">Zen Mutolaa</span>
            </Link>

            <Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-3 gap-1.5 hover:bg-red-50/50 rounded-[24px] transition-colors cursor-pointer group">
              <Heart size={24} className="text-[#87909E] group-hover:text-red-500" strokeWidth={2} />
              <span className="text-[11px] font-extrabold text-[#87909E] group-hover:text-red-500 tracking-wide">Saqlangan</span>
            </Link>
          </div>
"""

# Find where to insert it. It was right after:
#               <Headphones size={20} /> 
#               Tinglash 
#             </button> 
#           </div> 
target = """              <Headphones size={20} /> 
              Tinglash 
            </button> 
          </div>"""

if target in content:
    content = content.replace(target, target.replace('          </div>', pill_code))
    with open("src/app/book/[id]/page.tsx", "w") as f:
        f.write(content)
    print("Restored 3-button pill successfully")
else:
    print("Target not found. Doing regex...")
    # fallback
    content = re.sub(r'(Tinglash\s*<\/button>\s*<\/div>)', r'\1' + pill_code, content)
    with open("src/app/book/[id]/page.tsx", "w") as f:
        f.write(content)
    print("Restored via regex")