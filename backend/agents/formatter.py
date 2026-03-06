def build_latex(rules, structured_data):
    latex_parts = []
    
    latex_parts.append(rules.get("preamble", "\\documentclass{article}"))
    
    if "\\usepackage{graphicx}" not in latex_parts[0]:
        latex_parts.append("\\usepackage{graphicx}\n")

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

    for img_filename in structured_data.get("images", []):
        latex_parts.append("\\begin{figure}[htbp]")
        latex_parts.append("\\centering")
        latex_parts.append(f"\\includegraphics[width=0.8\\textwidth]{{{img_filename}}}")
        latex_parts.append(f"\\caption{{Figure automatically extracted from source.}}")
        latex_parts.append("\\end{figure}\n")
        
    latex_parts.append("\\end{document}")
    
    return "\n".join(latex_parts)