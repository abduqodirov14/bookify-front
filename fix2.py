with open("src/app/book/[id]/page.tsx", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip() == "</div>" and ")}" in lines[i+1]:
        # check if it's line 239
        if i == 239:
            del lines[i]
            break

with open("src/app/book/[id]/page.tsx", "w") as f:
    f.writelines(lines)
print("Removed extra div")