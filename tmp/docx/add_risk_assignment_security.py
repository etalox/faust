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


def insert_after(body, reference, text):
    paragraph = deepcopy(reference)
    set_paragraph_text(paragraph, text)
    body.insert(list(body).index(reference) + 1, paragraph)
    return paragraph


security_requirement = (
    "Para una Asignación que implique acceso privilegiado o administrativo a infraestructura de producción, servidores, "
    "bases de datos, credenciales maestras, sistemas de pago o información especialmente sensible de Faust o de El Cliente "
    "(una \"Asignación de Riesgo Elevado\"), Faust podrá requerir, como condición previa y en proporción al riesgo, una "
    "o más de las siguientes garantías: seguro de responsabilidad profesional o ciberseguro con cobertura suficiente; "
    "fianza u obligación solidaria de un tercero solvente; o garantía mobiliaria sobre un bien específico de El Colaborador. "
    "La garantía aplicable, su vigencia, cobertura o monto máximo, y, cuando corresponda, la designación de Faust y/o de "
    "El Cliente como beneficiario, deberán constar expresamente en la Asignación o en su anexo."
)

security_formalities = (
    "Cuando se pacte una garantía sobre un bien, el instrumento respectivo deberá identificarlo de forma individual, "
    "acreditar razonablemente su titularidad y situación de gravámenes, señalar el importe máximo garantizado y cumplir "
    "las formalidades e inscripciones que resulten aplicables. La garantía sólo respaldará responsabilidades determinadas "
    "y cuantificadas conforme a esta Cláusula y no constituirá gravamen general sobre el patrimonio de El Colaborador ni "
    "autorizará a Faust o a El Cliente a apropiarse, embargar o disponer unilateralmente del bien. La falta de constitución, "
    "renovación o conservación de una garantía exigida facultará a Faust para no otorgar o suspender accesos, revocarlos, "
    "suspender o no emitir la Asignación correspondiente y reasignar sus actividades, sin perjuicio de los derechos de pago "
    "que ya hubieren quedado válidamente devengados y de las vías de cobro legalmente procedentes."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

body = document.find(f"{{{NS}}}body")
anchor = next(
    p for p in body.findall(f"{{{NS}}}p")
    if text_of(p).startswith("Si la responsabilidad corresponde a El Colaborador, el importe cuantificado")
)
first = insert_after(body, anchor, security_requirement)
insert_after(body, first, security_formalities)

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
