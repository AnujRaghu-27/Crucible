import sys
import json
import subprocess
import os


pdf_path = sys.argv[1]
model = sys.argv[2]

# Run PDF → page images
pdf_result = subprocess.run(
    [
        "./venv/bin/python",
        "icr/pdfRunner.py",
        pdf_path
    ],
    capture_output=True,
    text=True
)

if pdf_result.returncode != 0:
    print(pdf_result.stderr, file=sys.stderr)
    sys.exit(1)

pdf_data = json.loads(pdf_result.stdout)

pages = []

for page in pdf_data["pages"]:
    page_number = page["page"]
    image_path = page["path"]

    if model == "surya":
        runner = "icr/suryaRunner.py"
    else:
        runner = "icr/paddleRunner.py"

    result = subprocess.run(
        [
            "./venv/bin/python",
            runner,
            image_path
        ],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        sys.exit(1)

    if model == "surya":
        try:
            page_result = json.loads(result.stdout)
        except json.JSONDecodeError:
            print(
                f"Invalid Surya JSON on page {page_number}",
                file=sys.stderr
            )
            sys.exit(1)
    else:
        page_result = result.stdout

    pages.append({
        "page": page_number,
        "result": page_result
    })

print(json.dumps({
    "success": True,
    "model": model,
    "pageCount": len(pages),
    "pages": pages
}))