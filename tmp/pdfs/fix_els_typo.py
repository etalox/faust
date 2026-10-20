from pathlib import Path

import fitz

SOURCE = Path("legal/colaboradores/terminos-incorporacion-v1-0-2026-09-16.pdf")
OUTPUT = Path("output/pdf/terminos-incorporacion-v1-0-2026-09-16-corrected.pdf")
PAGE_INDEX = 19  # zero-indexed: page 20

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
if OUTPUT.exists():
    OUTPUT.unlink()
document = fitz.open(SOURCE)
page = document[PAGE_INDEX]
matches = page.search_for("Els")
if len(matches) != 1:
    raise ValueError(f"Expected exactly one 'Els' on page 20, found {len(matches)}")

target = matches[0]
page.add_redact_annot(target, fill=(1, 1, 1))
page.apply_redactions()
page.insert_text(
    (target.x0, target.y1 - 2),
    "El",
    fontsize=10,
    fontname="helv",
    color=(0, 0, 0),
)
document.save(OUTPUT, garbage=4, deflate=True)
document.close()

print(OUTPUT)
