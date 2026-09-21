import sys
import subprocess
import json
import os

image_path = sys.argv[1]

output_dir = "uploads/surya"

os.makedirs(output_dir, exist_ok=True)

command = [
    "./venv/bin/surya_ocr",
    image_path,
    "--output_dir",
    output_dir
]

result = subprocess.run(
    command,
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print(result.stderr, file=sys.stderr)
    sys.exit(1)

base_name = os.path.splitext(os.path.basename(image_path))[0]

json_path = os.path.join(
    output_dir,
    base_name,
    "results.json"
)

if not os.path.exists(json_path):
    print("Surya results.json was not created", file=sys.stderr)
    sys.exit(1)

with open(json_path, "r") as file:
    data = json.load(file)

print(json.dumps(data))