def get_base_rules(style):
    rulesets = {
        "IEEE": {
            "style_name": "IEEE",
            "preamble": "\\documentclass[journal]{IEEEtran}\n\\usepackage{cite}\n\\usepackage{amsmath,amssymb,amsfonts}"
        },
        "APA": {
            "style_name": "APA",
            "preamble": "\\documentclass[man]{apa7}\n\\usepackage[american]{babel}\n\\usepackage{csquotes}"
        }
    }
    return rulesets.get(style.upper(), {"style_name": style, "preamble": "\\documentclass{article}"})