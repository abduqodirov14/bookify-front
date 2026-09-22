with open('src/views/BookDetail.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "Bob ma'lumotlari yuklanmoqda" in line:
        new_lines.append(line)
        new_lines.append("              </div>\n")
        new_lines.append("            )}\n")
        new_lines.append("          </div>\n")
        new_lines.append("        </div>\n")
        new_lines.append("      </div>\n")
        new_lines.append("    </div>\n")
        new_lines.append("  )\n")
        new_lines.append("}\n")
        break
    else:
        new_lines.append(line)

with open('src/views/BookDetail.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
