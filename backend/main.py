from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

app = FastAPI()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class CodeRequest(BaseModel):
    code: str
    action: str  # "explain" or "improve"

@app.post("/analyze_code")
async def analyze_code(request: CodeRequest):
    try:
        if not request.code.strip():
            raise HTTPException(status_code=400, detail="Code cannot be empty.")

        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = (
            f"Please {request.action} this code:\n\n{request.code}\n\n"
            "If explaining, be concise but clear. "
            "If improving, provide improved code and reasoning."
        )

        response = model.generate_content(prompt)
        return {"result": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
