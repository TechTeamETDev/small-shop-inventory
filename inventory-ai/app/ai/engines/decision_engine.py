import numpy as np


class DecisionEngine:

    def __init__(
        self,
        safety_factor: float = 1.15,
        min_confidence: float = 0.3,
        reorder_days: int = 7,
        emergency_days: int = 2,
        safety_stock: int = 5
    ):
        self.safety_factor = safety_factor  # ↓ 1.15 (realistic for small shops)
        self.min_confidence = min_confidence  # ↓ 0.3 (30%, more lenient)
        self.reorder_days = reorder_days
        self.emergency_days = emergency_days
        self.safety_stock = safety_stock  # ↓ 5 (realistic for limited capital)

    def _calculate_dynamic_confidence_threshold(self, product_count: int) -> float:
        """
        Adjust confidence threshold based on product volume.
        - Few products (1-20): Lower threshold (more conservative forecasts)
        - Medium (20-100): Medium threshold
        - Many (100+): Higher threshold (stricter requirements)
        """
        if product_count <= 20:
            return 0.25  # Very lenient for small catalogs
        elif product_count <= 50:
            return 0.30  # Lenient for small shops
        elif product_count <= 200:
            return 0.40  # Moderate for medium shops
        else:
            return 0.50  # Stricter for large catalogs

    def evaluate(self, forecast: dict, product_count: int = None):

        forecast = forecast or {}

        product = forecast.get("product") or {}
        metrics = forecast.get("metrics") or {}
        meta = forecast.get("model_meta") or {}

        product_id = product.get("id")
        stock = float(product.get("current_quantity") or 0)

        total_demand = float(metrics.get("predicted_demand") or 0)
        confidence = float(metrics.get("confidence_score") or 0)

        confidence = max(0.0, min(confidence, 1.0))
        total_demand = max(total_demand, 0.0)

        periods = meta.get("periods", 30)

        daily_demand = float(
            metrics.get("avg_daily_demand")
            or (total_demand / max(periods, 1))
        )

        # DYNAMIC THRESHOLD based on product volume
        min_conf_threshold = (
            self._calculate_dynamic_confidence_threshold(product_count)
            if product_count
            else self.min_confidence
        )

        short_term_demand = daily_demand * self.reorder_days
        safety_stock = max(self.safety_stock, daily_demand * 1.5)

        # compute days_of_stock first so we can override low-confidence
        # decisions when inventory is already critical
        if daily_demand <= 0:
            days_of_stock = float("inf")
        else:
            days_of_stock = stock / daily_demand

        if days_of_stock <= self.emergency_days:
            stock_status = "CRITICAL"
        elif days_of_stock <= self.reorder_days:
            stock_status = "UNDERSTOCKED"
        else:
            stock_status = "OK"

        risk_score = 1 - np.exp(-short_term_demand / (stock + 1e-6))
        risk_score = float(np.clip(risk_score, 0.0, 1.0))

        # ACTION MAP
        action_map = {
            "CRITICAL": "EMERGENCY_RESTOCK",
            "UNDERSTOCKED": "RESTOCK",
            "OK": "NO_ACTION"
        }

        action = action_map[stock_status]

        if stock_status == "CRITICAL":
            # EMERGENCY: order for next 14 days + safety buffer
            recommended_order = int(
                (daily_demand * 14) + safety_stock - stock
            )

            # If stock is critical, override low-confidence and force emergency restock
            return {
                "product_id": product_id,
                "action": "EMERGENCY_RESTOCK",
                "stock": int(stock),
                "daily_demand": round(daily_demand, 1),
                "days_of_stock": round(days_of_stock, 1),
                "recommended_order": max(0, recommended_order),
                "confidence": round(confidence, 2),
                "confidence_threshold": round(min_conf_threshold, 2),
                "risk_score": round(risk_score, 2),
                "reason": f"CRITICAL: Will run out in {round(days_of_stock, 1)} days. Immediate restocking required. (confidence={round(confidence,2)})"
            }

        # LOW CONFIDENCE: after handling critical stock, if confidence remains
        # below threshold, skip non-emergency recommendations
        if confidence < min_conf_threshold:
            return {
                "product_id": product_id,
                "action": "NO_ACTION",
                "recommended_order": 0,
                "stock": int(stock),
                "confidence": round(confidence, 2),
                "confidence_threshold": round(min_conf_threshold, 2),
                "reason": f"Low confidence forecast ({round(confidence, 2)} < {round(min_conf_threshold, 2)})"
            }

        # NORMAL: order for 7-day reorder period with safety multiplier
        target_stock = (short_term_demand * self.safety_factor) + safety_stock

        recommended_order = int(target_stock - stock)

        return {
            "product_id": product_id,
            "action": action,
            "stock": int(stock),
            "daily_demand": round(daily_demand, 1),
            "days_of_stock": round(days_of_stock, 1),
            "target_stock": round(target_stock, 1),
            "recommended_order": max(0, recommended_order),
            "confidence": round(confidence, 2),
            "confidence_threshold": round(min_conf_threshold, 2),
            "risk_score": round(risk_score, 2),
            "reason": "Forecast-based inventory planning"
        }
