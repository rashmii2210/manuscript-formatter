import re

def parse_tex(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Metadata Extraction (Title & Abstract)
    title_m = re.search(r'\\title\{([^}]+)\}', content)
    abstract_raw = re.search(r'\\begin\{abstract\}(.*?)\\end\{abstract\}', content, re.DOTALL)
    abstract = " ".join(abstract_raw.group(1).split()) if abstract_raw else ""

    # 2. Reference & Citation Extraction
    raw_cite_keys = re.findall(r'\\cite\{([^}]+)\}', content)
    ref_list = sorted(list(set([k.strip() for group in raw_cite_keys for k in group.split(',')])))

    # 3. Aggressive Body Cleaning
    # Focus only on content between \begin{document} and \printbibliography
    if "\\begin{document}" in content:
        body = content.split("\\begin{document}")[1]
    else:
        body = content
    body = body.split("\\printbibliography")[0]

    # --- THE CLEANING PASS ---

    # A. Remove specific LaTeX environments and their names (itemize, center, etc.)
    # This prevents the "itemize rho.cls" error
    body = re.sub(r'\\(?:begin|end)\{[a-zA-Z*]+\}', ' ', body)
    
    # B. Extract and Strip all URLs/Links immediately
    all_links = list(set(re.findall(r'https?://[^\s{}]+', body)))
    body = re.sub(r'\\href\{[^}]*\}\{([^}]*)\}', r'\1', body) # Keep anchor text only
    body = re.sub(r'\\url\{[^}]*\}', ' ', body)
    body = re.sub(r'https?://[^\s{}]+', ' ', body)

    # C. Handle commands that wrap text (Keep the text inside)
    # \textit{Hello} -> Hello | \section{Title} -> Title
    body = re.sub(r'\\[a-zA-Z]+\*?\{([^}]*)\}', r'\1', body)

    # D. Remove all remaining standalone commands and LaTeX junk
    body = re.sub(r'\\[a-zA-Z]+', ' ', body) # Remove things like \item, \newpage
    body = re.sub(r'[$&%#_{}~^]', ' ', body) # Remove special characters
    body = re.sub(r'%.*', ' ', body)         # Remove comments

    # E. Sentence Tokenization
    # Merge into a single line and split properly
    single_line_body = " ".join(body.split())
    # Split by standard punctuation (period, exclamation, question)
    sentences = re.split(r'(?<=[.!?]) +', single_line_body)

    # Final Filter: Remove short fragments and technical remnants (like "firststyle")
    blacklisted_words = ['firststyle', 'itemize', 'enumerate', 'tabular']
    clean_sentences = []
    for s in sentences:
        s = s.strip()
        # Only keep if it looks like a real sentence (more than 2 words, no blacklisted fragments)
        if len(s.split()) > 2 and not any(word in s.lower() for word in blacklisted_words):
            clean_sentences.append(s)

    return {
        "document_title": title_m.group(1).strip() if title_m else "Untitled",
        "abstract": abstract,
        "body_sentences": clean_sentences,
        "formatting_metadata": {
            "bibliography_keys": ref_list,
            "external_urls": all_links
        }
    }