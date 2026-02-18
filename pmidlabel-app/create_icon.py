#!/usr/bin/env python3
"""
Create an icon for PMID Renamer app
Generates a simple but professional PDF/medical themed icon
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon_image(size):
    """Create a single icon image at the specified size"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background gradient (blue medical theme)
    for y in range(size):
        # Gradient from light blue to darker blue
        r = int(70 + (180 - 70) * (1 - y / size))
        g = int(130 + (210 - 130) * (1 - y / size))
        b = int(180 + (240 - 180) * (1 - y / size))
        draw.rectangle([(0, y), (size, y+1)], fill=(r, g, b, 255))

    # Draw rounded rectangle for document shape
    margin = size // 8
    doc_left = margin
    doc_top = margin
    doc_right = size - margin
    doc_bottom = size - margin
    corner = size // 10

    # White document background
    draw.rounded_rectangle(
        [(doc_left, doc_top), (doc_right, doc_bottom)],
        radius=corner,
        fill=(255, 255, 255, 255),
        outline=(60, 60, 60, 200),
        width=max(1, size // 64)
    )

    # Draw "PMID" and "PDF" text
    if size >= 128:
        # For medium and large sizes, add text
        try:
            # PMID text (top)
            font_size_pmid = size // 7
            font_pmid = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size_pmid)
            text_pmid = "PMID"
            bbox = draw.textbbox((0, 0), text_pmid, font=font_pmid)
            text_width = bbox[2] - bbox[0]
            text_x = (size - text_width) // 2
            text_y_pmid = size // 3
            draw.text((text_x, text_y_pmid), text_pmid, fill=(40, 80, 140, 255), font=font_pmid)

            # PDF text (bottom)
            font_size_pdf = size // 6
            font_pdf = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size_pdf)
            text_pdf = "PDF"
            bbox = draw.textbbox((0, 0), text_pdf, font=font_pdf)
            text_width = bbox[2] - bbox[0]
            text_x = (size - text_width) // 2
            text_y_pdf = size // 2 + size // 12
            draw.text((text_x, text_y_pdf), text_pdf, fill=(200, 50, 50, 255), font=font_pdf)
        except:
            # Fallback to lines if font fails
            draw_document_lines(draw, size, doc_left, doc_top, doc_right, doc_bottom)
    else:
        # For smaller sizes, draw document lines
        draw_document_lines(draw, size, doc_left, doc_top, doc_right, doc_bottom)

    return img

def draw_document_lines(draw, size, left, top, right, bottom):
    """Draw simple horizontal lines to represent document text"""
    line_count = 3
    line_margin = size // 6
    line_spacing = (bottom - top - 2 * line_margin) // (line_count + 1)
    line_width = max(1, size // 64)

    for i in range(line_count):
        y = top + line_margin + (i + 1) * line_spacing
        draw.line(
            [(left + line_margin, y), (right - line_margin, y)],
            fill=(100, 100, 100, 200),
            width=line_width
        )

def create_iconset():
    """Create all required icon sizes for macOS"""
    sizes = [
        (16, 1), (16, 2),
        (32, 1), (32, 2),
        (128, 1), (128, 2),
        (256, 1), (256, 2),
        (512, 1), (512, 2)
    ]

    iconset_dir = "AppIcon.iconset"
    os.makedirs(iconset_dir, exist_ok=True)

    for size, scale in sizes:
        actual_size = size * scale
        img = create_icon_image(actual_size)

        if scale == 1:
            filename = f"icon_{size}x{size}.png"
        else:
            filename = f"icon_{size}x{size}@{scale}x.png"

        filepath = os.path.join(iconset_dir, filename)
        img.save(filepath, "PNG")
        print(f"Created {filename}")

    return iconset_dir

if __name__ == "__main__":
    try:
        print("Creating icon images...")
        iconset_dir = create_iconset()
        print(f"\nIconset created in {iconset_dir}/")
        print("\nRun this command to create the .icns file:")
        print(f"iconutil -c icns {iconset_dir}")
    except ImportError:
        print("ERROR: PIL (Pillow) is required to create icons")
        print("Install it with: pip install Pillow")
        exit(1)
