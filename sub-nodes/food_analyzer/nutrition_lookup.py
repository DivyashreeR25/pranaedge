# nutrition_lookup.py
"""
Small local nutrition database and lookup utilities.
In production you should replace or augment this with a call to USDA FoodData Central
or another comprehensive nutrition API/dataset.
"""

class NutritionLookup:
    def __init__(self):
        # local averaged nutrition per 100g or per serving (units: energy_kcal, protein_g, fat_g, carb_g)
        # NOTE: values are illustrative/approximate; replace with authoritative data
        self.db = {
            "pizza": {"energy_kcal": 266, "protein_g": 11, "fat_g": 10, "carbohydrate_g": 33},
            "burger": {"energy_kcal": 295, "protein_g": 17, "fat_g": 12, "carbohydrate_g": 30},
            "hot_dog": {"energy_kcal": 290, "protein_g": 10, "fat_g": 26, "carbohydrate_g": 2},
            "pasta": {"energy_kcal": 131, "protein_g": 5, "fat_g": 1.1, "carbohydrate_g": 25},
            "ice_cream": {"energy_kcal": 207, "protein_g": 3.5, "fat_g": 11, "carbohydrate_g": 24},
            "sushi": {"energy_kcal": 130, "protein_g": 3, "fat_g": 0.5, "carbohydrate_g": 28},
            "banana": {"energy_kcal": 89, "protein_g": 1.1, "fat_g": 0.3, "carbohydrate_g": 23},
            "apple": {"energy_kcal": 52, "protein_g": 0.3, "fat_g": 0.2, "carbohydrate_g": 14},
            "orange": {"energy_kcal": 47, "protein_g": 0.9, "fat_g": 0.1, "carbohydrate_g": 12},
            "coffee": {"energy_kcal": 1, "protein_g": 0.1, "fat_g": 0, "carbohydrate_g": 0},
        }

    def lookup_by_label(self, label):
        """
        label: normalized predicted label (e.g., 'pizza', 'burger', or raw imagenet label)
        returns nutrition dictionary or an explanation if unknown
        """
        key = label.lower().replace(" ", "_")
        if key in self.db:
            return {"per_100g": self.db[key], "unit": "per_100g", "source": "local_db"}
        # fallback: try partial match
        for k in self.db.keys():
            if k in key or key in k:
                return {"per_100g": self.db[k], "unit": "per_100g", "source": "local_db_partial_match", "matched": k}
        return {"error": "No nutrition data for predicted label. Extend local DB or connect to USDA FoodData Central."}
