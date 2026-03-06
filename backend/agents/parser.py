import docx
from TexSoup import TexSoup

def parse_document(filepath, ext):
    if ext == 'docx':
        doc = docx.Document(filepath)
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    elif ext == 'tex':
        with open(filepath, 'r', encoding='utf-8') as f:
            soup = TexSoup(f)
            doc = soup.document
            return "".join(doc.text) if doc else ""
    raise ValueError("Unsupported file type")