"""Verify format fixes applied correctly"""
import json

with open('/Users/apple/Desktop/sobermind/src/data/lessons.json', 'r') as f:
    data = json.load(f)

errors = []

for l in data:
    # Check closing doesn't start with ##
    if l['closing'].startswith('## '):
        errors.append(f"Day {l['day_number']}: closing still has ## header")
    
    # Check body has no bare section headings
    for line in l['body'].split('\n\n'):
        stripped = line.strip()
        for num in ['一、', '二、', '三、', '四、', '五、', '六、', '七、', '八、']:
            if stripped.startswith(num) and not stripped.startswith('## '):
                errors.append(f"Day {l['day_number']}: bare heading: {stripped[:40]}")
                break
    
    # Count ## headings in body
    h2_count = l['body'].count('\n## ') + (1 if l['body'].startswith('## ') else 0)
    if h2_count < 2:
        errors.append(f"Day {l['day_number']}: only {h2_count} h2 headings")

print(f"Checked {len(data)} lessons, errors: {len(errors)}")
for e in errors[:20]:
    print(f"  {e}")
if len(errors) > 20:
    print(f"  ... and {len(errors)-20} more")
print("\nFormat check complete!")
