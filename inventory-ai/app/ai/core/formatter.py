def to_api_response(context):
    if isinstance(context, dict):
        if "prediction" in context or "insight" in context:
            return context

        return {
            "status": "success",
            "product_id": context.get("product_id"),
            "prediction": context.get("prediction_result", {}),
            "insight": context.get("insight_result", {}),
            "alerts": context.get("alerts_result", []),
            "decision": context.get("decision", {}),
            "risk": context.get("risk", {}),
            "meta": context.get("meta", {}),
            "errors": context.get("errors", []),
        }

    forecast = getattr(context, "forecast", {}) or {}
    metrics = forecast.get("metrics", {}) or {}

    prediction = getattr(context, "prediction_result", {}) or {}
    insight = getattr(context, "insight_result", {}) or {}
    alerts = getattr(context, "alerts_result", []) or []
    decision = getattr(context, "decision", {}) or {}
    risk = getattr(context, "risk", {}) or {}
    errors = getattr(context, "errors", []) or []

    return {
        "status": "success",
        "product_id": getattr(context, "product_id", None),
        "prediction": prediction,
        "insight": insight,
        "alerts": alerts,
        "decision": decision,
        "risk": risk,
        "meta": {
            "confidence": metrics.get("confidence_score"),
            "periods": getattr(context, "periods", None),
        },
        "errors": errors,
    }
