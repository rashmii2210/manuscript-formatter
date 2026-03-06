import re

def detect_structure(text):

    lines = text.split("\n")

    structure = {
        "title": "",
        "abstract": "",
        "headings": [],
        "references": "",
        "body": ""
    }

    # Title (usually first non-empty line)
    for line in lines:
        if line.strip():
            structure["title"] = line
            break

    # Abstract detection
    abstract_match = re.search(r'(?i)abstract(.*?)(?=\n[A-Z])', text, re.DOTALL)

    if abstract_match:
        structure["abstract"] = abstract_match.group(1).strip()

    # Heading detection
    for line in lines:
        if re.match(r'^[A-Z][A-Za-z\s]{3,}$', line):
            structure["headings"].append(line.strip())

    # References section
    ref_match = re.search(r'(?i)references(.*)', text, re.DOTALL)

    if ref_match:
        structure["references"] = ref_match.group(1).strip()

    return structure