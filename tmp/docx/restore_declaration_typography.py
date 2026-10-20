from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile
import os
import xml.etree.ElementTree as ET


SOURCE = next(Path("legal/colaboradores").glob("*.docx"))
NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
ET.register_namespace("w", NS)


def text_of(element):
    return "".join(node.text or "" for node in element.iter(f"{{{NS}}}t"))


with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

body = document.find(f"{{{NS}}}body")
target = next(
    p for p in body.findall(f"{{{NS}}}p")
    if text_of(p).startswith("Que para efectos de estos Términos utiliza comercialmente el nombre FaustPartners™")
)
target_index = list(body).index(target)
previous = list(body)[target_index - 1]
source_run = previous.find(f"{{{NS}}}r")
target_run = target.find(f"{{{NS}}}r")
source_rpr = source_run.find(f"{{{NS}}}rPr")
if source_rpr is None:
    raise ValueError("Reference typography not found")
existing_rpr = target_run.find(f"{{{NS}}}rPr")
if existing_rpr is not None:
    target_run.remove(existing_rpr)
target_run.insert(0, deepcopy(source_rpr))

with NamedTemporaryFile(delete=False, suffix=".docx", dir=SOURCE.parent) as temp:
    temporary_path = Path(temp.name)
try:
    with ZipFile(temporary_path, "w", ZIP_DEFLATED) as revised:
        for item, content in archive_items:
            if item.filename == "word/document.xml":
                revised.writestr(item, ET.tostring(document, encoding="utf-8", xml_declaration=True))
            else:
                revised.writestr(item, content)
    os.replace(temporary_path, SOURCE)
finally:
    if temporary_path.exists():
        temporary_path.unlink()

print(SOURCE)
