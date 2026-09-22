import sys
import json
import os
from PIL import Image


image_path = sys.argv[1]
layout_json = sys.argv[2]

with open(layout_json, "r") as file:
    regions = json.load(file)

image = Image.open(image_path)

base_name = os.path.splitext(os.path.basename(image_path))[0]

output_dir = os.path.join(
    "uploads",
    "regions",
    base_name
)

os.makedirs(output_dir, exist_ok=True)


for index, region in enumerate(regions):
    bbox = region.get("bbox")

    if not bbox:
        continue

    x1, y1, x2, y2 = bbox

    x1 = max(0, int(x1))
    y1 = max(0, int(y1))
    x2 = min(image.width, int(x2))
    y2 = min(image.height, int(y2))

    crop = image.crop((x1, y1, x2, y2))

    region_type = region.get("type", "unknown")

    filename = f"{index}_{region_type}.png"

    output_path = os.path.join(
        output_dir,
        filename
    )

    crop.save(output_path)

    print(json.dumps({
        "index": index,
        "type": region_type,
        "bbox": bbox,
        "reading_order": region.get("reading_order"),
        "path": output_path
    }))