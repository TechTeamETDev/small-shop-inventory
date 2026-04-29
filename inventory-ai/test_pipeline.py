from app.db import Database
from app.prophet_engine import ProphetEngine
from app.ai.engines.decision_engine import DecisionEngine
from app.ai.engines.risk_engine import RiskEngine
from app.ai.engines.alert_engine import AlertEngine


def run_phase6_test():
    print("\n==============================")
    print("🚀 FULL INVENTORY AI PIPELINE TEST")
    print("==============================\n")

    # -----------------------------
    # INIT
    # -----------------------------
    db = Database("mysql+pymysql://root:@localhost/smallshop")

    prophet = ProphetEngine()
    decision_engine = DecisionEngine()
    risk_engine = RiskEngine()
    alert_engine = AlertEngine()

    # -----------------------------
    # LOAD DATA
    # -----------------------------
    product_id = 1
    product = db.get_product_by_id(product_id)
    df = db.get_sales_history_cached(product_id)

    if df is None or df.empty:
        print("❌ No sales data found")
        return

    print("📊 Sales Data Loaded\n")

    # -----------------------------
    # FORECAST
    # -----------------------------
    forecast = prophet.predict(
        product=product,
        sales_data=df,
        periods=30
    )

    print("🔮 FORECAST:")
    print(forecast, "\n")

    # -----------------------------
    # DECISION (use full forecast)
    # -----------------------------
    decision = decision_engine.evaluate(forecast)
    print("⚖️ DECISION:")
    print(decision, "\n")

    # -----------------------------
    # RISK (use full forecast)
    # -----------------------------
    risk = risk_engine.evaluate(forecast)
    print("🛡️ RISK:")
    print(risk, "\n")

    # -----------------------------
    # ALERTS (use full forecast)
    # -----------------------------
    alerts = alert_engine.generate_alerts(
        forecast=forecast,
        decision=decision,
        risk=risk
    )

    print("🚨 ALERTS:")
    if not alerts:
        print("No alerts triggered.")
    else:
        for alert in alerts:
            print(alert)

    # -----------------------------
    # FINAL SUMMARY
    # -----------------------------
    print("\n📌 FINAL SUMMARY")
    print("------------------------------")
    print(f"Product: {forecast['product']['name']}")
    print(f"SKU: {forecast['product']['sku']}")
    print(f"Demand: {forecast['metrics']['predicted_demand']}")
    print(f"Stock: {forecast['product']['current_stock']}")
    print(f"Action: {decision.get('action')}")
    print(f"Risk Level: {risk.get('risk_level')}")

    print("\n==============================")
    print("✅ FULL PIPELINE COMPLETE")
    print("==============================\n")


if __name__ == "__main__":
    run_phase6_test()