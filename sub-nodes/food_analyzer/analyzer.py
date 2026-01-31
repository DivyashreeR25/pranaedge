# analyzer.py
import tempfile
from ocr_label import OCRLabelExtractor
from food_classifier import FoodClassifier
from nutrition_lookup import NutritionLookup
from utils import save_uploaded_file

ocr = OCRLabelExtractor()
classifier = FoodClassifier()
lookup = NutritionLookup()

def analyze_image_file(file_storage):
    """
    file_storage: werkzeug FileStorage object
    Returns a dictionary describing the analysis.
    """
    # Save temporarily
    tmp_path = save_uploaded_file(file_storage)
    try:
        # 1) Try label OCR and parsing
        ocr_result = ocr.extract_nutrients(tmp_path)
        if ocr_result["is_label"]:
            return {
                "source": "label",
                "nutrients": ocr_result["nutrients"],
                "raw_text": ocr_result["raw_text"],
                "confidence": ocr_result.get("confidence", None),
            }

        # 2) Otherwise treat as food photo: classify and lookup nutrition
        class_result = classifier.classify(tmp_path, top_k=3)
        top_label = class_result["top_label"]
        top_probs = class_result["top_k"]
        # get nutrition from local DB (or fallback average)
        nutrition = lookup.lookup_by_label(top_label)
        return {
            "source": "photo",
            "top_labels": top_probs,
            "predicted_label": top_label,
            "nutrients": nutrition,
            "raw_text": ocr_result["raw_text"],  # may be empty or short
        }
    finally:
        # Cleanup temp file
        try:
            import os
            os.remove(tmp_path)
        except Exception:
            pass
