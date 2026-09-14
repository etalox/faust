from pathlib import Path
import re
import zlib
from PIL import Image

pdf = Path(r"C:\Users\franc\Downloads\Equipos de FATISA (1).pdf").read_bytes()
output = Path("fatisa/assets/equipos")
output.mkdir(parents=True, exist_ok=True)

pages = re.findall(rb"(?<![0-9])(\d+) 0 obj\s*<</Type /Page.*?/XObject <</(.*?)>>.*?/Contents", pdf, re.S)
images, visited = [], set()

def object_bytes(object_number):
    match = re.search(rb"(?<![0-9])" + object_number + rb" 0 obj", pdf)
    return pdf[match.start():pdf.find(b"endobj", match.start())] if match else None

def inspect(object_number):
    if object_number in visited:
        return
    visited.add(object_number)
    obj = object_bytes(object_number)
    if not obj:
        return
    if b"/Subtype /Image" in obj:
        stream_start = obj.find(b"stream") + len(b"stream")
        if obj[stream_start:stream_start + 2] == b"\r\n":
            stream_start += 2
        elif obj[stream_start:stream_start + 1] == b"\n":
            stream_start += 1
        image = obj[stream_start:obj.find(b"endstream", stream_start)]
        if image not in images:
            images.append((object_number, obj, image))
        return
    resources = re.search(rb"/XObject\s*<<(.+?)>>", obj, re.S)
    if resources:
        for _, child in re.findall(rb"/(X\d+) (\d+) 0 R", resources.group(1)):
            inspect(child)

for _, resources in pages:
    for _, object_number in re.findall(rb"/(X\d+) (\d+) 0 R", resources):
        inspect(object_number)

for number, (object_number, obj, image) in enumerate(images, 1):
    width = int(re.search(rb"/Width (\d+)", obj).group(1))
    height = int(re.search(rb"/Height (\d+)", obj).group(1))
    print(number, object_number.decode(), width, height, "DCT" if b"/DCTDecode" in obj else "Flate")
    if image.startswith(b"\xff\xd8"):
        (output / f"{number:02d}.jpg").write_bytes(image)
        continue
    raw = zlib.decompress(image)
    if len(raw) == width * height * 3:
        Image.frombytes("RGB", (width, height), raw).save(output / f"{number:02d}.png")
    elif len(raw) == width * height * 4:
        Image.frombytes("RGBA", (width, height), raw).save(output / f"{number:02d}.png")
    else:
        print("Skipped unsupported raw format", len(raw))
print(f"Extracted {len(images)} images")
