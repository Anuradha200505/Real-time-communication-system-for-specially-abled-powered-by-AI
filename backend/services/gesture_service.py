import cv2
import mediapipe as mp
import numpy as np
import base64

mp_hands = mp.solutions.hands
hands = mp_hands.Hands()
mp_draw = mp.solutions.drawing_utils


def detect_gesture(landmarks):
    # Simple rule-based detection

    # Get fingertip y positions
    finger_tips = [8, 12, 16, 20]
    fingers_up = []

    for tip in finger_tips:
        if landmarks[tip].y < landmarks[tip - 2].y:
            fingers_up.append(1)
        else:
            fingers_up.append(0)

    # Gesture logic
    if fingers_up == [0, 0, 0, 0]:
        return "A ✊"
    elif fingers_up == [1, 1, 1, 1]:
        return "B ✋"
    elif fingers_up == [1, 0, 0, 0]:
        return "C 🤏"
    else:
        return "Unknown 🤷"


def process_image(image_data):
    try:
        image_data = image_data.split(",")[1]
        img_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                gesture = detect_gesture(hand_landmarks.landmark)
                return gesture
        else:
            return "No hand detected ❌"

    except Exception as e:
        print("Error:", e)
        return "Error processing image"