from flask import Blueprint, request, jsonify, send_file
from services.gesture_service import process_image
from gtts import gTTS
import os
import uuid

gesture_bp = Blueprint("gesture", __name__)

# 📁 folder to store audio
AUDIO_FOLDER = "audio"
os.makedirs(AUDIO_FOLDER, exist_ok=True)


@gesture_bp.route("/gesture-to-text", methods=["POST"])
def gesture_to_text():
    try:
        data = request.json
        image = data.get("image")

        if not image:
            return jsonify({"error": "No image provided"}), 400

        text = process_image(image)

        # 🎧 Convert text → speech
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(AUDIO_FOLDER, filename)

        tts = gTTS(text=text)
        tts.save(filepath)

        return jsonify({
            "text": text,
            "audio_url": f"http://127.0.0.1:5000/audio/{filename}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gesture_bp.route("/audio/<filename>")
def get_audio(filename):
    path = os.path.join(AUDIO_FOLDER, filename)
    return send_file(path, mimetype="audio/mpeg")