# app.py — Flask backend for the AI Invoice Assistant
# Receives a PDF, extracts text, sends to Claude API, returns JSON

import os
import io
import json

from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
import pdfplumber
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB limit

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are an invoice data extraction assistant.
Extract structured data from invoice text and return ONLY valid JSON.
No explanation, no markdown, no code fences — just the raw JSON object.

Extract these fields:
- vendor_name: the company or person issuing the invoice
- invoice_number: the invoice ID or reference number
- invoice_date: the date the invoice was issued (as written)
- due_date: the payment due date (as written, or null if not found)
- subtotal: numeric value before tax (null if not found)
- tax_amount: numeric tax value (null if not found)
- total_amount: the final total amount due (numeric)
- currency: the currency symbol or code (e.g. EUR, USD, $)
- line_items: array of objects, each with:
    - description: what was sold or provided
    - quantity: numeric quantity (null if not shown)
    - unit_price: price per unit (null if not shown)
    - total: line item total

If a field is not present in the invoice, use null.
Return only the JSON object, nothing else."""


@app.route("/extract", methods=["POST"])
def extract_invoice():

    if "pdf" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["pdf"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are accepted"}), 400

    pdf_bytes = file.read()

    try:
        text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                if i >= 3:
                    break
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        if not text.strip():
            return jsonify({
                "error": "Could not extract text. Scanned image PDFs are not supported."
            }), 422

    except Exception as e:
        return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 500

    words = text.split()
    if len(words) > 4000:
        text = " ".join(words[:4000])

    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": f"{SYSTEM_PROMPT}\n\nInvoice text:\n{text}"
                }
            ]
        )
        raw_response = message.content[0].text

    except Exception as e:
        return jsonify({"error": f"Claude API error: {str(e)}"}), 500

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        extracted_data = json.loads(cleaned.strip())
    except json.JSONDecodeError:
        return jsonify({
            "error": "Claude returned invalid JSON",
            "raw": raw_response
        }), 500

    return jsonify(extracted_data), 200


@app.errorhandler(413)
def file_too_large(e):
    return jsonify({"error": "File too large. Maximum size is 5MB."}), 413


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
