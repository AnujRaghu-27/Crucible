import sys

from paddleocr import PaddleOCR

image_path = sys.argv[1]

ocr = PaddleOCR(
    lang="en",
    text_detection_model_name="PP-OCRv6_tiny_det",
    text_recognition_model_name="PP-OCRv6_tiny_rec",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False
)

result = ocr.predict(image_path)

for res in result:
    for text in res['rec_texts']:
        print(text)