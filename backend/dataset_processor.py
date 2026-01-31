# dataset_processor.py
from utils import extract_landmarks
import os
import cv2
import numpy as np

def process_dataset(dataset_path):
    X = []
    y = []
    
    pose_types = os.listdir(dataset_path)
    pose_dict = {pose_type: idx for idx, pose_type in enumerate(pose_types)}
    
    for pose_type in pose_types:
        pose_path = os.path.join(dataset_path, pose_type)
        
        if not os.path.isdir(pose_path):
            continue
            
        for img_name in os.listdir(pose_path):
            img_path = os.path.join(pose_path, img_name)
            
            if not img_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                continue
                
            try:
                img = cv2.imread(img_path)
                if img is None:
                    print(f"Failed to read image: {img_path}")
                    continue
                    
                landmarks = extract_landmarks(img)
                
                if landmarks is not None:
                    X.append(landmarks)
                    y.append(pose_dict[pose_type])
                else:
                    print(f"No landmarks detected in: {img_path}")
            
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
    
    return np.array(X), np.array(y), pose_dict