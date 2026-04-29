class DecisionEngine:
    """
    Production-grade Inventory Decision Engine

    Converts forecast → business action:
    - RESTOCK
    - HOLD
    - OVERSTOCK_RISK
    - NO_ACTION (low confidence)
    """

    def __init__(
        self,
        safety_factor: float = 1.2,
        min_confidence: float = 0.5,
        critical_stock_ratio: float = 0.3
    ):
        """
        Args:
            safety_factor: buffer above predicted demand
            min_confidence: ignore weak forecasts
            critical_stock_ratio: triggers emergency restock
        """
        self.safety_factor = safety_factor
        self.min_confidence = min_confidence
        self.critical_stock_ratio = critical_stock_ratio

    # =============================
    # MAIN DECISION METHOD
    # =============================
    def evaluate(self, forecast: dict):

        demand = float(forecast.get("predicted_demand", 0))
        stock = float(forecast.get("current_stock", 0))
        confidence = float(forecast.get("confidence_score", 0))
        product_id = forecast.get("product_id")

        # -----------------------------
        # 1. LOW CONFIDENCE FILTER
        # -----------------------------
        if confidence < self.min_confidence:
            return {
                "product_id": product_id,
                "action": "NO_ACTION",
                "reason": "Low confidence forecast",
                "confidence": confidence,
                "demand": demand,
                "stock": stock
            }

        # -----------------------------
        # 2. SAFETY BUFFER (business risk protection)
        # -----------------------------
        adjusted_demand = demand * self.safety_factor

        # -----------------------------
        # 3. CRITICAL STOCK CHECK
        # (emergency stock protection)
        # -----------------------------
        if stock <= demand * self.critical_stock_ratio:
            return {
                "product_id": product_id,
                "action": "EMERGENCY_RESTOCK",
                "reason": "Critical stock level",
                "recommended_order": int(adjusted_demand - stock),
                "adjusted_demand": int(adjusted_demand),
                "confidence": confidence,
                "stock": stock
            }

        # -----------------------------
        # 4. NORMAL BUSINESS RULES
        # -----------------------------
        stock_gap = adjusted_demand - stock

        if stock_gap > 0:
            action = "RESTOCK"
            recommended_order = int(stock_gap)

        else:
            # too much stock
            surplus_ratio = stock / (adjusted_demand + 1e-9)

            if surplus_ratio > 1.5:
                action = "OVERSTOCK_RISK"
            else:
                action = "HOLD"

            recommended_order = 0

        # -----------------------------
        # 5. FINAL RESPONSE
        # -----------------------------
        return {
            "product_id": product_id,
            "action": action,
            "recommended_order": recommended_order,
            "raw_demand": int(demand),
            "adjusted_demand": int(adjusted_demand),
            "stock": stock,
            "confidence": confidence
        }