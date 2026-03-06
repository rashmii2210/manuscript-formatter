import docx
from TexSoup import TexSoup
import zipfile
import os

def parse_document(filepath, ext, session_id, upload_folder):
    if ext == 'docx':
        doc = docx.Document(filepath)
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        with zipfile.ZipFile(filepath, 'r') as docx_zip:
            for item in docx_zip.namelist():
                if item.startswith('word/media/'):
                    filename = os.path.basename(item)
                    if filename:
                        image_path = os.path.join(upload_folder, f"{session_id}_{filename}")
                        with open(image_path, 'wb') as f:
                            f.write(docx_zip.read(item))
        return text
    
    elif ext == 'tex':
        with open(filepath, 'r', encoding='utf-8') as f:
            soup = TexSoup(f)
            return str(soup.document) if soup.document else ""
            
    raise ValueError("Unsupported file type")