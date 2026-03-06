def build_latex(rules, structured_data):
    latex_parts = []
    
    latex_parts.append(rules.get("preamble", "\\documentclass{article}"))
    latex_parts.append("\\begin{document}\n")
    
    if structured_data.get("title"):
        latex_parts.append(f"\\title{{{structured_data['title']}}}")
        latex_parts.append("\\maketitle\n")
    
    if structured_data.get("abstract"):
        latex_parts.append("\\begin{abstract}")
        latex_parts.append(structured_data["abstract"])
        latex_parts.append("\\end{abstract}\n")
    
    for para in structured_data.get("body", []):
        latex_parts.append(f"{para}\n")
        
    latex_parts.append("\\end{document}")
    
    return "\n".join(latex_parts)