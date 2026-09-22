import sys
import json

from paddleocr import PPStructureV3


image_path = sys.argv[1]

pipeline = PPStructureV3()

results = pipeline.predict(
    image_path
)

for result in results:
    data = result.json

    if isinstance(data, str):
        data = json.loads(data)

    print(json.dumps(data))