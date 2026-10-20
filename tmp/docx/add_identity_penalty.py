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


replacement = (
    "El Colaborador se abstendrá, desde la aceptación de los presentes Términos y con posterioridad a su "
    "terminación mientras el uso pueda generar confusión o aparentar una afiliación, autorización, patrocinio "
    "o relación comercial con Faust, de registrar, adquirir, mantener, operar, promover o apoyar, directa o "
    "indirectamente, cualquier dominio, perfil, marca, nombre comercial, sitio web o comunicación que "
    "incorpore o sea semejante en grado de confusión a “Faust”, “Faust Partners”, “FaustPartners”, sus marcas, "
    "logotipos u otros signos distintivos, o que sugiera una afiliación, autorización, patrocinio o relación "
    "comercial inexistente con Faust. La declaración de una actividad preexistente no implica autorización para "
    "continuarla; cualquier uso posterior requerirá autorización previa y escrita de Faust. El incumplimiento "
    "de este párrafo obligará a El Colaborador a pagar a Faust, como pena convencional, $100,000.00 M.N. por "
    "cada dominio, perfil, marca, nombre comercial, sitio web o comunicación que opere, mantenga, promueva o "
    "apoye en contravención. Faust podrá exigir el cumplimiento o la pena convencional, sin acumular ambas "
    "respecto del mismo incumplimiento. La pena no autorizará la continuación de la conducta, por lo que El "
    "Colaborador deberá cesarla y retirar o corregir de inmediato los elementos infractores, sin perjuicio de la "
    "suspensión de accesos, terminación y demás medidas no patrimoniales previstas en estos Términos."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

paragraph = next(
    p for p in document.findall(f".//{{{NS}}}p")
    if text_of(p).startswith("El Colaborador se abstendrá, desde la aceptación de los presentes Términos")
)
set_paragraph_text(paragraph, replacement)

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
