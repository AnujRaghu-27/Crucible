import sys
import os
import json
import pymupdf


pdf_path = sys.argv[1]

output_dir = "uploads/pdf_pages"

os.makedirs(output_dir, exist_ok=True)

document = pymupdf.open(pdf_path)

pages = []

for page_number, page in enumerate(document):
    output_path = os.path.join(
        output_dir,
        f"page_{page_number + 1}.png"
    )

    pixmap = page.get_pixmap(dpi=150)

    pixmap.save(output_path)

    pages.append({
        "page": page_number + 1,
        "path": output_path
    })

document.close()

print(json.dumps({
    "pageCount": len(pages),
    "pages": pages
}))