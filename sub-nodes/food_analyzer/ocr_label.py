# ocr_label.py
import easyocr
import re
from collections import defaultdict

class OCRLabelExtractor:
    def __init__(self, langs=None, gpu=False):
        # languages default to English
        self.reader = easyocr.Reader(langs or ['en'], gpu=gpu)

        # regex patterns for typical nutrition label fields (robust to spacing/case)
        self.patterns = {
            "energy_kj": re.compile(r"energy[^\d\-]*(\d{2,5})(?:\s*kJ)?", re.I),
            "energy_kcal": re.compile(r"energy[^\d\-]*(\d{2,5})(?:\s*kcal)", re.I),
            "protein_g": re.compile(r"protein[^\d\-]*(\d+\.?\d*)\s*g", re.I),
            "fat_g": re.compile(r"(?:fat|fat - total|total fat)[^\d\-]*(\d+\.?\d*)\s*g", re.I),
            "saturated_g": re.compile(r"saturat(?:ed)?[^\d\-]*(\d+\.?\d*)\s*g", re.I),
            "carbohydrate_g": re.compile(r"carbohydra(?:te)?[^\d\-]*(\d+\.?\d*)\s*g", re.I),
            "sugars_g": re.compile(r"sugars?[^\d\-]*(\d+\.?\d*)\s*g", re.I),
            "sodium_mg": re.compile(r"sodium[^\d\-]*(\d+\.?\d*)\s*mg", re.I),
            "calcium_mg": re.compile(r"calcium[^\d\-]*(\d+\.?\d*)\s*mg", re.I),
        }

        # keywords that strongly indicate a nutrition label
        self.label_keywords = ["energy", "protein", "carbohydrate", "sodium", "calcium", "serving size", "per serving", "per 100ml", "ingredients"]

    def extract_nutrients(self, image_path):
        """
        Run OCR and extract nutrients.
        Returns: dict with keys
          - is_label: bool
          - raw_text: str
          - nutrients: dict
          - confidence: optional
        """
        results = self.reader.readtext(image_path, detail=0)
        text = " ".join(results)
        lower = text.lower()

        # Quick label detection: presence of multiple keywords
        keyword_count = sum(1 for kw in self.label_keywords if kw in lower)
        is_label = keyword_count >= 2  # threshold; tweak if needed

        # Try to extract numeric nutrient values
        nutrients = {}
        for key, patt in self.patterns.items():
            m = patt.search(text)
            if m:
                val = m.group(1)
                try:
                    if "." in val:
                        nutrients[key] = float(val)
                    else:
                        nutrients[key] = int(val)
                except:
                    try:
                        nutrients[key] = float(val)
                    except:
                        nutrients[key] = val

        # If we found an "energy_kcal" convert or prefer kcal; if only kJ, keep kJ.
        # Also separate mapping to user-friendly names
        mapped = {}
        if "energy_kcal" in nutrients:
            mapped["energy_kcal"] = nutrients["energy_kcal"]
        elif "energy_kj" in nutrients:
            mapped["energy_kj"] = nutrients["energy_kj"]

        # map others
        if "protein_g" in nutrients:
            mapped["protein_g"] = nutrients["protein_g"]
        if "fat_g" in nutrients:
            mapped["fat_g"] = nutrients["fat_g"]
        if "saturated_g" in nutrients:
            mapped["saturated_g"] = nutrients["saturated_g"]
        if "carbohydrate_g" in nutrients:
            mapped["carbohydrate_g"] = nutrients["carbohydrate_g"]
        if "sugars_g" in nutrients:
            mapped["sugars_g"] = nutrients["sugars_g"]
        if "sodium_mg" in nutrients:
            mapped["sodium_mg"] = nutrients["sodium_mg"]
        if "calcium_mg" in nutrients:
            mapped["calcium_mg"] = nutrients["calcium_mg"]

        # confidence metric: number of nutrient fields extracted
        confidence = len(mapped) / (len(self.patterns) + 0.0)

        return {
            "is_label": is_label and len(mapped) > 0,
            "raw_text": text,
            "nutrients": mapped,
            "confidence": confidence
        }
