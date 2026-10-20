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


commercial_authority = (
    "El Colaborador carece de facultades para representar, obligar, cotizar, negociar o asumir compromisos en nombre "
    "de Faust o de El Cliente, incluidos precios, descuentos, presupuestos, plazos, garantías, cambios económicos o "
    "acuerdos comerciales. Ningún gasto, contratación o desembolso será reembolsable por Faust salvo autorización "
    "previa y escrita. Los actos realizados sin dicha autorización no obligarán a Faust y El Colaborador responderá por "
    "los daños directos que resulten demostrablemente atribuibles a ellos."
)

account_control = (
    "Todo repositorio, dominio, cuenta de nube, analítica, CRM, publicidad, pasarela, píxel, herramienta, acceso o "
    "credencial creado, configurado o administrado para una Asignación deberá quedar registrado desde su creación a "
    "nombre de Faust o de El Cliente, según indique Faust, y contar con acceso administrativo de Faust. El Colaborador "
    "utilizará medios autorizados, autenticación multifactor cuando esté disponible y no conservará acceso exclusivo ni "
    "almacenará credenciales o Datos Confidenciales en cuentas, nubes o dispositivos personales no autorizados por "
    "escrito."
)

continuity = (
    "El Colaborador mantendrá en los medios autorizados una documentación razonablemente actualizada de los cambios, "
    "dependencias, instrucciones de despliegue y accesos necesarios para la continuidad del proyecto. Ante requerimiento "
    "razonable de Faust, incidente de seguridad, imposibilidad de continuidad, suspensión o terminación, deberá entregar "
    "o transferir de inmediato dichos elementos y los accesos bajo su control. Faust podrá revocar o rotar credenciales, "
    "reasignar actividades y adoptar las medidas técnicas necesarias para la continuidad, sin requerir autorización "
    "adicional de El Colaborador."
)

supply_chain = (
    "El Colaborador deberá documentar y proporcionar a Faust, cuando éste lo solicite razonablemente, la relación de "
    "dependencias, licencias, activos de terceros, servicios externos, herramientas de inteligencia artificial, modelos y "
    "plantillas de instrucciones que incidan materialmente en los materiales desarrollados. No podrá introducir Datos "
    "Confidenciales, datos personales, credenciales o información de El Cliente en herramientas de inteligencia "
    "artificial no autorizadas expresamente por Faust. Faust podrá requerir la sustitución, eliminación o corrección de "
    "cualquier componente que presente un riesgo jurídico, técnico o de seguridad atribuible a El Colaborador, sin "
    "contraprestación adicional."
)

evidence = (
    "El Colaborador conservará, durante la Asignación y por el tiempo razonablemente necesario para la defensa de "
    "derechos o cumplimiento de obligaciones aplicables, los registros, bitácoras, historiales de cambio, instrucciones "
    "y evidencias directamente relacionadas con sus accesos y actividades en el proyecto. A requerimiento escrito y "
    "razonable de Faust, los proporcionará sin revelar información ajena al proyecto. Los registros técnicos, metadatos, "
    "comunicaciones y constancias generados por Faust podrán utilizarse como evidencia contractual, sin perjuicio de la "
    "valoración que corresponda a la autoridad competente."
)

urgent_relief = (
    "El periodo de mediación no impedirá a Faust solicitar de inmediato las medidas cautelares, de preservación de "
    "evidencia, protección de accesos o acciones urgentes que resulten necesarias ante un riesgo o incumplimiento de "
    "confidencialidad, datos personales, ciberseguridad, propiedad intelectual, secretos industriales, no captación de "
    "Colaboradores, suplantación o continuidad técnica."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

body = document.find(f"{{{NS}}}body")
paragraphs = body.findall(f"{{{NS}}}p")

personal = next(
    p for p in paragraphs
    if text_of(p).startswith("Carácter Personalísimo (Intuitu Personae)")
)
insert_after(body, personal, commercial_authority)

resources = next(
    p for p in paragraphs
    if text_of(p).startswith("Recursos Técnicos Propios:")
)
accounts = insert_after(body, resources, account_control)
insert_after(body, accounts, continuity)

ip = next(
    p for p in paragraphs
    if text_of(p).startswith("Cesión de Derechos Patrimoniales.")
)
insert_after(body, ip, supply_chain)

data = next(
    p for p in paragraphs
    if text_of(p).startswith("Cuando los Datos Confidenciales incluyan datos personales")
)
insert_after(body, data, evidence)

mediation = next(
    p for p in paragraphs
    if text_of(p).startswith("Privilegiando la buena fe y el espíritu de colaboración profesional")
)
insert_after(body, mediation, urgent_relief)

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
