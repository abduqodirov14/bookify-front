with open("src/app/book/[id]/page.tsx", "r") as f:
    lines = f.readlines()

# The pill starts at line 239 (index 238) and ends at line 259 (index 258)
# Wait, let's find the exact indices.
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "{/* 3-Button Action Pill" in line and i > 230:
        start_idx = i
        break

if start_idx != -1:
    # Find the closing tag of the pill div
    # Count open/close divs
    div_count = 0
    for i in range(start_idx + 1, len(lines)):
        line = lines[i]
        if "<div" in line: div_count += 1
        if "</div" in line: div_count -= 1
        if div_count == -1 or ("</div>" in line and "}" not in line and i > start_idx + 15):
            end_idx = i
            break

    print(f"Removing lines {start_idx} to {end_idx}")
    if end_idx != -1:
        del lines[start_idx:end_idx+2] # remove the extra </div> if it was dangling
        with open("src/app/book/[id]/page.tsx", "w") as f:
            f.writelines(lines)
        print("Success")