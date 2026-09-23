import sys
import subprocess
import json
import os
import shutil


pdf_path = sys.argv[1]
page_number = int(sys.argv[2])

output_dir = "uploads/surya_pdf_pages"

os.makedirs(output_dir, exist_ok=True)

# Surya uses 0-based page indexes
page_index = page_number - 1

command = [
    "./venv/bin/surya_ocr",
    pdf_path,
    "--page_range",
    str(page_index),
    "--output_dir",
    output_dir,
    "--keep_server"
]

result = subprocess.run(
    command,
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print(result.stderr, file=sys.stderr)
    sys.exit(1)


base_name = os.path.splitext(
    os.path.basename(pdf_path)
)[0]

json_path = os.path.join(
    output_dir,
    base_name,
    "results.json"
)

if not os.path.exists(json_path):
    print(
        f"Surya results.json was not created: {json_path}",
        file=sys.stderr
    )
    sys.exit(1)


with open(json_path, "r") as file:
    data = json.load(file)


# Return only the requested page
pages = data.get(base_name, [])

if not pages:
    print(
        "No page result found",
        file=sys.stderr
    )
    sys.exit(1)


print(json.dumps(pages[0]))