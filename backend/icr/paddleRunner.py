import sys
import os

from paddleocr import PaddleOCR

image_path = sys.argv[1]

ocr = PaddleOCR(lang="en")

result = ocr.predict(image_path)

for res in result:
    for text in res['rec_texts']:
        print(text)