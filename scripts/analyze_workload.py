import json

with open('/Users/apple/Desktop/sobermind/src/data/lessons.json', 'r') as f:
    data = json.load(f)

total_body_add = 0
total_reading_add = 0
total_closing_add = 0

for l in data:
    body_needed = max(0, 5500 - len(l['body']))
    reading_needed = max(0, 1200 - len(l['reading']))
    closing_needed = max(0, 350 - len(l['closing']))
    total_body_add += body_needed
    total_reading_add += reading_needed
    total_closing_add += closing_needed

print(f"Total body chars to add: {total_body_add} ({total_body_add/365:.0f} avg per lesson)")
print(f"Total reading chars to add: {total_reading_add} ({total_reading_add/365:.0f} avg per lesson)")
print(f"Total closing chars to add: {total_closing_add} ({total_closing_add/365:.0f} avg per lesson)")
print(f"\nEstimated new content per lesson: ~{(total_body_add+total_reading_add+total_closing_add)/365:.0f} chars")
print(f"Total new content for 365 lessons: ~{(total_body_add+total_reading_add+total_closing_add)/1000:.0f}K chars")
