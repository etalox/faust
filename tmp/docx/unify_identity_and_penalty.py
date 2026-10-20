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


identity_text = (
    "Identidad comercial y no suplantación. El Colaborador se abstendrá, desde la aceptación de los presentes "
    "Términos y con posterioridad a su terminación mientras el uso pueda generar confusión o aparentar una "
    "afiliación, autorización, patrocinio o relación comercial con Faust, de registrar, adquirir, mantener, "
    "operar, promover o apoyar, directa o indirectamente, cualquier dominio, perfil, marca, nombre comercial, "
    "sitio web o comunicación que incorpore o sea semejante en grado de confusión a “Faust”, “Faust Partners”, "
    "“FaustPartners”, sus marcas, logotipos u otros signos distintivos, o que sugiera una afiliación, "
    "autorización, patrocinio o relación comercial inexistente con Faust. La declaración de una actividad "
    "preexistente no implica autorización para continuarla; cualquier uso posterior requerirá autorización previa "
    "y escrita de Faust."
)

breach_text = (
    "Si El Colaborador ofrece, negocia, contrata o presta directamente servicios a un Cliente Protegido respecto "
    "del mismo proyecto, oportunidad o necesidad comercial, utiliza, reproduce, adapta, aprovecha o explota Datos "
    "Confidenciales, relaciones comerciales, materiales, metodologías o procesos de Faust o de El Cliente para "
    "crear, operar, asesorar, financiar, administrar o participar en un negocio, marca, plataforma o modelo "
    "comercial que replique sustancialmente el modelo de FaustPartners™, o incurre en una conducta de identidad "
    "comercial o no suplantación prohibida en esta Cláusula, y con ello obtiene un beneficio económico directo, "
    "incurrirá en la pena convencional prevista en el párrafo siguiente."
)

penalty_text = (
    "La pena convencional será equivalente exclusivamente al monto neto efectivamente cobrado y conservado por "
    "El Colaborador como consecuencia directa y acreditada de la conducta infractora. No se incluirán ingresos "
    "proyectados, esperados, no cobrados, ajenos a la infracción ni cantidades que hayan sido objeto de reembolso, "
    "contracargo, retención o disputa. Si no puede acreditarse un beneficio económico directo, no se causará pena "
    "convencional por ese concepto, sin perjuicio de los demás remedios y acciones que correspondan conforme a "
    "estos Términos y a la legislación aplicable."
)

remedies_text = (
    "La pena se causará por cada conducta infractora independiente y no se acumulará con otra pena contractual "
    "respecto del mismo beneficio económico. La pena no autorizará la continuación de la conducta infractora ni "
    "liberará a El Colaborador de cesarla, retirar o corregir los elementos infractores, devolver o eliminar los "
    "Datos Confidenciales correspondientes y abstenerse de utilizarlos o divulgarlos. Faust podrá exigir el "
    "cumplimiento o la pena convencional correspondiente, sin acumular ambas respecto del mismo incumplimiento, "
    "salvo que se haya pactado válidamente una pena específica por retardo."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

paragraphs = document.findall(f".//{{{NS}}}p")
identity_source = next(p for p in paragraphs if text_of(p).startswith("El Colaborador se abstendrá, desde la aceptación"))
novena_heading = next(p for p in paragraphs if text_of(p).startswith("Novena. Protección"))
novena_intro = next(p for p in paragraphs if text_of(p).startswith("El Colaborador reconoce que, con motivo"))
breach_source = next(p for p in paragraphs if text_of(p).startswith("Durante la vigencia de las restricciones"))
penalty_source = next(p for p in paragraphs if text_of(p).startswith("deberá pagar a Faust, como pena convencional"))
remedies_source = next(p for p in paragraphs if text_of(p).startswith("La pena se causará por cada relación comercial"))

identity_target = deepcopy(novena_intro)
set_paragraph_text(identity_target, identity_text)
set_paragraph_text(breach_source, breach_text)
set_paragraph_text(penalty_source, penalty_text)
set_paragraph_text(remedies_source, remedies_text)

body = document.find(f"{{{NS}}}body")
body.remove(identity_source)
insertion_index = list(body).index(novena_intro) + 1
body.insert(insertion_index, identity_target)

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
