import pymupdf

pdf_path = "uploads/1790105009848.pdf"

document = pymupdf.open(pdf_path)

page = document[0]

pixmap = page.get_pixmap(dpi=100)

pixmap.save("uploads/test_page_100dpi.png")

document.close()

print("Saved test_page_100dpi.png")