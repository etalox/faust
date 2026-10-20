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


def replace_paragraph_text(paragraph, text):
    runs = paragraph.findall(f"{{{NS}}}r")
    if not runs:
        raise ValueError("Template paragraph has no run")
    first_run = deepcopy(runs[0])
    run_properties = first_run.find(f"{{{NS}}}rPr")
    for child in list(first_run):
        if child.tag != f"{{{NS}}}rPr":
            first_run.remove(child)
    text_node = ET.SubElement(first_run, f"{{{NS}}}t")
    text_node.text = text
    if text.startswith(" ") or text.endswith(" "):
        text_node.set(XML_SPACE, "preserve")
    for child in list(paragraph):
        if child.tag != f"{{{NS}}}pPr":
            paragraph.remove(child)
    paragraph.append(first_run)


heading = "Octava Bis. Conflictos de Interés, Identidad Comercial y Acceso Condicionado"
declaration = (
    "El Colaborador declara, bajo protesta de decir verdad, que antes de aceptar estos Términos ha informado "
    "a Faust cualquier empresa, marca, dominio, perfil, sitio web, proyecto o actividad propia o de un tercero "
    "con la que tenga participación, control, beneficio o vínculo relevante y que pueda competir con Faust, "
    "generar confusión sobre su identidad comercial o comprometer el tratamiento de Datos Confidenciales. "
    "Deberá comunicar cualquier circunstancia sobrevenida de esta naturaleza dentro de los 2 (dos) días hábiles "
    "siguientes a que la conozca. La existencia de una actividad preexistente no constituye por sí sola un "
    "incumplimiento ni una prohibición general de competencia; la omisión, falsedad o actualización incompleta "
    "de esta declaración sí constituirá incumplimiento esencial."
)
identity = (
    "Durante la vigencia de los presentes Términos, El Colaborador se abstendrá de registrar, adquirir, "
    "mantener, operar, promover o apoyar, directa o indirectamente, cualquier dominio, perfil, marca, nombre "
    "comercial, sitio web o comunicación que incorpore o sea semejante en grado de confusión a “Faust”, “Faust "
    "Partners”, “FaustPartners”, sus marcas, logotipos u otros signos distintivos, o que sugiera una afiliación, "
    "autorización, patrocinio o relación comercial inexistente con Faust. La declaración de una actividad "
    "preexistente no implica autorización para continuarla; cualquier uso posterior requerirá autorización previa "
    "y escrita de Faust."
)
access = (
    "Ante un conflicto declarado, una discrepancia de identidad o una sospecha razonable de uso no autorizado, "
    "Faust podrá suspender o negar accesos, abstenerse de emitir Asignaciones y requerir aclaraciones o la "
    "preservación, devolución o eliminación de información y materiales, sin perjuicio de la terminación inmediata "
    "y demás acciones aplicables. Faust compartirá información no pública únicamente en la medida necesaria para "
    "una Colaboración autorizada."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

paragraphs = document.findall(f".//{{{NS}}}p")
heading_template = next(p for p in paragraphs if text_of(p).startswith("Octava. Confidencialidad"))
body_template_index = paragraphs.index(heading_template) + 1
body_template = paragraphs[body_template_index]
insertion_target = next(p for p in paragraphs if text_of(p).startswith("Novena. Protección"))

new_heading = deepcopy(heading_template)
replace_paragraph_text(new_heading, heading)
new_declaration = deepcopy(body_template)
replace_paragraph_text(new_declaration, declaration)
new_identity = deepcopy(body_template)
replace_paragraph_text(new_identity, identity)
new_access = deepcopy(body_template)
replace_paragraph_text(new_access, access)

body = document.find(f"{{{NS}}}body")
position = list(body).index(insertion_target)
for offset, paragraph in enumerate((new_heading, new_declaration, new_identity, new_access)):
    body.insert(position + offset, paragraph)

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
