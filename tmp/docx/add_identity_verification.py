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


verification = (
    "Faust podrá requerir, en cualquier momento posterior a la aceptación y antes de otorgar accesos sensibles, "
    "emitir una Asignación o realizar pagos, la verificación razonable de identidad de El Colaborador mediante "
    "identificación oficial vigente, constancia de situación fiscal, comprobante de titularidad bancaria y demás "
    "documentación estrictamente necesaria para prevenir fraude, cumplir obligaciones fiscales, contractuales o "
    "regulatorias, o atender requerimientos de El Cliente. Mientras la verificación esté pendiente, incompleta, "
    "inconsistente o no pueda validarse razonablemente, Faust podrá suspender accesos, abstenerse de emitir "
    "Asignaciones, posponer cambios de Datos Fiscales o Datos Bancarios y diferir el procedimiento de pago, sin que "
    "ello extinga los honorarios válidamente devengados. La presentación de documentación falsa, alterada o perteneciente "
    "a un tercero constituirá incumplimiento esencial."
)

requests = (
    "Las solicitudes, instrucciones o reclamaciones de naturaleza contractual u operativa dirigidas a Faust que pretendan "
    "modificar datos, reclamar pagos, obtener información reservada o emitir instrucciones deberán provenir del correo "
    "electrónico oficial de El Colaborador y, cuando Faust lo requiera razonablemente, acompañarse de evidencia suficiente "
    "de identidad o representación. Esta verificación no limita los derechos que correspondan a El Colaborador frente a "
    "autoridades competentes."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

body = document.find(f"{{{NS}}}body")
data_intro = next(
    p for p in body.findall(f"{{{NS}}}p")
    if text_of(p).startswith("Los Datos de Incorporación son los datos mínimos")
)
verification_paragraph = insert_after(body, data_intro, verification)
insert_after(body, verification_paragraph, requests)

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
