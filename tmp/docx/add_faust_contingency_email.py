from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile
import os
import xml.etree.ElementTree as ET


SOURCE = next(Path("legal/colaboradores").glob("*.docx"))
NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"
ET.register_namespace("w", NS)
ALTERNATE = "francohumbertoquinonesramirez@gmail.com"


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


old_declaration = (
    "Que para efectos de estos Términos utiliza comercialmente el nombre FaustPartners™, el sitio web faust.mx y el "
    "correo electrónico oficial contacto@faust.mx, los cuales señala como sus medios oficiales de comunicación y "
    "notificación, sin perjuicio de otros medios que comunique expresamente a El Colaborador."
)
new_declaration = (
    "Que para efectos de estos Términos utiliza comercialmente el nombre FaustPartners™, el sitio web faust.mx y el "
    "correo electrónico oficial contacto@faust.mx, los cuales señala como sus medios oficiales de comunicación y "
    "notificación. Únicamente en caso de imposibilidad material de acceso o uso de los correos empresariales con "
    "dominio @faust.mx, Faust podrá utilizar el correo alternativo " + ALTERNATE + " para dichos efectos, sin perjuicio "
    "de otros medios que comunique expresamente a El Colaborador."
)

old_notice = (
    "Salvo disposición específica distinta en estos Términos, un aviso enviado por Faust desde contacto@faust.mx se "
    "tendrá por notificado cuando ingrese en el sistema de información correspondiente al correo electrónico oficial "
    "designado por El Colaborador, sin que sea necesario acreditar su apertura o lectura, salvo que exista rebote, "
    "rechazo o error técnico comprobable atribuible a Faust."
)
new_notice = (
    "Salvo disposición específica distinta en estos Términos, un aviso enviado por Faust desde contacto@faust.mx o, "
    "únicamente en caso de imposibilidad material de acceso o uso de los correos empresariales con dominio @faust.mx, "
    "desde " + ALTERNATE + " se tendrá por notificado cuando ingrese en el sistema de información correspondiente al "
    "correo electrónico oficial designado por El Colaborador, sin que sea necesario acreditar su apertura o lectura, "
    "salvo que exista rebote, rechazo o error técnico comprobable atribuible a Faust."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

declaration = next(
    p for p in document.findall(f".//{{{NS}}}p")
    if text_of(p) == old_declaration
)
notice = next(
    p for p in document.findall(f".//{{{NS}}}p")
    if old_notice in text_of(p)
)
set_paragraph_text(declaration, new_declaration)
set_paragraph_text(notice, text_of(notice).replace(old_notice, new_notice))

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
