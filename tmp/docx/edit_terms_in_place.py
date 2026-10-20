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


def set_run_text(run, text):
    text_nodes = list(run.iter(f"{{{NS}}}t"))
    if not text_nodes:
        node = ET.SubElement(run, f"{{{NS}}}t")
        text_nodes = [node]
    text_nodes[0].text = text
    if text.startswith(" ") or text.endswith(" "):
        text_nodes[0].set(XML_SPACE, "preserve")
    for node in text_nodes[1:]:
        run.remove(node)


def replace_body(paragraph, expected_label, replacement):
    runs = paragraph.findall(f"{{{NS}}}r")
    if len(runs) < 2 or text_of(runs[0]) != expected_label:
        raise ValueError(f"Unexpected paragraph structure for: {expected_label}")
    set_run_text(runs[1], " " + replacement)
    for run in runs[2:]:
        paragraph.remove(run)


update_text = (
    "Faust podrá actualizar, complementar o modificar los presentes Términos cuando resulte necesario "
    "por mejoras operativas, requerimientos técnicos o cambios regulatorios. El Colaborador reconoce "
    "desde este momento el procedimiento de notificación y aceptación previsto en este numeral y, "
    "durante toda la vigencia de los Términos, se obliga a mantener activo, bajo su control y con "
    "capacidad de recepción el correo electrónico oficial que haya designado; a revisar, incluyendo "
    "las carpetas de correo no deseado o filtros aplicables, los mensajes recibidos en dicha cuenta al "
    "menos una vez cada 3 (tres) días hábiles; y a notificar a Faust cualquier cambio de cuenta, acceso "
    "comprometido, imposibilidad de consulta o falla material de recepción dentro de los 2 (dos) días "
    "hábiles siguientes a que tenga conocimiento de ello. Para efectos de este numeral, una actualización "
    "se tendrá por notificada cuando el mensaje enviado por Faust desde contacto@faust.mx ingrese en el "
    "sistema de información correspondiente al correo electrónico oficial designado por El Colaborador, "
    "sin que sea necesario acreditar su apertura o lectura, salvo que exista rebote, rechazo o error "
    "técnico comprobable atribuible a Faust. Toda actualización deberá identificar la versión, la fecha "
    "de entrada en vigor, adjuntar o poner a disposición la versión íntegra de los Términos y describir "
    "razonablemente los cambios principales, con al menos 10 (diez) días hábiles de anticipación a su "
    "fecha efectiva. Si El Colaborador no manifiesta su desacuerdo u objeción por escrito mediante correo "
    "electrónico dirigido a contacto@faust.mx antes de que concluya dicho plazo, las modificaciones se "
    "tendrán por plenamente aceptadas y vinculantes para ambas partes a partir de la fecha de vigencia "
    "indicada. El incumplimiento de El Colaborador de su deber de mantener o revisar el correo electrónico "
    "oficial no invalidará un aviso correctamente enviado conforme a este numeral y constituirá "
    "incumplimiento contractual. Las actualizaciones surtirán efectos prospectivos y no modificarán "
    "derechos ya devengados ni una Asignación activa, salvo que la modificación resulte obligatoria por "
    "disposición legal aplicable o que ambas partes acuerden expresamente por escrito aplicarla a dicha "
    "Asignación. En caso de que el Colaborador manifieste su rechazo expreso dentro del plazo señalado, "
    "se dará por concluida su pertenencia a la Expert Network sin penalización para ninguna de las partes. "
    "Cualquier Asignación emitida antes de la fecha de vigencia indicada continuará rigiéndose bajo la "
    "versión de los Términos vigente al momento en que fue aceptada, hasta su conclusión."
)

