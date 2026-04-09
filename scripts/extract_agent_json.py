#!/usr/bin/env python3
"""Extract JSON array from agent output file and save it."""
import sys
import json
import re

if len(sys.argv) < 3:
    print("Usage: python3 extract_agent_json.py <input_file> <output_file>")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(input_file, 'r', errors='replace') as f:
    content = f.read()

# Find JSON array starting with [{
matches = list(re.finditer(r'\[\s*\{', content))
if not matches:
    print("No JSON array found")
    sys.exit(1)

start = matches[-1].start()
depth = 0
i = start
while i < len(content):
    if content[i] == '[':
        depth += 1
    elif content[i] == ']':
        depth -= 1
        if depth == 0:
            break
    i += 1

json_str = content[start:i+1]
try:
    data = json.loads(json_str)
    print(f"Found {len(data)} questions")
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Saved to {output_file}")
except Exception as e:
    print(f"Parse error: {e}")
    print("First 500 chars of found JSON:", json_str[:500])
    sys.exit(1)
