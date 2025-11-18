from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    action: str

@app.post("/process-code")
def process_code(req: CodeRequest):
    model = genai.GenerativeModel("models/gemini-2.5-flash")
    prompt = f"The user wants to {req.action} this code:\n{req.code}"
    
    response = model.generate_content(prompt)
    return {"result": response.text}