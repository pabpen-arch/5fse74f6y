from PIL import Image, ImageDraw
import numpy as np

# ============================
# CARGAR IMAGEN
# ============================
img = Image.open('C:\\Users\\usu-calfnc_37\\Documents\\Datamarshall\\1.Scripts\\DigitalCommandCenter_HTML\\ChatBot.png').convert("RGBA")
width, height = img.size

frames = []

# ============================
# POSICIÓN REAL DE LA BOCA
# (AJUSTADA MANUALMENTE)
# ============================
mouth_x = int(width * 0.45)
mouth_y = int(height * 0.54)

# ============================
# POSICIÓN DE OJOS
# ============================
left_eye = (int(width * 0.38), int(height * 0.42))
right_eye = (int(width * 0.62), int(height * 0.42))

# ============================
# CREAR FRAMES
# ============================
for i in range(20):

    frame = img.copy()
    draw = ImageDraw.Draw(frame)

    # ----------------------------
    # 🟢 ANIMACIÓN DE BOCA
    # ----------------------------
    open_factor = abs(np.sin(i / 2))

    mouth_width = int(width * 0.12)
    mouth_height = int(height * (0.015 + 0.03 * open_factor))

    draw.ellipse([
        mouth_x - mouth_width // 2,
        mouth_y - mouth_height // 2,
        mouth_x + mouth_width // 2,
        mouth_y + mouth_height // 2
    ], fill=(0, 0, 0, 255))

    # ----------------------------
    # 👀 PARPADEO DE OJOS
    # ----------------------------
    if i % 10 == 0:
        # Ojos cerrados (línea)
        draw.line([
            (left_eye[0] - 20, left_eye[1]),
            (left_eye[0] + 20, left_eye[1])
        ], fill=(0,0,0), width=5)

        draw.line([
            (right_eye[0] - 20, right_eye[1]),
            (right_eye[0] + 20, right_eye[1])
        ], fill=(0,0,0), width=5)

    # ----------------------------
    # 🤖 MICRO MOVIMIENTO (VIDA)
    # ----------------------------
    frame = frame.rotate(np.sin(i/5)*1.5, resample=Image.BICUBIC)

    frames.append(frame)

# ============================
# GUARDAR GIF
# ============================
gif_path = "C:\\Users\\usu-calfnc_37\\Documents\\Datamarshall\\1.Scripts\\DigitalCommandCenter_HTML\\chatbot_pro.gif"
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=80,
    loop=0
)

print("GIF creado en:", gif_path)