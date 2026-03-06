import os
import json
from google import genai
from journal_rules.rules import get_base_rules

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def get_formatting_rules(target_style, structured_data):
    base_rules = get_base_rules(target_style)
    
    prompt = f"""
    Act as an expert LaTeX typesetter for academic journals.
    I need formatting rules for {target_style} style.
    Here is a summary of the document structure: {list(structured_data.keys())}
    
    Provide a JSON response with:
    1. 'preamble': Required LaTeX packages and documentclass setup.
    2. 'macros': Any specific custom commands needed.
    3. 'environment_rules': How to wrap abstract, body, and references.
    Output ONLY valid JSON without formatting blocks if possible.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        text_response = response.text.strip()
        if text_response.startswith('```json'):
            text_response = text_response[7:-3].strip()
        elif text_response.startswith('```'):
            text_response = text_response[3:-3].strip()

        ai_rules = json.loads(text_response)
    except Exception as e:
        print(f"GEMINI ERROR: {e}")
        ai_rules = {
            "preamble": f"\\documentclass{{article}}\n\\usepackage{{geometry}}\n\\geometry{{margin=1in}}",
            "macros": "",
            "environment_rules": "Mock environment rules applied."
        }

    return {**base_rules, **ai_rules}