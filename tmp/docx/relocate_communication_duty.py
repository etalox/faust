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


def set_run_text(run, text):
    text_nodes = list(run.iter(f"{{{NS}}}t"))
    if not text_nodes:
        text_nodes = [ET.SubElement(run, f"{{{NS}}}t")]
    text_nodes[0].text = text
    if text.startswith(" ") or text.endswith(" "):
        text_nodes[0].set(XML_SPACE, "preserve")
    for node in text_nodes[1:]:
        run.remove(node)


def replace_body(paragraph, expected_label, new_label, body):
    runs = paragraph.findall(f"{{{NS}}}r")
    if len(runs) < 2 or text_of(runs[0]) != expected_label:
        raise ValueError(f"Unexpected paragraph structure for: {expected_label}")
    set_run_text(runs[0], new_label)
    set_run_text(runs[1], " " + body)
    for run in runs[2:]:
        paragraph.remove(run)


communications_text = (
    "Toda comunicación, instrucción, retroalimentación o requerimiento relacionado con una Colaboración "
    "deberá canalizarse por los medios, plataformas y repositorios designados o autorizados por Faust. "
    "Para efectos generales de los presentes Términos, incluidas sus actualizaciones, las Asignaciones, "
    "avisos, requerimientos, notificaciones e interpelaciones contractuales, El Colaborador designa como "
    "canal oficial el correo electrónico que haya confirmado conforme a estos Términos y se obliga, durante "
    "toda su vigencia, a mantenerlo activo, bajo su control y con capacidad de recepción; a revisar, "
    "incluyendo las carpetas de correo no deseado o filtros aplicables, los mensajes recibidos en dicha cuenta "
    "al menos una vez cada 3 (tres) días hábiles; y a notificar a Faust cualquier cambio de cuenta, acceso "
    "comprometido, imposibilidad de consulta o falla material de recepción dentro de los 2 (dos) días hábiles "
    "siguientes a que tenga conocimiento de ello. Salvo disposición específica distinta en estos Términos, un "
    "aviso enviado por Faust desde contacto@faust.mx se tendrá por notificado cuando ingrese en el sistema de "
    "información correspondiente al correo electrónico oficial designado por El Colaborador, sin que sea "
    "necesario acreditar su apertura o lectura, salvo que exista rebote, rechazo o error técnico comprobable "
    "atribuible a Faust. El incumplimiento de El Colaborador de este deber no invalidará un aviso correctamente "
    "enviado y constituirá incumplimiento contractual. Lo anterior no sustituye los requisitos de aceptación "
    "expresa previstos para una Asignación ni las formalidades que la legislación aplicable exija para actos "
    "específicos. El Colaborador no deberá atender instrucciones, cambios de alcance ni solicitudes directas de "
    "El Cliente que no hayan sido previamente validados por Faust, ni revelar a El Cliente información sobre "
    "honorarios, porcentajes, liquidaciones o acuerdos internos de la relación con Faust. Las interacciones "
    "directas que resulten necesarias para la ejecución técnica deberán contar con autorización previa de Faust "
    "y mantenerse dentro de los canales y alcances autorizados. El incumplimiento de este numeral podrá "
    "constituir incumplimiento esencial y dar lugar a la terminación inmediata de la Asignación, sin perjuicio "
    "de las demás acciones contractuales aplicables."
)

updates_text = (
    "Faust podrá actualizar, complementar o modificar los presentes Términos cuando resulte necesario por "
    "mejoras operativas, requerimientos técnicos o cambios regulatorios. Toda actualización deberá identificar "
    "la versión, la fecha de entrada en vigor, adjuntar o poner a disposición la versión íntegra de los "
    "Términos y describir razonablemente los cambios principales, con al menos 10 (diez) días hábiles de "
    "anticipación a su fecha efectiva. Si El Colaborador no manifiesta su desacuerdo u objeción por escrito "
    "mediante correo electrónico dirigido a contacto@faust.mx antes de que concluya dicho plazo, las "
    "modificaciones se tendrán por plenamente aceptadas y vinculantes para ambas partes a partir de la fecha "
    "de vigencia indicada. Las actualizaciones surtirán efectos prospectivos y no modificarán derechos ya "
    "devengados ni una Asignación activa, salvo que la modificación resulte obligatoria por disposición legal "
    "aplicable o que ambas partes acuerden expresamente por escrito aplicarla a dicha Asignación. En caso de "
    "que el Colaborador manifieste su rechazo expreso dentro del plazo señalado, se dará por concluida su "
    "pertenencia a la Expert Network sin penalización para ninguna de las partes. Cualquier Asignación emitida "
    "antes de la fecha de vigencia indicada continuará rigiéndose bajo la versión de los Términos vigente al "
    "momento en que fue aceptada, hasta su conclusión."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))

paragraphs = document.findall(f".//{{{NS}}}p")
communications = next(p for p in paragraphs if text_of(p).startswith("Canales Oficiales de Comunicación."))
updates = next(p for p in paragraphs if text_of(p).startswith("Actualizaciones a los Términos."))
replace_body(
    communications,
    "Canales Oficiales de Comunicación.",
    "Canales Oficiales de Comunicación y Notificaciones.",
    communications_text,
)
replace_body(updates, "Actualizaciones a los Términos.", "Actualizaciones a los Términos.", updates_text)

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
