import re

def find_citations(text):

    ieee = re.findall(r'\[\d+\]', text)

    apa = re.findall(r'\([A-Za-z]+,\s\d{4}\)', text)

    return {
        "ieee": ieee,
        "apa": apa
    }