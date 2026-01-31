# content.py
import os
import google.generativeai as genai
from dotenv import load_dotenv
from rules import generate_prompt

load_dotenv()  # Load GEMINI_API_KEY from .env

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_meditation_script(emotion: str) -> str:
    """
    Generates a meditation script text using Gemini API based on emotion.
    """
    prompt = generate_prompt(emotion)
    
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    
    except Exception as e:
        print("❌ Error generating meditation script:", e)
        return "Sorry, something went wrong while generating your meditation."
