import tensorflow as tf
import numpy as np
import json
from backend.pose_feedback import (
    get_tree_pose_feedback,
    get_bhujangasana_feedback,
    get_dandasana_feedback,
    get_gomukhasana_feedback,
    get_padmasana_feedback,
    get_vajrasana_feedback,
    get_ardhamatsyendrasana_feedback
)

model = tf.keras.models.load_model("backend/yoga_pose_model.h5")

with open("backend/yoga_poses_classes.json") as f:
    class_names = json.load(f)

# Dispatch table for pose feedback functions
POSE_FEEDBACK_MAP = {
    "treepose": get_tree_pose_feedback,
    "bhujangasana": get_bhujangasana_feedback,
    "dandasana": get_dandasana_feedback,
    "gomukhasana": get_gomukhasana_feedback,
    "padmasana": get_padmasana_feedback,
    "vajrasana": get_vajrasana_feedback,
    "ardhamatsyendrasana": get_ardhamatsyendrasana_feedback,
}

def predict_pose(landmarks_flat, structured_landmarks, selected_pose):
    input_data = np.expand_dims(landmarks_flat, axis=0)
    predictions = model.predict(input_data)
    print("Model raw predictions:", predictions)
    class_id = int(np.argmax(predictions))
    pose_class = class_names[str(class_id)]
    print("Predicted class:", pose_class)

    # Choose correct feedback logic
    feedback_fn = POSE_FEEDBACK_MAP.get(selected_pose.lower())
    if feedback_fn:
        feedback = feedback_fn(pose_class, structured_landmarks)
    else:
        feedback = [f"No feedback logic implemented yet for {selected_pose}."]

    return pose_class, feedback
