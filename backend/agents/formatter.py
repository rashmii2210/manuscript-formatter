import re

def fix_linguistic_notation(text):
    text = re.sub(r'(?<!\$)\b([a-zA-Z]+_[a-zA-Z0-9]+)\b(?!\$)', r'$\1$', text)
    text = re.sub(r'[ \t]*&[ \t]*', '\t&\t', text)
    return text

def build_latex(rules, structured_data):
    latex_parts = []
    
    # 1. Add Preamble
    preamble = rules.get("preamble", "\\documentclass{article}")
    
    # SAFEGUARD: Unpack if the AI generated a nested dict or list instead of a string
    if isinstance(preamble, dict):
        preamble = "\n".join(str(v) for v in preamble.values())
    elif isinstance(preamble, list):
        preamble = "\n".join(str(v) for v in preamble)
    else:
        preamble = str(preamble)
        
    latex_parts.append(preamble)
    
    # 2. Re-inject Custom Packages
    custom_packages = structured_data.get("custom_packages", [])
    if custom_packages:
        latex_parts.append("\n% --- Preserved Custom Packages ---")
        for pkg in custom_packages:
            latex_parts.append(pkg)
        latex_parts.append("% ---------------------------------\n")
        
    # 3. Start Document
    latex_parts.append("\\begin{document}\n")
    
    raw_title = structured_data.get("title", "")
    if raw_title:
        clean_title = re.sub(r'\\(?:section|subsection|chapter)\*?\{(.*?)\}', r'\1', raw_title)
        latex_parts.append(f"\\title{{{clean_title}}}")
        latex_parts.append("\\maketitle\n")
    
    if structured_data.get("abstract"):
        latex_parts.append("\\begin{abstract}")
        latex_parts.append(structured_data["abstract"])
        latex_parts.append("\\end{abstract}\n")
    
    # 4. Inject Body Text (with linguistic fixes applied!)
    for para in structured_data.get("body", []):
        clean_para = fix_linguistic_notation(para)
        latex_parts.append(f"{clean_para}\n")
        
    latex_parts.append("\\end{document}")
    
    return "\n".join(latex_parts)