ip_text = (
    "El Colaborador cede y transfiere a favor de Faust, de manera total, exclusiva, universal y sin "
    "limitación temporal ni geográfica, la totalidad de los derechos patrimoniales sobre interfaces, "
    "prototipos, código front-end, estructuras visuales y materiales creativos desarrollados específicamente "
    "para Faust o para sus clientes dentro de la Asignación. La cesión comprende, sin necesidad de que cada "
    "material, actividad o resultado sea enumerado individualmente en la Asignación, toda interfaz, "
    "prototipo, código, arquitectura, configuración, estructura visual, documentación, activo o material "
    "creativo que El Colaborador cree, adapte o modifique sustancialmente específicamente para el objetivo, "
    "rol o coordinación de un sprint de la Asignación, aun cuando no constituya un entregable final, no esté "
    "concluido o no hubiera sido previsto individualmente al inicio de dicha Asignación. Tratándose de activos "
    "de terceros incorporados a los materiales (tales como tipografías, paquetes de iconos, fotografías de "
    "stock, componentes de código abierto, etcétera), las partes reconocen que la titularidad originaria "
    "corresponde a sus respectivos creadores. En tales casos, El Colaborador no transfiere la propiedad sobre "
    "dichos activos, pero garantiza expresamente que todos los elementos de terceros incorporados cuentan con "
    "licencias comerciales vigentes, perpetuas, libres de regalías y transferibles (tales como licencias de "
    "stock comercial, MIT, Apache, CC0 o equivalentes de uso comercial irrestricto), que facultan plenamente "
    "a Faust y a sus Clientes a utilizarlos, publicarlos, modificarlos y explotarlos comercialmente sin "
    "requerir autorizaciones adicionales ni generar costos sobrevenidos. El Colaborador garantizará que "
    "cualquier desarrollo asistido por herramientas de Inteligencia Artificial conserve una intervención humana "
    "sustancial y demostrable en su arquitectura, lógica y refinamiento creativo. Queda estrictamente "
    "prohibido entregar desarrollos generados íntegramente por IA que carezcan de protección de propiedad "
    "intelectual conforme a los criterios de INDAUTOR y la legislación aplicable. Queda prohibido el uso de "
    "activos que impongan restricciones al modelo de negocio de Faust o al despliegue comercial de El Cliente. "
    "Quedan excluidos los materiales, herramientas, bibliotecas, plantillas, metodologías, conocimientos y "
    "componentes preexistentes de El Colaborador, salvo que se incorporen expresamente a un material creado o "
    "adaptado dentro de la Asignación y las partes acuerden por escrito su licencia o cesión. La exclusión de "
    "materiales, metodologías, conocimientos y componentes preexistentes de El Colaborador no autoriza el uso, "
    "divulgación o incorporación de Datos Confidenciales de Faust o de El Cliente, ni de adaptaciones, "
    "reproducciones o derivados sustanciales de dicha información. La modalidad de compensación pactada en la "
    "Asignación incluirá, en su caso, la remuneración correspondiente a la transmisión de derechos "
    "patrimoniales sobre los materiales comprendidos en este numeral, conforme a las condiciones y límites "
    "establecidos en dicha Asignación."
)

with ZipFile(SOURCE, "r") as original:
    archive_items = [(item, original.read(item.filename)) for item in original.infolist()]
    document = ET.fromstring(original.read("word/document.xml"))
    paragraphs = document.findall(f".//{{{NS}}}p")
    update_paragraph = next(p for p in paragraphs if text_of(p).startswith("Actualizaciones a los Términos."))
    ip_paragraph = next(p for p in paragraphs if text_of(p).startswith("Cesión de Derechos Patrimoniales."))
    payment_paragraph = next(p for p in paragraphs if "notificar a Els Colaborador" in text_of(p))

    replace_body(update_paragraph, "Actualizaciones a los Términos.", update_text)
    replace_body(ip_paragraph, "Cesión de Derechos Patrimoniales.", ip_text)

    for run in payment_paragraph.findall(f"{{{NS}}}r"):
        for node in run.iter(f"{{{NS}}}t"):
            if node.text:
                node.text = node.text.replace("Els Colaborador", "El Colaborador")

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
