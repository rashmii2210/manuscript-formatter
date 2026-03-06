import os
import json
import uuid
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from agents.parser import parse_document
from agents.citation_checker import analyze_structure
from agents.rule_engine import get_formatting_rules
from agents.formatter import build_latex
from agents.explainer import generate_explanations

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
ALLOWED_EXTENSIONS = {'docx', 'tex', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_session(session_id):
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        if filename.startswith(session_id):
            try:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            except:
                pass

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file."}), 400

    session_id = str(uuid.uuid4())
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = secure_filename(f"{session_id}.{ext}")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        raw_text = parse_document(filepath, ext, session_id, app.config['UPLOAD_FOLDER'])
        structured_data = analyze_structure(raw_text)
        
        state_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}.json")
        with open(state_path, 'w') as f:
            json.dump(structured_data, f)

        return jsonify({
            "session_id": session_id,
            "metadata": structured_data.get("metadata", {}),
            "message": "Success"
        }), 200

    except Exception as e:
        cleanup_session(session_id)
        return jsonify({"error": str(e)}), 500

@app.route('/api/format', methods=['POST'])
def format_document():
    data = request.json
    session_id = data.get('session_id')
    target_style = data.get('target_style')

    if not session_id or not target_style:
        return jsonify({"error": "Missing parameters"}), 400

    state_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}.json")
    if not os.path.exists(state_path):
        return jsonify({"error": "Invalid session"}), 404

    try:
        with open(state_path, 'r') as f:
            structured_data = json.load(f)

        rules = get_formatting_rules(target_style, structured_data)
        latex_output = build_latex(rules, structured_data)
        corrections, score = generate_explanations(rules, structured_data)

        cleanup_session(session_id)

        return jsonify({
            "latex_code": latex_output,
            "pdf_base64": None,
            "compliance_score": score,
            "explainable_corrections": corrections
        }), 200

    except Exception as e:
        cleanup_session(session_id)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)