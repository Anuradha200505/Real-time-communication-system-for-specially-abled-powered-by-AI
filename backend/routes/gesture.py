from flask import Blueprint, request, jsonify, send_file
from services.gesture_service import process_image
from gtts import gTTS
from googletrans import Translator
import os
import uuid

gesture_bp = Blueprint("gesture", __name__)

translator = Translator()

AUDIO_FOLDER = "audio"
os.makedirs(AUDIO_FOLDER, exist_ok=True)


@gesture_bp.route("/gesture-to-text", methods=["POST"])
def gesture_to_text():
    try:
        data = request.json
        image = data.get("image")
        lang = data.get("lang", "en")

        if not image:
            return jsonify({"error": "No image"}), 400

        # 👉 Gesture → Text
        text = process_image(image)

        # 👉 Translate
        translated = translator.translate(text, dest=lang).text

        # 👉 Text → Speech
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(AUDIO_FOLDER, filename)

        tts = gTTS(text=translated, lang=lang)
        tts.save(filepath)

        return jsonify({
            "text": translated,
            "audio_url": f"http://127.0.0.1:5000/audio/{filename}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gesture_bp.route("/audio/<filename>")
def get_audio(filename):
    return send_file(os.path.join(AUDIO_FOLDER, filename), mimetype="audio/mpeg")