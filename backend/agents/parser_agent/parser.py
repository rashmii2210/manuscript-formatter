"""
Parser Agent v3.0 — Vision-based PDF Parsing
Teammate 2 | HackaMined 2026 | Agent Paperpal

APPROACH:
  PDF pages → PNG images → Claude Vision API → Perfect structured JSON

This solves the two-column problem completely because Claude literally
SEES the page like a human — no text extraction needed.

Endpoints:
  GET  /           → health check
  POST /parse      → parse PDF or DOCX
  POST /parse/text → get raw extracted text (debug)
"""

import re
import json
import base64
import tempfile
import os
import urllib.request
from io import BytesIO
from flask import Flask, request, jsonify

# PDF → image conversion
try:
    from pdf2image import convert_from_path
    PDF2IMAGE_OK = True
except ImportError:
    PDF2IMAGE_OK = False

# Fallback text extraction
import pdfplumber
from docx import Document as DocxDocument

from PIL import Image

app = Flask(__name__)

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def image_to_base64(img: Image.Image, max_width=1200) -> str:
    """Resize image if needed and convert to base64 PNG."""
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def pdf_to_images(filepath: str, max_pages: int = 6) -> list:
    """Convert first N pages of PDF to PIL images."""
    images = convert_from_path(
        filepath,
        dpi=180,          # good quality without being huge
        first_page=1,
        last_page=max_pages,
        fmt="png",
    )
    return images


def extract_text_fallback(filepath: str) -> str:
    """Plain pdfplumber text extraction as fallback."""
    text = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text.append(t)
    return "\n".join(text)


def extract_docx_text(filepath: str) -> str:
    doc = DocxDocument(filepath)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


# ─────────────────────────────────────────────
# CLAUDE VISION API
# ─────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert academic manuscript parser.
You will receive images of pages from a research paper.
Your job is to extract the complete structure and return ONLY valid JSON.

Return this exact JSON structure:
{
  "title": "full paper title or null",
  "authors": ["Author One", "Author Two"],
  "abstract": "full abstract text or null",
  "keywords": "keyword1, keyword2 or null",
  "sections": [
    {
      "heading": "section heading",
      "level": 1,
      "content": ["paragraph 1 text", "paragraph 2 text"]
    }
  ],
  "references": [
    {
      "authors": "last, first and last, first",
      "year": "2020",
      "rest": "title and journal info"
    }
  ],
  "figures": ["Figure 1. caption text"],
  "tables": ["Table 1. caption text"],
  "in_text_citations": [
    {
      "text_snippet": "surrounding text",
      "citation": "(Author, 2020) or [1]",
      "style": "APA or IEEE"
    }
  ],
  "citation_style": "APA or IEEE or Unknown"
}

Rules:
- Read BOTH columns carefully if two-column layout
- Extract ALL sections in order
- Parse references completely
- Return ONLY JSON — no markdown, no explanation
- If something is not found, use null or empty array []
"""


def call_vision_api(images: list, api_key: str) -> dict:
    """
    Send page images to Claude Vision API.
    Uses first 4 pages (title/abstract/intro/refs usually there).
    """
    # Build content blocks — one image per page
    content = []

    # Add instruction first
    content.append({
        "type": "text",
        "text": f"Here are {len(images)} pages from a research paper. Extract the complete structure."
    })

    # Add each page image
    for i, img in enumerate(images[:4]):  # max 4 pages
        b64 = image_to_base64(img)
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": b64
            }
        })
        content.append({
            "type": "text",
            "text": f"[End of page {i+1}]"
        })

    content.append({
        "type": "text",
        "text": "Now extract the complete manuscript structure as JSON."
    })

    payload = json.dumps({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 4000,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": content}]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read().decode())
            raw = "".join(
                b.get("text", "")
                for b in data.get("content", [])
                if b.get("type") == "text"
            )
            # Strip markdown fences if present
            raw = re.sub(r"^```json\s*", "", raw.strip())
            raw = re.sub(r"```$", "", raw.strip())
            return json.loads(raw)
    except Exception as e:
        return {"error": str(e)}


# ─────────────────────────────────────────────
# FALLBACK: TEXT-BASED CLAUDE API
# ─────────────────────────────────────────────

def call_text_api(raw_text: str, api_key: str) -> dict:
    """Fallback: send extracted text to Claude when pdf2image unavailable."""
    prompt = f"""Parse this research paper text and return ONLY valid JSON with keys:
