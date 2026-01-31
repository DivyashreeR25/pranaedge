# pose_feedback.py

def get_tree_pose_feedback(pose_class, landmarks):
    if pose_class != "Tree Pose":
        return ["Please assume the tree pose."]

    feedback = []
    left_wrist_y = landmarks[15].y
    right_wrist_y = landmarks[16].y
    nose_y = landmarks[0].y

    if not (left_wrist_y < nose_y and right_wrist_y < nose_y):
        feedback.append("Raise both hands above your head.")

    left_ankle_y = landmarks[27].y
    right_ankle_y = landmarks[28].y
    if abs(left_ankle_y - right_ankle_y) < 0.05:
        feedback.append("Lift one foot and place it on the opposite thigh.")

    left_hip_y = landmarks[23].y
    right_hip_y = landmarks[24].y
    if abs(left_hip_y - right_hip_y) > 0.1:
        feedback.append("Keep your hips level.")

    if not feedback:
        feedback.append("Perfect! You are holding the Tree Pose correctly.")
    return feedback

def get_ardhamatsyendrasana_feedback(pose_class, landmarks):
    if pose_class != "ardhamatsyendrasana":
        return ["Please assume the Half Spinal Twist Pose."]

    feedback = []

    # 1. Spine alignment: nose vs hips (should be vertically aligned)
    nose_x = landmarks[0].x
    mid_hip_x = (landmarks[23].x + landmarks[24].x) / 2
    if abs(nose_x - mid_hip_x) > 0.1:
        feedback.append("Keep your spine upright and avoid leaning sideways.")

    # 2. Shoulder twist: compare left and right shoulders
    left_shoulder_x = landmarks[11].x
    right_shoulder_x = landmarks[12].x
    shoulder_diff = abs(left_shoulder_x - right_shoulder_x)

    if shoulder_diff < 0.05:  
        feedback.append("Twist your torso more deeply to the side.")
    elif shoulder_diff > 0.3:  
        feedback.append("Avoid over-twisting, keep shoulders balanced.")

    # 3. Leg position: one knee raised, other folded
    left_knee_y = landmarks[25].y
    right_knee_y = landmarks[26].y
    if abs(left_knee_y - right_knee_y) < 0.05:
        feedback.append("Bend one knee and place the foot outside the opposite thigh.")

    # 4. Hips level
    left_hip_y = landmarks[23].y
    right_hip_y = landmarks[24].y
    if abs(left_hip_y - right_hip_y) > 0.1:
        feedback.append("Keep both hips grounded and level.")

    if not feedback:
        feedback.append("Perfect! You are holding the Half Spinal Twist correctly.")

    return feedback

def get_bhujangasana_feedback(pose_class, landmarks):
    if pose_class != "bhujangasana":
        return ["Please assume the Cobra Pose."]

    feedback = []
    nose_y = landmarks[0].y
    hip_y = (landmarks[23].y + landmarks[24].y) / 2

    # Head should be higher than hips
    if not (nose_y < hip_y - 0.1):
        feedback.append("Lift your chest and head upward.")

    # Arms (elbows slightly bent but pushing)
    left_elbow_y = landmarks[13].y
    right_elbow_y = landmarks[14].y
    if abs(left_elbow_y - right_elbow_y) > 0.05:
        feedback.append("Keep both arms balanced and straight.")

    if not feedback:
        feedback.append("Perfect! Cobra Pose looks great.")
    return feedback


def get_dandasana_feedback(pose_class, landmarks):
    if pose_class != "dandasana":
        return ["Please assume the Staff Pose."]

    feedback = []
    left_knee_y = landmarks[25].y
    right_knee_y = landmarks[26].y
    if abs(left_knee_y - right_knee_y) > 0.05:
        feedback.append("Keep both legs straight and even.")

    # Spine alignment: head and hips
    nose_x = landmarks[0].x
    mid_hip_x = (landmarks[23].x + landmarks[24].x) / 2
    if abs(nose_x - mid_hip_x) > 0.05:
        feedback.append("Keep your spine straight.")

    if not feedback:
        feedback.append("Perfect Staff Pose posture.")
    return feedback


def get_gomukhasana_feedback(pose_class, landmarks):
    if pose_class != "gomukhasana":
        return ["Please assume the Cow Face Pose."]

    feedback = []
    left_wrist_y = landmarks[15].y
    right_wrist_y = landmarks[16].y

    if abs(left_wrist_y - right_wrist_y) > 0.2:
        feedback.append("Bring both hands closer behind your back.")

    if not feedback:
        feedback.append("Excellent Cow Face Pose alignment.")
    return feedback


def get_padmasana_feedback(pose_class, landmarks):
    if pose_class != "padmasana":
        return ["Please assume the Lotus Pose."]

    feedback = []
    left_ankle_y = landmarks[27].y
    right_ankle_y = landmarks[28].y
    if abs(left_ankle_y - right_ankle_y) > 0.1:
        feedback.append("Keep both feet placed evenly on thighs.")

    nose_x = landmarks[0].x
    mid_hip_x = (landmarks[23].x + landmarks[24].x) / 2
    if abs(nose_x - mid_hip_x) > 0.05:
        feedback.append("Maintain an upright spine.")

    if not feedback:
        feedback.append("Perfect! You are sitting in Lotus Pose.")
    return feedback


def get_vajrasana_feedback(pose_class, landmarks):
    if pose_class != "vajrasana":
        return ["Please assume the Thunderbolt Pose."]

    feedback = []
    # Knees should be close together
    left_knee_x = landmarks[25].x
    right_knee_x = landmarks[26].x
    if abs(left_knee_x - right_knee_x) > 0.1:
        feedback.append("Keep your knees close together.")

    # Spine check
    nose_x = landmarks[0].x
    mid_hip_x = (landmarks[23].x + landmarks[24].x) / 2
    if abs(nose_x - mid_hip_x) > 0.05:
        feedback.append("Keep your back upright.")

    if not feedback:
        feedback.append("Perfect Thunderbolt Pose alignment.")
    return feedback
