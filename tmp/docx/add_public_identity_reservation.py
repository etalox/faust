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


reservation_text = (
    "Reserva de identidad y comunicaciones públicas. Faust podrá, a su sola discreción, mantener reservada o "
    "anonimizada la identidad de El Colaborador en su sitio web, correos electrónicos, propuestas, presentaciones, "
    "conferencias, redes sociales y demás comunicaciones públicas o comerciales. Para ello podrá utilizar seudónimos, "
    "alias, perfiles no identificables, cifras agregadas o aproximadas sobre el número de colaboradores, proyectos o "
    "integrantes de la Expert Network, así como imágenes de archivo, ilustrativas o generadas artificialmente, sin que "
    "ello implique que las personas representadas sean Colaboradores reales, participen en un proyecto específico o "
    "mantengan vínculo con Faust. El Colaborador no adquiere derecho de crédito, atribución pública, mención, "
    "identificación ni exhibición de su imagen por el solo hecho de pertenecer a la Expert Network o participar en una "
    "Asignación. Faust únicamente estará obligado a identificar o proporcionar información precisa sobre El Colaborador "
    "cuando ello sea estrictamente necesario para la ejecución del servicio, el cumplimiento de una obligación legal, "
    "contractual o frente a El Cliente, o cuando Faust lo determine expresamente por escrito."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

authorization = next(
    p for p in document.findall(f".//{{{NS}}}p")
    if text_of(p).startswith("Con el fin de acreditar la capacidad técnica de la Red")
)
new_paragraph = deepcopy(authorization)
set_paragraph_text(new_paragraph, reservation_text)

body = document.find(f"{{{NS}}}body")
body.insert(list(body).index(authorization) + 1, new_paragraph)

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
