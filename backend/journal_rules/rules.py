def get_base_rules(style):
    rulesets = {
        "IEEE": {
            "style_name": "IEEE",
            "preamble": "\\documentclass[journal]{IEEEtran}\n\\usepackage{cite}\n\\usepackage{amsmath,amssymb,amsfonts}"
        },
        "APA": {
            "style_name": "APA",
            "preamble": "\\documentclass[man]{apa7}\n\\usepackage[american]{babel}\n\\usepackage{csquotes}"
        },
        "CHICAGO": {
            "style_name": "Chicago",
            "preamble": "\\documentclass[12pt]{article}\n\\usepackage[margin=1in]{geometry}\n\\usepackage{setspace}\n\\doublespacing\n\\usepackage[authordate,backend=biber]{biblatex-chicago}",
            "macros": "\\newcommand{\\chicagoTitle}[1]{\\begin{center}\\vspace*{2in}{\\Large \\bfseries #1}\\end{center}\\vspace{1in}}"
        },
        "MLA": {
            "style_name": "MLA",
            "preamble": "\\documentclass[12pt,letterpaper]{article}\n\\usepackage[margin=1in]{geometry}\n\\usepackage{setspace}\n\\doublespacing\n\\usepackage{mathptmx} % Times New Roman font\n\\usepackage{fancyhdr}\n\\pagestyle{fancy}\n\\fancyhf{}\n\\renewcommand{\\headrulewidth}{0pt}\n\\usepackage[style=mla,backend=biber]{biblatex}",
            "macros": "% Note: Gemini will generate specific macros for the MLA left-aligned name block (Name, Instructor, Course, Date) and top-right header (Last Name + Page Number)."
        },
        "NATURE": {
            "style_name": "Nature",
            "preamble": "\\documentclass[12pt]{article}\n\\usepackage[margin=1in]{geometry}\n\\usepackage{setspace}\n\\doublespacing\n\\usepackage[superscript,nomove]{cite} % Nature uses superscript citations\n\\usepackage{lineno} % Nature requires line numbers for review\n\\linenumbers\n\\bibliographystyle{naturemag}",
            "macros": "\\newcommand{\\natureabstract}[1]{\\begin{flushleft}\\textbf{#1}\\end{flushleft}\\vspace{0.5cm}}"
        }
    }
    return rulesets.get(style.upper(), {"style_name": style, "preamble": "\\documentclass{article}", "macros" : ""})