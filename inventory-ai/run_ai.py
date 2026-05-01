import sys
import os
import json
import pandas as pd

# =============================
# ROOT SETUP
# =============================
ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
sys.path.append(ROOT_DIR)

print("ROOT:", ROOT_DIR)

# =============================
# ENV LOAD (IMPORTANT FIX)
# =============================
from dotenv import load_dotenv

env_path = os.path.join(ROOT_DIR, ".env")
load_dotenv(env_path)

DB_URL = os.getenv("DATABASE_URL")

if not DB_URL:
    # Fall back to local sqlite DB for demo purposes so the AI module is
    # runnable without an external MySQL server. This creates a file
    # `inventory-ai/demo.db` in the project root.
    demo_db_path = os.path.join(ROOT_DIR, "demo.db")
    DB_URL = f"sqlite:///{demo_db_path}"
    print("WARNING: DATABASE_URL not found; falling back to sqlite demo DB:", DB_URL)

# =============================
# IMPORTS
# =============================
from app.db import Database
from app.prophet_engine import run_forecast
from app.ai.engines.decision_engine import DecisionEngine
from app.ai.engines.risk_engine import RiskEngine
from app.ai.engines.alert_engine import AlertEngine


# =============================
# PROCESS PRODUCT
# =============================
def process_product(product, sales_data):

    forecast = run_forecast(product, sales_data)

    decision = DecisionEngine().evaluate(forecast)
    risk = RiskEngine().evaluate(forecast)

    alerts = AlertEngine().generate_alerts(forecast, decision, risk)

    return {
        "product_id": product.get("id"),
        "forecast": forecast,
        "decision": decision,
        "risk": risk,
        "alerts": alerts
    }


# =============================
# FORMAT FOR LARAVEL
# =============================
def format_ai_output(result):
    return {
        "product_id": result.get("product_id"),

        "action": result.get("decision", {}).get("action"),

        # ✅ FIXED FIELD NAME
        "recommended_order": result.get("decision", {}).get("recommended_order"),

        "risk_level": result.get("risk", {}).get("risk_level"),
        "risk_score": result.get("risk", {}).get("risk_score"),

        "predicted_demand": result.get("forecast", {}).get("metrics", {}).get("predicted_demand"),
        "confidence": result.get("forecast", {}).get("metrics", {}).get("confidence_score"),

        "alerts": result.get("alerts", [])
    }

# =============================
# PIPELINE
# =============================
def run_pipeline(products, db):

    results = []

    for product in products:
        try:
            sales_data = db.get_sales_history_cached(product["id"])

            result = process_product(product, sales_data)

            results.append(format_ai_output(result))

        except Exception as e:
            results.append({
                "product_id": product.get("id"),
                "error": str(e)
            })

    return results


# =============================
# MAIN
# =============================
def main():

    db = Database(DB_URL)

    products_df = db.get_products()
    products = products_df.to_dict(orient="records")

    print("📦 PRODUCTS:", len(products))

    results = run_pipeline(products, db)

    print(json.dumps(results, default=str, indent=2))


if __name__ == "__main__":
    main()
