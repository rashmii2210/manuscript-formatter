import docx
from TexSoup import TexSoup
import zipfile
import os

def parse_document(filepath, ext ,session_id, upload_folder):
    extracted_images = []
    if ext == 'docx':
        doc = docx.Document(filepath)
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        with zipfile.ZipFile(filepath, 'r') as docx_zip:
                for item in docx_zip.namelist():
                    if item.startswith('word/media/'):
                        filename = os.path.basename(item)
                        if filename:
                            image_name = f"{session_id}_{filename}"
                            image_path = os.path.join(upload_folder, image_name)
                            with open(image_path, 'wb') as f:
                                f.write(docx_zip.read(item))
                            extracted_images.append(image_name)
                            
        return text, extracted_images
        
    elif ext == 'tex':
        with open(filepath, 'r', encoding='utf-8') as f:
            soup = TexSoup(f)
            # .tex files don't embed images, so we return an empty list for now
            return str(soup.document) if soup.document else "", extracted_images
            
    raise ValueError("Unsupported file type")
    # elif ext == 'tex':
    #     with open(filepath, 'r', encoding='utf-8') as f:
    #         soup = TexSoup(f)
    #         doc = soup.document
    #         return "".join(doc.text) if doc else ""
    # raise ValueError("Unsupported file type")