from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile
import os
import xml.etree.ElementTree as ET

SOURCE = Path("legal/colaboradores/Términos y Condiciones _  FaustPartners™.docx")
NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"
ET.register_namespace("w", NS)


def text_of(element):
    return "".join(node.text or "" for node in element.iter(f"{{{NS}}}t"))


def set_paragraph_text(paragraph, text):
    runs = paragraph.findall(f"{{{NS}}}r")
    if not runs:
        raise ValueError("Paragraph has no run")
    first_run = runs[0]
    text_nodes = list(first_run.iter(f"{{{NS}}}t"))
    if not text_nodes:
        text_nodes = [ET.SubElement(first_run, f"{{{NS}}}t")]
    text_nodes[0].text = text
    if text.startswith(" ") or text.endswith(" "):
        text_nodes[0].set(XML_SPACE, "preserve")
    for node in text_nodes[1:]:
        first_run.remove(node)
    for run in runs[1:]:
        paragraph.remove(run)


evidence_text = (
    "El Colaborador deberá conservar y proporcionar, a requerimiento escrito de Faust sustentado en indicios "
    "razonables, la documentación directamente relacionada con la conducta investigada. La omisión injustificada "
    "constituirá incumplimiento esencial y facultará a Faust para cuantificar la pena con base en la evidencia "
    "documental, pública o de terceros razonablemente disponible."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

penalty = next(
    p for p in document.findall(f".//{{{NS}}}p")
    if text_of(p).startswith("La pena convencional será equivalente exclusivamente")
)
new_paragraph = deepcopy(penalty)
set_paragraph_text(new_paragraph, evidence_text)

body = document.find(f"{{{NS}}}body")
body.insert(list(body).index(penalty) + 1, new_paragraph)

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
