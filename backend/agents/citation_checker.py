import spacy
import re

nlp = spacy.load("en_core_web_sm")

def analyze_structure(raw_text):
    # Extract original packages
    custom_packages = re.findall(r'\\usepackage(?:\[[^\]]*\])?\{[^}]*\}', raw_text)
    
    clean_text = raw_text.replace("\\begin{document}", "").replace("\\end{document}", "").strip()
    
    blocks = {
        "title": None,
        "abstract": None,
        "body": [],
        "citations": [],
        "references": [],
        "custom_packages": list(set(custom_packages))
    }
    
    paragraphs = clean_text.split('\n')
    
    title_set = False
    for i, para in enumerate(paragraphs):
        if not para.strip():
            continue
            
        if not title_set:
            blocks["title"] = para
            title_set = True
        elif "abstract" in para.lower()[:15]:
            blocks["abstract"] = para
        elif "references" in para.lower()[:15]:
            blocks["references"] = paragraphs[i:]
            break
        else:
            blocks["body"].append(para)

        citations = re.findall(r'\[\d+\]|\([A-Za-z]+(?: et al\.)?, \d{4}\)', para)
        blocks["citations"].extend(citations)

    return blocks