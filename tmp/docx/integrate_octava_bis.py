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


first_paragraph = (
    "Conflictos de interés e identidad comercial. El Colaborador declara, bajo protesta de decir verdad, "
    "que antes de aceptar estos Términos ha informado a Faust cualquier empresa, marca, dominio, perfil, "
    "sitio web, proyecto o actividad propia o de un tercero con la que tenga participación, control, beneficio "
    "o vínculo relevante y que pueda competir con Faust, generar confusión sobre su identidad comercial o "
    "comprometer el tratamiento de Datos Confidenciales. Deberá comunicar cualquier circunstancia sobrevenida "
    "de esta naturaleza dentro de los 2 (dos) días hábiles siguientes a que la conozca. La existencia de una "
    "actividad preexistente no constituye por sí sola un incumplimiento ni una prohibición general de competencia; "
    "la omisión, falsedad o actualización incompleta de esta declaración sí constituirá incumplimiento esencial."
)

identity_paragraph = (
    "Durante la vigencia de los presentes Términos, El Colaborador se abstendrá de registrar, adquirir, "
    "mantener, operar, promover o apoyar, directa o indirectamente, cualquier dominio, perfil, marca, nombre "
    "comercial, sitio web o comunicación que incorpore o sea semejante en grado de confusión a “Faust”, “Faust "
    "Partners”, “FaustPartners”, sus marcas, logotipos u otros signos distintivos, o que sugiera una afiliación, "
    "autorización, patrocinio o relación comercial inexistente con Faust. La declaración de una actividad "
    "preexistente no implica autorización para continuarla; cualquier uso posterior requerirá autorización previa "
    "y escrita de Faust. Las obligaciones previstas en este párrafo sobrevivirán a la terminación de los "
    "Términos mientras el uso pueda generar confusión o aparentar una afiliación, autorización, patrocinio o "
    "relación comercial con Faust."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

paragraphs = document.findall(f".//{{{NS}}}p")
bis_heading = next(p for p in paragraphs if text_of(p).startswith("Octava Bis. Conflictos"))
heading_index = paragraphs.index(bis_heading)
first_body = paragraphs[heading_index + 1]
second_body = paragraphs[heading_index + 2]

set_paragraph_text(first_body, first_paragraph)
set_paragraph_text(second_body, identity_paragraph)

body = document.find(f"{{{NS}}}body")
body.remove(bis_heading)

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
