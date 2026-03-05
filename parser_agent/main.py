import os
from pdf_parser import parse_pdf
from docx_parser import parse_docx
from structure_detector import detect_structure

def process_file(file_path):

    if file_path.endswith(".pdf"):
        text = parse_pdf(file_path)

    elif file_path.endswith(".docx"):
        text = parse_docx(file_path)

    else:
        raise Exception("Unsupported file type")

    structured_data = detect_structure(text)

    return structured_data


if __name__ == "__main__":
    file = "parser_agent/sample_papers/sample.pdf"

    result = process_file(file)

    print(result)