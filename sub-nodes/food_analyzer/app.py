# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from analyzer import analyze_image_file

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})


# Single route only (food analyzer).
@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Expects multipart/form-data with 'image' file.
    Returns JSON with:
      - source: "label" | "photo" | "unknown"
      - nutrients: dict (energy(provided in kJ or kcal), protein(g), fat(g), carbs(g), etc.)
      - raw_text: OCRed text when available
      - top_labels: classification outputs when photo
      - message, status
    """
    if "image" not in request.files:
        return jsonify({"status": "error", "message": "No image file uploaded. Use field name 'image'."}), 400

    image_file = request.files["image"]
    try:
        result = analyze_image_file(image_file)
        return jsonify({"status": "success", "result": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8082)
