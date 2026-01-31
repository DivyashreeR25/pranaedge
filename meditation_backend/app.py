# app.py
from flask import Flask, request, jsonify
from content import generate_meditation_script

app = Flask(__name__)

@app.route("/generate_meditation", methods=["POST"])
def generate_meditation():
    """
    POST /generate_meditation
    Body: { "emotion": "calm" }
    Response: { "script": "<3-minute meditation text>" }
    """
    data = request.get_json()
    emotion = data.get("emotion", "calm")

    script = generate_meditation_script(emotion)
    return jsonify({"emotion": emotion, "script": script})

if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0", port=8081)
