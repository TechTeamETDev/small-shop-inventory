from flask import Flask, jsonify, request
import os
import sys
from dataclasses import asdict

# make package imports work
ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
sys.path.append(os.path.dirname(ROOT_DIR))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(ROOT_DIR), ".env"))

from app.db import Database
from app.ai.core.pipeline import InventoryPipeline

app = Flask("inventory_ai")

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    demo_db = os.path.join(os.path.dirname(ROOT_DIR), "demo.db")
    DB_URL = f"sqlite:///{demo_db}"


def context_to_dict(ctx):
    try:
        return asdict(ctx)
    except Exception:
        # fallback: build minimal dict
        return {
            "product_id": getattr(ctx, "product_id", None),
            "forecast": getattr(ctx, "forecast", {}),
            "decision": getattr(ctx, "decision", {}),
            "risk": getattr(ctx, "risk", {}),
            "explanation": getattr(ctx, "explanation", None),
            "alerts": getattr(ctx, "alerts", []),
            "metadata": getattr(ctx, "metadata", {})
        }


def ensure_setup():
    if not hasattr(app, "pipeline") or not hasattr(app, "db"):
        app.db = Database(DB_URL)
        app.pipeline = InventoryPipeline(app.db)


@app.route("/predict/<int:product_id>", methods=["GET"])
def predict_product(product_id):
    ensure_setup()
    try:
        ctx = app.pipeline.run(product_id)
        return jsonify(context_to_dict(ctx))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict_all", methods=["GET"])
def predict_all():
    ensure_setup()
    try:
        rows = app.db.get_products()
        products = rows.to_dict(orient="records") if hasattr(rows, "to_dict") else []

        results = []
        for p in products:
            try:
                ctx = app.pipeline.run(p["id"])
                results.append(context_to_dict(ctx))
            except Exception as e:
                results.append({"product_id": p.get("id"), "error": str(e)})

        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    ensure_setup()
    port = int(os.getenv("AI_API_PORT", 5000))
    app.run(host="127.0.0.1", port=port, debug=True)
