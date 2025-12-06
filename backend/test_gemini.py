import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key exists: {bool(api_key)}")
print(f"API Key (first 10 chars): {api_key[:10] if api_key else 'MISSING'}")

if api_key:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("models/gemini-2.0-flash-exp")
        response = model.generate_content("Say hello")
        print("✅ Gemini API works!")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
else:
    print("❌ GEMINI_API_KEY not found in .env")