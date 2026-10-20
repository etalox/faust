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


network_protection = (
    "Durante la vigencia de los presentes Términos y por 18 meses posteriores al último contacto, interacción o "
    "acceso al perfil del integrante respectivo obtenido por medio de Faust, El Colaborador se abstendrá de contactar, "
    "solicitar, inducir, coordinar, reclutar o contratar a otro Colaborador cuya identidad, perfil, disponibilidad o "
    "contacto haya conocido por medio de Faust, con el propósito de integrarlo a una red, agencia, plataforma o equipo "
    "coordinado ajeno a Faust que compita sustancialmente con la Expert Network o aproveche el modelo, información, "
    "relaciones o procesos de Faust. Esta obligación no impedirá relaciones profesionales preexistentes y documentables, "
    "convocatorias públicas no dirigidas, relaciones profesionales ajenas a la organización de una red competidora ni la "
    "atención de solicitudes espontáneas no inducidas por El Colaborador."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

paragraphs = document.findall(f".//{{{NS}}}p")
penalty_trigger = next(
    p for p in paragraphs
    if text_of(p).startswith("Si El Colaborador ofrece, negocia, contrata o presta directamente servicios")
)
new_network_paragraph = deepcopy(penalty_trigger)
set_paragraph_text(new_network_paragraph, network_protection)

body = document.find(f"{{{NS}}}body")
body.insert(list(body).index(penalty_trigger), new_network_paragraph)

trigger_text = text_of(penalty_trigger)
old_fragment = (
    "o incurre en una conducta de identidad comercial o no suplantación prohibida en esta Cláusula, y con ello "
    "obtiene un beneficio económico directo,"
)
new_fragment = (
    "contraviene la obligación de no captación de Colaboradores prevista en esta Cláusula, o incurre en una conducta "
    "de identidad comercial o no suplantación prohibida en esta Cláusula, y con ello obtiene un beneficio económico "
    "directo,"
)
if old_fragment not in trigger_text:
    raise ValueError("Penalty trigger wording not found")
set_paragraph_text(penalty_trigger, trigger_text.replace(old_fragment, new_fragment))

redundant = [
    p for p in document.findall(f".//{{{NS}}}p")
    if text_of(p).startswith("ofrece, negocia, contrata o presta directamente servicios a un Cliente Protegido")
    or text_of(p).startswith("utiliza, reproduce, adapta, aprovecha o explota Datos Confidenciales")
]
if len(redundant) != 2:
    raise ValueError(f"Expected 2 redundant fragments, found {len(redundant)}")
for paragraph in redundant:
    body.remove(paragraph)

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
