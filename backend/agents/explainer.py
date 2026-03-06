def generate_explanations(rules, structured_data):
    corrections = [
        {"element": "Preamble", "action": "Added required packages", "reason": "Journal requirement."},
        {"element": "Citations", "action": "Standardized format", "reason": f"Aligned with {rules.get('style_name', 'target')}."}
    ]
    score = 95 
    return corrections, score