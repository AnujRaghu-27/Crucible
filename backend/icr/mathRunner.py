import sys
import json

from paddleocr import FormulaRecognition


image_path = sys.argv[1]

model = FormulaRecognition(
    model_name="UniMERNet"
)

results = model.predict(
    image_path,
    batch_size=1
)

for result in results:
    data = result.json

    if isinstance(data, str):
        data = json.loads(data)

    print(json.dumps({
        "type": "Equation",
        "model": "UniMERNet",
        "text": data["res"]["rec_formula"]
    }))