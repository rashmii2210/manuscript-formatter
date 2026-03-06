import os
import json
from tex_parser import parse_tex       # Swapped PDF for TEX
from docx_parser import parse_docx
from structure_detector import detect_structure

# ... existing imports ...

def process_file(file_path):
    if file_path.endswith(".tex"):
        # The new parser returns a structured dict
        return parse_tex(file_path)

    elif file_path.endswith(".docx"):
        text = parse_docx(file_path)
        # Assuming detect_structure is designed for plain text (docx)
        return detect_structure(text)

    else:
        raise Exception("Unsupported file type")

    structured_data = detect_structure(text)
    return structured_data

if __name__ == "__main__":
    # Example using a .tex file
    file = "sample_papers/sample.tex" 
    
    if os.path.exists(file):
        result = process_file(file)

        with open("output.json", "w") as f:
            json.dump(result, f, indent=4)

        print(f"JSON file created: output.json from {file}")
    else:
        print(f"File not found: {file}")