title, authors, abstract, keywords, sections, references, figures, tables,
in_text_citations, citation_style.

TEXT:
{raw_text[:10000]}"""

    payload = json.dumps({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 3000,
        "messages": [{"role": "user", "content": prompt}]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
            raw = "".join(
                b.get("text", "")
                for b in data.get("content", [])
                if b.get("type") == "text"
            )
            raw = re.sub(r"^```json\s*", "", raw.strip())
            raw = re.sub(r"```$", "", raw.strip())
            return json.loads(raw)
    except Exception as e:
        return {"error": str(e)}


# ─────────────────────────────────────────────
# RULE-BASED FALLBACK (no API)
# ─────────────────────────────────────────────

def rule_based_parse(raw_text: str) -> dict:
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    result = {
        "title": None, "authors": [], "abstract": None,
        "keywords": None, "sections": [], "references": [],
        "figures": [], "tables": [], "in_text_citations": [],
        "citation_style": "Unknown"
    }

    RE_ABS  = re.compile(r"^abstract$", re.I)
    RE_REFS = re.compile(r"^(references|bibliography)$", re.I)
    RE_FIG  = re.compile(r"^fig(ure)?\.?\s*\d+", re.I)
    RE_TBL  = re.compile(r"^table\s*\d+", re.I)
    RE_APA  = re.compile(r"\(([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*,?\s*\d{4})\)")
    RE_IEEE = re.compile(r"\[(\d+(?:,\s*\d+)*)\]")

    in_abs = False; in_refs = False
    abs_buf = []; found_title = False

    for line in lines:
        if RE_FIG.match(line): result["figures"].append(line); continue
        if RE_TBL.match(line): result["tables"].append(line); continue
        if RE_ABS.match(line): in_abs = True; in_refs = False; continue
        if RE_REFS.match(line): in_refs = True; in_abs = False; continue
        if in_refs:
            m = re.match(r"^(.+?)\s*\((\d{4})\)\.\s*(.+)", line)
            if m: result["references"].append({"authors": m.group(1), "year": m.group(2), "rest": m.group(3)})
            continue
        if in_abs:
            if len(line) < 50 and line[0].isupper() and not line.endswith('.'):
                result["abstract"] = " ".join(abs_buf); in_abs = False
            else: abs_buf.append(line); continue
        if not found_title and 10 < len(line) < 200:
            result["title"] = line; found_title = True; continue
        apa = RE_APA.findall(line); ieee = RE_IEEE.findall(line)
        if apa or ieee:
            result["in_text_citations"].append({
                "text_snippet": line[:100],
                "citation": apa[0] if apa else f"[{ieee[0]}]",
                "style": "APA" if apa else "IEEE"
            })

    if abs_buf and not result["abstract"]:
        result["abstract"] = " ".join(abs_buf)

    from collections import Counter
    styles = [c["style"] for c in result["in_text_citations"]]
    if styles:
        result["citation_style"] = Counter(styles).most_common(1)[0][0]

    return result


# ─────────────────────────────────────────────
# FLASK ROUTES
# ─────────────────────────────────────────────

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "agent": "parser",
        "version": "3.0",
        "mode": "Vision AI (PDF→Image→Claude) + Text fallback",
        "pdf2image": PDF2IMAGE_OK
    })


@app.route("/parse", methods=["POST"])
def parse_document():
    """
    POST /parse
    Form fields:
      file    = PDF or DOCX file
      api_key = Anthropic API key (enables Vision AI mode)
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided."}), 400

    f        = request.files["file"]
    fname    = f.filename.lower()
    api_key  = request.form.get("api_key", "").strip()

    if not (fname.endswith(".pdf") or fname.endswith(".docx")):
        return jsonify({"error": "Only .pdf and .docx supported."}), 400

    suffix = ".pdf" if fname.endswith(".pdf") else ".docx"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        f.save(tmp.name)
        tmp_path = tmp.name

    try:
        parse_method = "rule_based"
        structure    = {}

        # ── DOCX path ──────────────────────────────
        if suffix == ".docx":
            raw_text = extract_docx_text(tmp_path)
            if api_key:
                structure    = call_text_api(raw_text, api_key)
                parse_method = "claude_text_ai"
                if "error" in structure:
                    structure    = rule_based_parse(raw_text)
                    parse_method = "rule_based_fallback"
            else:
                structure    = rule_based_parse(raw_text)
                parse_method = "rule_based"

        # ── PDF path ────────────────────────────────
        else:
            if api_key and PDF2IMAGE_OK:
                vision_error = None
                text_error   = None
                try:
                    images       = pdf_to_images(tmp_path, max_pages=6)
                    structure    = call_vision_api(images, api_key)
                    parse_method = "claude_vision_ai"
                    if "error" in structure:
                        vision_error = structure["error"]
                        raw_text     = extract_text_fallback(tmp_path)
                        structure    = call_text_api(raw_text, api_key)
                        parse_method = "claude_text_ai_fallback"
                        if "error" in structure:
                            text_error   = structure["error"]
                            structure    = rule_based_parse(raw_text)
                            parse_method = "rule_based_fallback"
                            structure["_debug_vision_error"] = vision_error
                            structure["_debug_text_error"]   = text_error
                except Exception as e:
                    vision_error = str(e)
                    raw_text     = extract_text_fallback(tmp_path)
                    structure    = call_text_api(raw_text, api_key)
                    parse_method = "claude_text_ai"
                    if "error" in structure:
                        text_error   = structure["error"]
                        structure    = rule_based_parse(raw_text)
                        parse_method = "rule_based_fallback"
                        structure["_debug_vision_error"] = vision_error
                        structure["_debug_text_error"]   = text_error
            elif api_key:
                # pdf2image not available → text AI
                raw_text     = extract_text_fallback(tmp_path)
                structure    = call_text_api(raw_text, api_key)
                parse_method = "claude_text_ai"
                if "error" in structure:
                    structure    = rule_based_parse(raw_text)
                    parse_method = "rule_based_fallback"
            else:
                # No API key → rule-based
                raw_text  = extract_text_fallback(tmp_path)
                structure = rule_based_parse(raw_text)

        # ── Summary ────────────────────────────────
        structure["summary"] = {
            "title_found":             bool(structure.get("title")),
            "abstract_found":          bool(structure.get("abstract")),
            "num_sections":            len(structure.get("sections", [])),
            "num_references":          len(structure.get("references", [])),
            "num_figures":             len(structure.get("figures", [])),
            "num_tables":              len(structure.get("tables", [])),
            "num_in_text_citations":   len(structure.get("in_text_citations", [])),
            "detected_citation_style": structure.get("citation_style", "Unknown"),
            "file_type":               suffix.lstrip("."),
            "parse_method":            parse_method,
            "pdf2image_available":     PDF2IMAGE_OK,
        }

        return jsonify({"success": True, "data": structure}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        os.unlink(tmp_path)


@app.route("/parse/text", methods=["POST"])
def raw_text_endpoint():
    """POST /parse/text — returns raw extracted text for debugging."""
    if "file" not in request.files:
        return jsonify({"error": "No file provided."}), 400
    f      = request.files["file"]
    suffix = ".pdf" if f.filename.lower().endswith(".pdf") else ".docx"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        f.save(tmp.name); tmp_path = tmp.name
    try:
        text = extract_text_fallback(tmp_path) if suffix==".pdf" else extract_docx_text(tmp_path)
        return jsonify({"success": True, "raw_text": text, "length": len(text)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    print("=" * 60)
    print("  Parser Agent v3.0 — Vision AI")
    print("  PDF → Image → Claude sees the page → Perfect JSON")
    print(f"  pdf2image available: {PDF2IMAGE_OK}")
    print("  Running on http://localhost:5001")
    print("=" * 60)
    app.run(debug=True, port=5001)
