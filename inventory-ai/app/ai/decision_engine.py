class DecisionEngine:
    """
    Decision Engine for inventory actions based on forecast output
    """

    def __init__(self, safety_factor: float = 1.2, min_confidence: float = 0.5):
        """
        safety_factor → extra buffer (20% by default)
        min_confidence → ignore weak forecasts
        """
        self.safety_factor = safety_factor
        self.min_confidence = min_confidence

    # -----------------------------
    # MAIN DECISION METHOD
    # -----------------------------
    def evaluate(self, forecast: dict):
        demand = forecast.get("predicted_demand", 0)
        stock = forecast.get("current_stock", 0)
        confidence = float(forecast.get("confidence_score", 0))

        product_id = forecast.get("product_id")

        # =============================
        # 1. Handle low confidence
        # =============================
        if confidence < self.min_confidence:
            return {
                "product_id": product_id,
                "action": "NO_ACTION",
                "reason": "Low confidence forecast",
                "confidence": confidence,
                "demand": demand,
                "stock": stock
            }

        # =============================
        # 2. Apply safety stock buffer
        # =============================
        adjusted_demand = int(demand * self.safety_factor)

        # =============================
        # 3. Decision rules
        # =============================
        if stock < adjusted_demand:
            action = "RESTOCK"
            order_qty = adjusted_demand - stock

        elif stock > adjusted_demand * 1.5:
            action = "REDUCE_STOCK"
            order_qty = 0

        else:
            action = "HOLD"
            order_qty = 0

        # =============================
        # 4. Return structured result
        # =============================
        return {
            "product_id": product_id,
            "action": action,
            "recommended_order": int(order_qty),
            "adjusted_demand": adjusted_demand,
            "raw_demand": demand,
            "stock": stock,
            "confidence": confidence
        }