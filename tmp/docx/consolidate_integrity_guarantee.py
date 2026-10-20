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


def clone_with_text(reference, text):
    paragraph = deepcopy(reference)
    set_paragraph_text(paragraph, text)
    return paragraph


integrity_heading = "Décima Primera Bis. Garantía de Integridad Operativa"

integrity_scope = (
    "La presente Garantía de Integridad Operativa será aplicable a toda Asignación que implique acceso privilegiado "
    "o administrativo a infraestructura de producción, servidores, bases de datos, credenciales maestras, sistemas de "
    "pago o información especialmente sensible de Faust o de El Cliente (una \"Asignación de Riesgo Elevado\"). El acceso "
    "se otorgará exclusivamente mientras resulte necesario para la función autorizada y podrá condicionarse al cumplimiento "
    "de las medidas adicionales que Faust o El Cliente comuniquen razonablemente por escrito. Esta Garantía no constituye "
    "una promesa de ausencia absoluta de incidentes ni convierte a Faust en garante de la infraestructura, decisiones de "
    "seguridad o controles bajo responsabilidad de El Cliente."
)

integrity_controls = (
    "El Colaborador utilizará únicamente cuentas individuales, nominativas y autorizadas; no compartirá credenciales, "
    "llaves, códigos, sesiones o accesos y empleará autenticación multifactor cuando esté disponible. Tendrá sólo los "
    "privilegios, entornos y plazo estrictamente necesarios; no conservará secretos, Datos Confidenciales o datos personales "
    "en dispositivos, cuentas o nubes personales no autorizados. Toda modificación en producción, configuración sensible, "
    "acceso a datos o uso de herramientas externas deberá sujetarse a las instrucciones, autorizaciones y medios técnicos "
    "definidos por Faust o El Cliente."
)

integrity_incidents = (
    "El Colaborador notificará de inmediato a Faust cualquier acceso no autorizado, pérdida de credenciales, vulnerabilidad, "
    "malware, alteración, extracción de datos o incidente que conozca o razonablemente sospeche y, salvo imposibilidad material, "
    "a más tardar dentro de una hora de haberlo advertido. Deberá contener el riesgo conforme a las instrucciones recibidas, "
    "preservar los registros y abstenerse de borrar, alterar, ocultar o investigar evidencia más allá de lo indispensable para la "
    "contención. Faust o El Cliente podrán registrar las sesiones, accesos, comandos y cambios realizados, revocar o rotar "
    "credenciales en cualquier momento y exigir la entrega inmediata de los accesos, materiales y documentación necesarios "
    "para la continuidad."
)

integrity_liability = (
    "Sin perjuicio de la responsabilidad e indemnización previstas en la Cláusula Décima Primera, El Colaborador responderá "
    "frente a Faust y a El Cliente por los daños directos, gastos razonables de contención, investigación y reparación, y "
    "reclamaciones que se acrediten como consecuencia de actos u omisiones atribuibles a El Colaborador en una Asignación de "
    "Riesgo Elevado, incluidos negligencia, acceso o uso no autorizado, divulgación o pérdida de información, introducción de "
    "código malicioso, alteración ilícita de sistemas o desvío de fondos. Esta obligación constituye una estipulación expresa "
    "en favor de El Cliente, quien podrá exigir directamente al Colaborador la reparación que corresponda, sin que ello imponga "
    "a Faust obligación adicional distinta de las que legalmente le correspondan."
)

integrity_financial_security = (
    "Faust podrá exigir, como condición previa para otorgar o mantener dichos accesos, un seguro de responsabilidad profesional "
    "o ciberseguro, una fianza u obligación solidaria de un tercero solvente, o una garantía mobiliaria sobre un bien específico "
    "de El Colaborador. La garantía aplicable, su vigencia, cobertura o monto máximo y, cuando corresponda, la designación de "
    "Faust y/o de El Cliente como beneficiario, deberán constar en la Asignación o en su anexo. Cuando recaiga sobre un bien, "
    "deberá identificarlo individualmente, acreditar razonablemente su titularidad y situación de gravámenes, señalar el importe "
    "máximo garantizado y cumplir las formalidades e inscripciones aplicables. Ninguna garantía constituirá un gravamen general "
    "sobre el patrimonio de El Colaborador ni autorizará a Faust o a El Cliente a apropiarse, embargar o disponer unilateralmente "
    "del bien. La falta de constitución, renovación o conservación de una garantía exigida facultará a Faust para no otorgar, "
    "suspender o revocar accesos, suspender o no emitir la Asignación y reasignar sus actividades, sin perjuicio de los derechos "
    "de pago válidamente devengados y de las vías de cobro legalmente procedentes."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

body = document.find(f"{{{NS}}}body")
paragraphs = body.findall(f"{{{NS}}}p")

# Eliminate the duplicate high-risk financial-security paragraphs now consolidated below.
for paragraph in list(paragraphs):
    text = text_of(paragraph)
    if text.startswith("Para una Asignación que implique acceso privilegiado") or text.startswith("Cuando se pacte una garantía sobre un bien"):
        body.remove(paragraph)

# Replace the previous technical-integrity clause with a precise cross-reference.
technical_integrity = next(
    p for p in body.findall(f"{{{NS}}}p")
    if text_of(p).startswith("Garantía de Integridad Técnica, Ciberseguridad e Indemnidad por Actos Dolosos")
)
set_paragraph_text(
    technical_integrity,
    "Las obligaciones de integridad técnica, ciberseguridad, preservación de evidencia, aviso de incidentes y responsabilidad "
    "frente a Faust y El Cliente por accesos de riesgo se regirán por la Garantía de Integridad Operativa prevista en la Cláusula "
    "Décima Primera Bis, sin perjuicio de la cesión de derechos establecida en esta Cláusula Séptima."
)

# Insert the standalone guarantee immediately before Clause Twelfth.
twelfth = next(
    p for p in body.findall(f"{{{NS}}}p")
    if text_of(p).startswith("Décima Segunda. Vigencia y Adaptabilidad Operativa")
)
new_paragraphs = [
    clone_with_text(twelfth, integrity_heading),
    clone_with_text(technical_integrity, integrity_scope),
    clone_with_text(technical_integrity, integrity_controls),
    clone_with_text(technical_integrity, integrity_incidents),
    clone_with_text(technical_integrity, integrity_liability),
    clone_with_text(technical_integrity, integrity_financial_security),
]
insert_at = list(body).index(twelfth)
for offset, paragraph in enumerate(new_paragraphs):
    body.insert(insert_at + offset, paragraph)

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
