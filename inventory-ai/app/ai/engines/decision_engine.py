class DecisionEngine:
    """
    Production-grade Inventory Decision Engine (FIXED SCALE BUG)
    """

    def __init__(
        self,
        safety_factor: float = 1.3,
        min_confidence: float = 0.5,
        reorder_days: int = 7,
        emergency_multiplier: float = 3
    ):
        self.safety_factor = safety_factor
        self.min_confidence = min_confidence
        self.reorder_days = reorder_days
        self.emergency_multiplier = emergency_multiplier

    def evaluate(self, forecast: dict):

        product = forecast.get("product", {}) or {}
        metrics = forecast.get("metrics", {}) or {}

        product_id = product.get("id")
        stock = float(product.get("current_stock", 0))

        total_demand = float(metrics.get("predicted_demand", 0))
        confidence = float(metrics.get("confidence_score", 0))

        # -----------------------------
        # NORMALIZATION
        # -----------------------------
        confidence = max(0.0, min(confidence, 1.0))

        # convert 30-day → daily demand
        daily_demand = total_demand / 30.0

        # projected 7-day demand
        short_term_demand = daily_demand * self.reorder_days

        # -----------------------------
        # LOW CONFIDENCE
        # -----------------------------
        if confidence < self.min_confidence:
            return {
                "product_id": product_id,
                "action": "NO_ACTION",
                "reason": "Low confidence forecast",
                "demand": total_demand,
                "stock": stock,
                "confidence": confidence
            }

        # -----------------------------
        # EMERGENCY RULE (FIXED & STABLE)
        # -----------------------------
        safe_daily_demand = max(daily_demand, 0.1)

        days_of_stock = stock / safe_daily_demand

        if days_of_stock <= 2:
            return {
                "product_id": product_id,
                "action": "EMERGENCY_RESTOCK",
                "reason": "Stock will run out in less than 2 days",
                "recommended_order": max(0, int(short_term_demand - stock)),
                "daily_demand": daily_demand,
                "stock": stock,
                "confidence": confidence,
                "days_of_stock": round(days_of_stock, 2)
            }

        # -----------------------------
        # NORMAL LOGIC
        # -----------------------------
        target_stock = short_term_demand * self.safety_factor

        stock_gap = target_stock - stock

        if stock_gap > 0:
            action = "RESTOCK"
            recommended_order = int(stock_gap)
        else:
            action = "HOLD"
            recommended_order = 0

        return {
            "product_id": product_id,
            "action": action,
            "recommended_order": recommended_order,
            "daily_demand": daily_demand,
            "target_stock": target_stock,
            "stock": stock,
            "confidence": confidence
        }