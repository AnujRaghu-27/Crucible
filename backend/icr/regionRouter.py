import sys
import json


layout_json = sys.argv[1]

with open(layout_json, "r") as file:
    regions = json.load(file)


for region in regions:
    region_type = region.get("type")
    index = region.get("reading_order")

    if region_type == "Equation":
        model = "UniMERNet"

    elif region_type == "Table":
        model = "PP-StructureV3"

    elif region_type == "Text":
        model = "Handwriting"

    elif region_type in ["Figure", "Image"]:
        model = "Graph/Diagram"

    else:
        model = "Other"

    print(json.dumps({
        "region": index,
        "type": region_type,
        "model": model
    }))