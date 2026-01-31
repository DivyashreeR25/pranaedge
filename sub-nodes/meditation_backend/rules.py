# rules.py

def generate_prompt(emotion: str) -> str:
    """
    Generate a structured rule-based prompt for meditation content generation.
    """
    base_rules = """
    You are an expert meditation instructor. 
    Your task is to generate a guided meditation script lasting approximately 3 minutes.
    The tone should be calm, gentle, and relaxing.
    Include breathing instructions, visualization, and mindfulness cues.
    Avoid repetition and keep the flow natural.
    Do not mention time duration explicitly.
    """

    emotion_rules = {
        "happy": "Focus on gratitude and joy. Encourage users to embrace and amplify positive emotions.",
        "calm": "Focus on deep stillness, mindful breathing, and grounding awareness.",
        "anxious": "Focus on slow breathing, relaxation, and letting go of worries.",
        "sad": "Focus on self-compassion, healing, and emotional release.",
        "stressed": "Focus on relaxation, deep breaths, and body awareness to relieve tension.",
        "angry": "Focus on cooling breath, emotional balance, and forgiveness.",
        "focus": "Focus on concentration and mindfulness training."
    }

    emotion_instruction = emotion_rules.get(
        emotion.lower(),
        "Focus on general mindfulness, breath awareness, and relaxation."
    )

    return f"{base_rules}\n\nMeditation Theme: {emotion.capitalize()}\nInstructions: {emotion_instruction}\n\nGenerate now:"
