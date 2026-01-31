# food_classifier.py
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import tensorflow.keras.backend as K

class FoodClassifier:
    def __init__(self):
        # Use MobileNetV2 pretrained on ImageNet as a baseline classifier
        # (ImageNet labels include many food classes; for production, replace with a Food-specific model)
        self.model = MobileNetV2(weights="imagenet")

        # A small map from some common ImageNet labels to normalized food names for lookup
        # Extend this map for better coverage
        self.imagenet_to_food = {
            "cheeseburger": "burger",
            "hotdog": "hot_dog",
            "pizza": "pizza",
            "spaghetti": "pasta",
            "ice_cream": "ice_cream",
            "ice_lolly": "ice_cream",
            "sushi": "sushi",
            "bagel": "bread",
            "banana": "banana",
            "apple": "apple",
            "orange": "orange",
            "red_wine": "wine",
            "cup": "coffee",  # sometimes cups classify as coffee/tea
            # ... add more mappings as needed
        }

    def _load_and_preprocess(self, path, target_size=(224,224)):
        img = image.load_img(path, target_size=target_size)
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        return x

    def classify(self, image_path, top_k=3):
        x = self._load_and_preprocess(image_path)
        preds = self.model.predict(x)
        decoded = decode_predictions(preds, top=top_k)[0]  # list of tuples (class_id, label, prob)
        top_k_list = []
        for class_id, label, prob in decoded:
            # format label nicely
            nl = label.replace("_", " ")
            top_k_list.append({"imagenet_label": label, "readable": nl, "prob": float(prob)})
        top_label = decoded[0][1]  # imagenet label string
        mapped_label = self.imagenet_to_food.get(top_label, top_label)
        # clear session to avoid memory growth in long-running server (optional)
        K.clear_session()
        return {"top_k": top_k_list, "top_label": mapped_label}
