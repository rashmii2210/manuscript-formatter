import re

def build_latex(rules, structured_data):
    latex_parts = []
    
    latex_parts.append(rules.get("preamble", "\\documentclass{article}"))
    
    # Inject the preserved packages right before begin{document}
    if structured_data.get("custom_packages"):
        latex_parts.append("\n% --- Original Custom Packages ---")
        for pkg in structured_data["custom_packages"]:
            if "geometry" not in pkg and "inputenc" not in pkg: # Avoid conflicts
                latex_parts.append(pkg)
        latex_parts.append("")
        
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
    
    for para in structured_data.get("body", []):
        latex_parts.append(f"{para}\n")
        
    latex_parts.append("\\end{document}")
    
    return "\n".join(latex_parts)