"""
Phase 1: Fix all formatting issues in lessons.json
- Convert bare section headings in body (一、二、三、四、) to ## format
- Strip ## headers from closing field
"""
import json, re

INPUT = '/Users/apple/Desktop/sobermind/src/data/lessons.json'
OUTPUT = '/Users/apple/Desktop/sobermind/src/data/lessons.json'

with open(INPUT, 'r') as f:
    data = json.load(f)

fix_count_body = 0
fix_count_closing = 0

for l in data:
    # Fix body: convert bare section headings to ## format
    # Pattern: lines starting with 一、 or 二、 etc but NOT ##
    lines = l['body'].split('\n\n')
    new_lines = []
    for line in lines:
        stripped = line.strip()
        # Check if this line starts with a Chinese number marker but not already a heading
        match = re.match(r'^([一二三四五六七八九十])、(.+)$', stripped)
        if match and not stripped.startswith('##'):
            # Convert to ## format
            new_lines.append(f'## {stripped}')
            fix_count_body += 1
        else:
            new_lines.append(line)
    l['body'] = '\n\n'.join(new_lines)
    
    # Fix closing: strip ## headers
    closing = l['closing']
    # Remove leading ## 今日结语 or ## 🪷 今日结语 headers
    closing = re.sub(r'^##\s*[\U0001fab7]?\s*今日结语\s*\n*', '', closing)
    # Also remove any variant
    closing = re.sub(r'^##\s*.*?结语\s*\n*', '', closing)
    if closing != l['closing']:
        fix_count_closing += 1
    l['closing'] = closing.strip()

# Fix reading field: remove any markdown headers too
for l in data:
    l['reading'] = l['reading'].strip()

print(f"Fixed {fix_count_body} bare section headings in body")
print(f"Fixed {fix_count_closing} closing headers")
print(f"Total lessons processed: {len(data)}")

with open(OUTPUT, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Saved to {OUTPUT}")
