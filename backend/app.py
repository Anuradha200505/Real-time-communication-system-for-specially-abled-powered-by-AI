from flask import Flask
from flask_cors import CORS

from routes.gesture import gesture_bp

app = Flask(__name__)
CORS(app)

# Register route
app.register_blueprint(gesture_bp)

@app.route("/")
def home():
    return {"message": "Backend running"}

if __name__ == "__main__":
    app.run(debug=True)