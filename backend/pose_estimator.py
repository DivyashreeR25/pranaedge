import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)

def extract_landmarks(image):
    image_rgb = image[:, :, ::-1]
    results = pose.process(image_rgb)

    if not results.pose_landmarks:
        return None, None

    landmarks = results.pose_landmarks.landmark
    flat_landmarks = []
    for lm in landmarks:
        flat_landmarks.extend([lm.x, lm.y, lm.z, lm.visibility])

    return np.array(flat_landmarks), landmarks  # Return both flat and structured landmarks
