import pdfplumber

def parse_pdf(file_path):

    full_text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"

    return full_text