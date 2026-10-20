from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile
import os
import xml.etree.ElementTree as ET


SOURCE = next(Path("legal/colaboradores").glob("*.docx"))
NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"
ET.register_namespace("w", NS)


def text_of(element):
    return "".join(node.text or "" for node in element.iter(f"{{{NS}}}t"))


new_declaration = (
    "Que para efectos de estos Términos utiliza comercialmente el nombre FaustPartners™, el sitio web faust.mx y el "
    "correo electrónico oficial contacto@faust.mx, los cuales señala como sus medios oficiales de comunicación y "
    "notificación. Únicamente en caso de imposibilidad material de acceso o uso de los correos empresariales con "
    "dominio @faust.mx, Faust podrá utilizar el correo alternativo "
    "francohumbertoquinonesramirez@gmail.com para dichos efectos, sin perjuicio de otros medios que comunique "
    "expresamente a El Colaborador."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

target = next(
    p for p in document.findall(f".//{{{NS}}}p")
    if text_of(p).startswith("Que para efectos de estos Términos utiliza comercialmente el nombre FaustPartners™")
)
for child in list(target):
    if child.tag != f"{{{NS}}}pPr":
        target.remove(child)
run = ET.SubElement(target, f"{{{NS}}}r")
text = ET.SubElement(run, f"{{{NS}}}t")
text.text = new_declaration
if new_declaration.startswith(" ") or new_declaration.endswith(" "):
    text.set(XML_SPACE, "preserve")

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
