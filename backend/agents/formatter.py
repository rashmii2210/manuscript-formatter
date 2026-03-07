import re

def fix_linguistic_notation(text):
    text = re.sub(r'(?<!\$)\b([a-zA-Z]+_[a-zA-Z0-9]+)\b(?!\$)', r'$\1$', text)
    text = re.sub(r'[ \t]*&[ \t]*', '\t&\t', text)
    return text

def build_latex(rules, structured_data):
    latex_parts = []
    
    preamble = rules.get("preamble", "\\documentclass{article}")
    if isinstance(preamble, dict):
        preamble = "\n".join(str(v) for v in preamble.values())
    elif isinstance(preamble, list):
        preamble = "\n".join(str(v) for v in preamble)
    else:
        preamble = str(preamble)
        
    latex_parts.append(preamble)
    
    # Inject Macros if available
    macros = rules.get("macros", "")
    if macros:
        latex_parts.append(str(macros))
    
    custom_packages = structured_data.get("custom_packages", [])
    if custom_packages:
        latex_parts.extend(custom_packages)

    title_raw = structured_data.get("title", structured_data.get("document_title", "Untitled Document"))
    title = re.sub(r'\\(?:section|subsection|chapter)\*?\{(.*?)\}', r'\1', title_raw)
    abstract = structured_data.get("abstract", "")
    
    # Detect formatting style based on preamble signatures
    is_apa = "apa7" in preamble
    is_ieee = "IEEEtran" in preamble
    is_chicago = "biblatex-chicago" in preamble
    is_mla = "style=mla" in preamble
    is_nature = "naturemag" in preamble or "nature uses superscript" in preamble.lower()

    # --- Document Frontmatter ---
    if is_apa:
        latex_parts.append(f"\\title{{{title}}}")
        latex_parts.append("\\shorttitle{Running Head}")
        latex_parts.append("\\author{Author Name}")
        latex_parts.append("\\affiliation{Institution}")
        if abstract:
            latex_parts.append(f"\\abstract{{{abstract}}}")
        latex_parts.append("\\begin{document}")
        latex_parts.append("\\maketitle")
        
    elif is_ieee:
        latex_parts.append("\\begin{document}")
        latex_parts.append(f"\\title{{{title}}}")
        latex_parts.append("\\author{\\IEEEauthorblockN{Author Name}\n\\IEEEauthorblockA{Institution}}")
        latex_parts.append("\\maketitle")
        if abstract:
            latex_parts.append("\\begin{abstract}")
            latex_parts.append(abstract)
            latex_parts.append("\\end{abstract}")
            
    elif is_chicago:
        latex_parts.append("\\begin{document}")
        # Chicago uses the custom title macro defined in your rules.py
        latex_parts.append(f"\\chicagoTitle{{{title}}}")
        
    elif is_mla:
        # MLA doesn't use standard title pages/maketitle. It uses a flushleft block.
        latex_parts.append("\\begin{document}")
        latex_parts.append("\\begin{flushleft}")
        latex_parts.append("Author Name\\\\")
        latex_parts.append("Instructor Name\\\\")
        latex_parts.append("Course Name\\\\")
        latex_parts.append("Date")
        latex_parts.append("\\end{flushleft}")
        latex_parts.append("\\begin{center}")
        latex_parts.append(f"\\textbf{{{title}}}")
        latex_parts.append("\\end{center}")
        
    elif is_nature:
        latex_parts.append("\\begin{document}")
        latex_parts.append(f"\\title{{{title}}}")
        latex_parts.append("\\author{Author Name}")
        latex_parts.append("\\maketitle")
        if abstract:
            # Nature uses the custom abstract macro defined in your rules.py
            latex_parts.append(f"\\natureabstract{{{abstract}}}")
            
    else: # Fallback generic layout
        latex_parts.append("\\begin{document}")
        latex_parts.append(f"\\title{{{title}}}")
        latex_parts.append("\\maketitle")
        if abstract:
            latex_parts.append("\\begin{abstract}")
            latex_parts.append(abstract)
            latex_parts.append("\\end{abstract}")

    # --- Document Body ---
    body_data = structured_data.get("body", structured_data.get("body_sentences", []))
    
    for para in body_data:
        clean_para = fix_linguistic_notation(para)
        # Quick heuristic to identify section headers
        if len(clean_para.split()) <= 4 and not clean_para.endswith('.'):
            if is_mla:
                # MLA typically doesn't use standard numbered sections
                latex_parts.append(f"\n\\noindent\\textbf{{{clean_para}}}") 
            else:
                latex_parts.append(f"\\section{{{clean_para}}}")
        else:
            latex_parts.append(clean_para)

    latex_parts.append("\\end{document}")
    return "\n".join(latex_parts)