class AlertEngine:
    """
    Production Alert Generator (Fixed Version)
    """

    def generate_alerts(self, forecast, decision, risk):

        alerts = []

        # -----------------------------
        # SAFE EXTRACTION
        # -----------------------------
        product = forecast.get("product") or {}
        metrics = forecast.get("metrics") or {}

        product_id = product.get("id")
        product_name = product.get("name", "UNKNOWN")

        stock = float(product.get("current_stock", 0))
        confidence = float(metrics.get("confidence_score", 0))
        risk_score = float((risk or {}).get("risk_score", 0))

        action = (decision or {}).get("action", "")

        # -----------------------------
        # 1. CRITICAL RISK ALERT
        # -----------------------------
        if risk_score >= 0.7:
            alerts.append({
                "type": "CRITICAL_RISK",
                "priority": "HIGH",
                "product_id": product_id,
                "product_name": product_name,
                "message": f"{product_name} is in CRITICAL risk zone."
            })

        # -----------------------------
        # 2. OUT OF STOCK ALERT
        # -----------------------------
        if stock <= 0:
            alerts.append({
                "type": "LOW_STOCK",
                "priority": "HIGH",
                "product_id": product_id,
                "product_name": product_name,
                "message": f"{product_name} is OUT OF STOCK."
            })

        # -----------------------------
        # 3. RESTOCK ACTION ALERT (IMPORTANT ADDITION)
        # -----------------------------
        if action in ["RESTOCK", "EMERGENCY_RESTOCK"]:
            alerts.append({
                "type": "RESTOCK_REQUIRED",
                "priority": "MEDIUM",
                "product_id": product_id,
                "product_name": product_name,
                "message": f"{product_name} requires restocking ({action})."
            })

        # -----------------------------
        # 4. LOW CONFIDENCE ALERT
        # -----------------------------
        if confidence < 0.3:
            alerts.append({
                "type": "LOW_CONFIDENCE",
                "priority": "LOW",
                "product_id": product_id,
                "product_name": product_name,
                "message": f"{product_name} forecast is uncertain."
            })

        return alerts