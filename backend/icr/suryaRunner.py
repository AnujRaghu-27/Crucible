import sys
import subprocess
import json
import os

image_path = sys.argv[1]

output_dir = "uploads/surya"
os.makedirs(output_dir, exist_ok=True)

command = [
    "surya_ocr",
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
    print(result.stderr)
    sys.exit(1)

print(result.stdout)