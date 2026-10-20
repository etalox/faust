#!/usr/bin/env python3
"""Generate a plain legal PDF from a faust-legal-document HTML page.

Usage: python scripts/generate-legal-pdf.py PAGE.html OUTPUT.pdf [--overwrite]
The page is the only source of the document text and list numbering.
"""

import argparse
from html import escape
from pathlib import Path

from lxml import html
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parent.parent


def inline_text(element):
    """Preserve the page's text, emphasis and explicit line breaks."""
    result = [escape(element.text or "")]
    for child in element:
        tag = child.tag.lower() if isinstance(child.tag, str) else ""
        if tag == "br":
            result.append("<br/>")
        elif tag in ("strong", "b"):
            result.append("<b>" + inline_text(child) + "</b>")
        elif tag in ("em", "i"):
            # The legal page's current typeface has no italic font file.
            result.append(inline_text(child))
        elif tag in ("span", "a"):
            result.append(inline_text(child))
        else:
            raise ValueError(f"Unsupported inline element: {tag}")
        result.append(escape(child.tail or ""))
    return "".join(result)


def alphabetic(number):
    result = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(ord("a") + remainder) + result
    return result


def create_pdf(source, output, overwrite=False):
    if output.exists() and not overwrite:
        raise FileExistsError(f"Output already exists: {output}. Use --overwrite explicitly.")

    page = html.parse(str(source))
    components = page.xpath("//faust-legal-document")
    if len(components) != 1:
        raise ValueError("Expected exactly one faust-legal-document element.")
    document = components[0]
    title = document.xpath("./header/h1")
    metadata = document.xpath("./header/p[contains(concat(' ', normalize-space(@class), ' '), ' legal-document__metadata ')]")
    articles = document.xpath("./article")
    if len(title) != 1 or len(metadata) != 1 or len(articles) != 1:
        raise ValueError("Expected one title, metadata block and article.")

    regular = TTFont("FaustLegalRegular", str(ROOT / "assets/Fonts/BDOGrotesk-Regular.ttf"))
    medium = TTFont("FaustLegalMedium", str(ROOT / "assets/Fonts/BDOGrotesk-Medium.ttf"))
    for font in (regular, medium):
        missing = sorted({c for c in "".join(document.itertext()) if not c.isspace() and ord(c) not in font.face.charWidths})
        if missing:
            raise ValueError(f"The PDF font lacks these characters: {missing}")
        pdfmetrics.registerFont(font)
    pdfmetrics.registerFontFamily("FaustLegalRegular", normal="FaustLegalRegular", bold="FaustLegalMedium")

    base = ParagraphStyle("legal-body", fontName="FaustLegalRegular", fontSize=10.5,
                          leading=15, alignment=TA_LEFT, textColor=colors.black,
                          spaceAfter=7, allowWidows=0, allowOrphans=0)
    title_style = ParagraphStyle("legal-title", parent=base, fontName="FaustLegalMedium",
                                 fontSize=17, leading=21, spaceAfter=10, keepWithNext=True)
    meta_style = ParagraphStyle("legal-meta", parent=base, fontSize=9.5, leading=13,
                                spaceAfter=18, keepWithNext=True)
    h2_style = ParagraphStyle("legal-heading", parent=base, fontName="FaustLegalMedium",
                               fontSize=13, leading=17, spaceBefore=12, spaceAfter=7,
                               keepWithNext=True)
    h3_style = ParagraphStyle("legal-subheading", parent=base, fontName="FaustLegalMedium",
                               fontSize=10.5, leading=15, spaceBefore=6, spaceAfter=5,
                               keepWithNext=True)

    story = [Paragraph(inline_text(title[0]), title_style),
             Paragraph(inline_text(metadata[0]), meta_style)]

    def append_content(container):
        for child in container:
            tag = child.tag.lower() if isinstance(child.tag, str) else ""
            if tag in ("div", "section"):
                append_content(child)
            elif tag in ("p", "h2", "h3"):
                style = {"p": base, "h2": h2_style, "h3": h3_style}[tag]
                story.append(Paragraph(inline_text(child), style))
            elif tag in ("ol", "ul"):
                number = int(child.get("start", "1"))
                alpha = child.get("type") == "a"
                classes = child.get("class", "").split()
                extra_indent = 36 if "legal-document__list--deep" in classes else 18 if "legal-document__list--nested" in classes else 0
                list_style = ParagraphStyle("legal-list", parent=base,
                                             leftIndent=18 + extra_indent,
                                             firstLineIndent=-18, spaceAfter=5)
                for item in child:
                    if item.tag != "li":
                        raise ValueError(f"Unsupported list element: {item.tag}")
                    marker = "-" if tag == "ul" else f"{alphabetic(number)})" if alpha else f"{number}."
                    story.append(Paragraph(escape(marker) + " " + inline_text(item), list_style))
                    number += 1
                story.append(Spacer(1, 2))
            else:
                raise ValueError(f"Unsupported legal content element: {tag}")

    append_content(articles[0])

    def page_number(canvas, doc):
        canvas.setFont("FaustLegalRegular", 9)
        canvas.drawRightString(letter[0] - 0.75 * inch, 0.45 * inch, str(doc.page))

    pdf = SimpleDocTemplate(str(output), pagesize=letter, leftMargin=0.75 * inch,
                            rightMargin=0.75 * inch, topMargin=0.75 * inch,
                            bottomMargin=0.75 * inch, title=title[0].text_content().strip(),
                            author="FaustPartners™")
    pdf.build(story, onFirstPage=page_number, onLaterPages=page_number)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    create_pdf(args.source, args.output, args.overwrite)
    print(f"Generated {args.output} from {args.source}")


if __name__ == "__main__":
    main()
