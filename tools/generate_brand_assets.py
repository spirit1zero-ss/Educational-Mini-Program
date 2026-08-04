"""Generate the public-facing training-camp brand assets.

The transparent concept mark is kept in ``docs/brand/growth-learning-concept-mark.png``.
This script crops and optimizes that mark, then creates the exact sizes expected
by the CRMEB admin shell without changing its URLs. The reviewed mini program is
intentionally outside this generator's scope.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "brand" / "growth-learning-concept-mark.png"
ADMIN_ROOT = ROOT / "src" / "CRMEB" / "CRMEB-master"
ADMIN_PUBLIC = ADMIN_ROOT / "crmeb" / "public"
ADMIN_TEMPLATE = ADMIN_ROOT / "template" / "admin"

BRAND_NAME = "自主学习训练营"
DEEP_GREEN = "#183327"
OFF_WHITE = "#F8FAF4"


def find_font() -> Path:
    candidates = [
        Path("C:/Windows/Fonts/msyhbd.ttc"),
        Path("C:/Windows/Fonts/msyh.ttc"),
        Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"),
        Path("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("No CJK font was found for the brand wordmark")


def load_mark() -> Image.Image:
    image = Image.open(SOURCE).convert("RGBA")
    cleaned_pixels = []
    for red, green, blue, alpha in image.getdata():
        # Remove the last anti-aliased pixels left by the magenta concept matte.
        if alpha and red > green + 24 and blue > green + 24:
            alpha = 0
        if alpha == 0:
            red = green = blue = 0
        cleaned_pixels.append((red, green, blue, alpha))
    image.putdata(cleaned_pixels)
    visible_alpha = image.getchannel("A").point(lambda value: 255 if value >= 32 else 0)
    alpha_box = visible_alpha.getbbox()
    if not alpha_box:
        raise ValueError(f"Brand source has no visible pixels: {SOURCE}")
    return image.crop(alpha_box)


def contain_mark(mark: Image.Image, size: tuple[int, int], padding: int = 0) -> Image.Image:
    width, height = size
    available = (max(1, width - padding * 2), max(1, height - padding * 2))
    fitted = mark.copy()
    fitted.thumbnail(available, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (width - fitted.width) // 2
    y = (height - fitted.height) // 2
    canvas.alpha_composite(fitted, (x, y))
    return canvas


def rounded_icon(mark: Image.Image, size: int, background: str = OFF_WHITE) -> Image.Image:
    scale = 4
    canvas = Image.new("RGBA", (size * scale, size * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    radius = int(size * 0.22 * scale)
    draw.rounded_rectangle(
        (0, 0, size * scale - 1, size * scale - 1),
        radius=radius,
        fill=background,
    )
    inset = int(size * 0.14 * scale)
    fitted = contain_mark(mark, (size * scale - inset * 2, size * scale - inset * 2))
    canvas.alpha_composite(fitted, (inset, inset))
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def wordmark(
    mark: Image.Image,
    size: tuple[int, int],
    text_color: str,
    font_size: int,
    mark_size: int,
    text: str = BRAND_NAME,
    mark_background: str | None = None,
) -> Image.Image:
    width, height = size
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    icon = (
        rounded_icon(mark, mark_size, mark_background)
        if mark_background
        else contain_mark(mark, (mark_size, mark_size), padding=max(1, mark_size // 18))
    )
    icon_y = (height - mark_size) // 2
    canvas.alpha_composite(icon, (2, icon_y))

    font = ImageFont.truetype(str(find_font()), font_size)
    draw = ImageDraw.Draw(canvas)
    text_x = mark_size + max(6, font_size // 4)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_height = bbox[3] - bbox[1]
    text_y = (height - text_height) // 2 - bbox[1]
    draw.text((text_x, text_y), text, font=font, fill=text_color)
    return canvas


def login_slide(mark: Image.Image) -> Image.Image:
    scale = 3
    width, height = 510 * scale, 420 * scale
    canvas = Image.new("RGB", (width, height), OFF_WHITE)
    draw = ImageDraw.Draw(canvas)

    # Soft green field with a warm learning-path accent.
    for y in range(height):
        progress = y / max(1, height - 1)
        start = (248, 250, 244)
        end = (226, 242, 232)
        color = tuple(round(start[i] * (1 - progress) + end[i] * progress) for i in range(3))
        draw.line((0, y, width, y), fill=color)
    draw.ellipse((1040, -180, 1730, 510), fill="#DCEFE2")
    draw.ellipse((1110, 720, 1640, 1250), fill="#F3E5BE")

    icon = contain_mark(mark, (270, 270), padding=10)
    canvas.paste(icon, (1080, 210), icon)

    brand_font = ImageFont.truetype(str(find_font()), 104)
    title_font = ImageFont.truetype(str(find_font()), 54)
    note_font = ImageFont.truetype(str(find_font()), 38)
    draw.text((120, 105), BRAND_NAME, font=brand_font, fill=DEEP_GREEN)
    draw.text((124, 285), "让孩子从被催着学，到主动会学", font=title_font, fill="#245C4A")
    draw.rounded_rectangle((124, 410, 790, 500), radius=45, fill="#FFFFFF")
    draw.text((172, 430), "方法 · 习惯 · 内驱力", font=note_font, fill="#9A6F22")

    card_x, card_y = 124, 705
    labels = (("01", "学习方法"), ("02", "习惯养成"), ("03", "内驱成长"))
    for index, (number, label) in enumerate(labels):
        x = card_x + index * 300
        draw.rounded_rectangle((x, card_y, x + 258, card_y + 210), radius=34, fill="#FFFFFF")
        draw.ellipse((x + 30, card_y + 34, x + 112, card_y + 116), fill="#21A75A")
        number_font = ImageFont.truetype(str(find_font()), 31)
        label_font = ImageFont.truetype(str(find_font()), 37)
        draw.text((x + 48, card_y + 56), number, font=number_font, fill="#FFFFFF")
        draw.text((x + 30, card_y + 138), label, font=label_font, fill=DEEP_GREEN)

    return canvas.resize((510, 420), Image.Resampling.LANCZOS)


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def save_jpeg(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    background = Image.new("RGB", image.size, OFF_WHITE)
    if image.mode == "RGBA":
        background.paste(image, mask=image.getchannel("A"))
    else:
        background.paste(image)
    background.save(path, format="JPEG", quality=92, optimize=True)


def main() -> None:
    mark = load_mark()

    system_images = ADMIN_PUBLIC / "statics" / "system_images"
    save_png(
        wordmark(mark, (271, 74), "#FFFFFF", 27, 66, mark_background=OFF_WHITE),
        system_images / "admin_logo_big.png",
    )
    save_png(wordmark(mark, (271, 74), DEEP_GREEN, 27, 66), system_images / "admin_login_logo.png")
    save_png(rounded_icon(mark, 360), system_images / "admin_logo_small.png")
    save_png(rounded_icon(mark, 200), system_images / "admin_head_pic.png")
    save_jpeg(rounded_icon(mark, 147), system_images / "default_avatar.jpeg")
    save_jpeg(rounded_icon(mark, 147), system_images / "login_logo.jpeg")
    save_jpeg(rounded_icon(mark, 147), system_images / "share_image.jpeg")
    save_png(wordmark(mark, (127, 45), DEEP_GREEN, 20, 42, text="训练营"), system_images / "pc_logo.png")

    pwa_icon = rounded_icon(mark, 144)
    save_png(pwa_icon, ADMIN_TEMPLATE / "public" / "image" / "logo-small.png")

    fallback_logo = wordmark(mark, (720, 180), DEEP_GREEN, 70, 164)
    save_png(fallback_logo, ADMIN_TEMPLATE / "src" / "assets" / "images" / "logo.png")
    save_png(login_slide(mark), ADMIN_TEMPLATE / "src" / "assets" / "images" / "sw.png")

    favicon = rounded_icon(mark, 64)
    favicon_paths = [
        ADMIN_PUBLIC / "favicon.ico",
        ADMIN_TEMPLATE / "public" / "favicon.ico",
    ]
    for path in favicon_paths:
        path.parent.mkdir(parents=True, exist_ok=True)
        favicon.save(path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])


if __name__ == "__main__":
    main()
