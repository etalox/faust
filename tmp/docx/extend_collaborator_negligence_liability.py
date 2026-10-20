from copy import deepcopy
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


liability_text = (
    "Sin perjuicio de las obligaciones que legalmente correspondan a Faust frente a terceros, entre las partes "
    "El Colaborador responderá y mantendrá en paz y a salvo a Faust por los daños directos, gastos razonables de "
    "contención, investigación y reparación, y reclamaciones de terceros que se acrediten como consecuencia directa "
    "de actos u omisiones imputables a El Colaborador, incluidos el incumplimiento de estos Términos, negligencia, "
    "negligencia grave, dolo, tratamiento, divulgación, pérdida, alteración o acceso no autorizado a Datos "
    "Confidenciales o datos personales, así como la entrega o implementación de código, scripts, configuraciones o "
    "materiales que contengan vulnerabilidades o elementos nocivos atribuibles a El Colaborador. El Colaborador no "
    "responderá por daños derivados exclusivamente de instrucciones documentadas de Faust o El Cliente, sistemas o "
    "materiales preexistentes, actos de terceros fuera de su control o caso fortuito o fuerza mayor, salvo que su "
    "actuación haya contribuido directamente al daño."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

paragraphs = document.findall(f".//{{{NS}}}p")
limitations = next(
    p for p in paragraphs
    if text_of(p).startswith("Ninguna de las partes responderá frente a la otra por daños indirectos")
)
new_paragraph = deepcopy(limitations)
set_paragraph_text(new_paragraph, liability_text)

body = document.find(f"{{{NS}}}body")
body.insert(list(body).index(limitations) + 1, new_paragraph)

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
