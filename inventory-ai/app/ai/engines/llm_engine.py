from typing import Dict


class ExplanationEngine:
    """
    Phase 3: SaaS-grade Explanation Layer

    Converts:
        Forecast + Decision → Human business explanation

    Design:
        - deterministic fallback (safe)
        - LLM-ready architecture (future upgrade)
        - structured reasoning model
    """

    def __init__(self, use_llm: bool = False):
        self.use_llm = use_llm

    # -----------------------------
    # MAIN API
    # -----------------------------
    def explain(self, forecast: Dict, decision: Dict) -> str:
        """
        Generate human-readable business explanation
        """

        context = self._build_context(forecast, decision)

        # =============================
        # LLM MODE (future upgrade)
        # =============================
        if self.use_llm:
            return self._llm_explain(context)

        # =============================
        # RULE-BASED FALLBACK (NOW)
        # =============================
        return self._rule_based_explain(context)

    # -----------------------------
    # CONTEXT BUILDER (IMPORTANT)
    # -----------------------------
    def _build_context(self, forecast: Dict, decision: Dict) -> Dict:
        product = (forecast or {}).get("product") or {}
        metrics = (forecast or {}).get("metrics") or {}
        product_id = product.get("id") or forecast.get("product_id")
        product_name = product.get("name")
        product_sku = product.get("sku")

        label_parts = [p for p in [product_name, product_sku] if p]
        product_label = " / ".join(label_parts) if label_parts else f"Product {product_id}"

        return {
            "product_id": product_id,
            "product_label": product_label,
            "demand": metrics.get("predicted_demand", 0),
            "stock": product.get("current_stock", 0),
            "min_stock": product.get("min_stock_level", 0),
            "confidence": float(metrics.get("confidence_score", 0)),
            "action": decision.get("action"),
            "recommended_order": decision.get("recommended_order", 0),
            "reason": decision.get("reason", "Model-based decision")
        }

    # -----------------------------
    # RULE-BASED ENGINE (NOW)
    # -----------------------------
    def _rule_based_explain(self, ctx: Dict) -> str:

        product_id = ctx["product_id"]
        product_label = ctx.get("product_label") or f"Product {product_id}"
        demand = ctx["demand"]
        stock = ctx["stock"]
        min_stock = ctx.get("min_stock", 0) or 0
        confidence = ctx["confidence"]
        action = ctx["action"]
        recommended_order = ctx.get("recommended_order", 0) or 0

        # =============================
        # LOW CONFIDENCE CASE
        # =============================
        if confidence < 0.5:
            if stock <= 0:
                return (
                    f"We have low forecast confidence ({confidence:.2f}) for {product_label}, "
                    "but stock is already at zero. "
                    "Consider a small emergency replenishment while we gather more data."
                )

            if min_stock and stock <= min_stock:
                return (
                    f"Forecast confidence is low ({confidence:.2f}) for {product_label}. "
                    f"Stock is below the minimum level ({stock:.0f} / {min_stock:.0f}). "
                    "A cautious top-up is recommended until we have stronger signals."
                )

            return (
                f"Forecast confidence is low ({confidence:.2f}) for {product_label}. "
                f"For now, we recommend {action.replace('_', ' ').lower()} to avoid acting on weak data. "
                "Collect more sales data to unlock a stronger recommendation."
            )

        # =============================
        # EMERGENCY RESTOCK
        # =============================
        if action == "EMERGENCY_RESTOCK":
            return (
                f"Urgent: {product_label} is trending toward stockout. "
                f"Forecast demand ({demand:.0f}) far exceeds available stock ({stock:.0f}). "
                f"Restock immediately; suggested order is {recommended_order:.0f} units."
            )

        # =============================
        # RESTOCK
        # =============================
        if action == "RESTOCK":
            return (
                f"Recommendation: restock {product_label}. "
                f"Projected demand ({demand:.0f}) is higher than current stock ({stock:.0f}). "
                f"Confidence is {confidence:.2f}. Suggested order is {recommended_order:.0f} units."
            )

        # =============================
        # OVERSTOCK / REDUCE
        # =============================
        if action in ["OVERSTOCK", "REDUCE_STOCK"]:
            return (
                f"{product_label} appears overstocked. "
                f"Current stock ({stock:.0f}) exceeds expected demand ({demand:.0f}). "
                "Consider slowing reorders or running a promotion to reduce carrying cost."
            )

        # =============================
        # HOLD (DEFAULT)
        # =============================
        return (
            f"{product_label} looks stable. "
            f"Current stock ({stock:.0f}) aligns with projected demand ({demand:.0f}). "
            "Maintain current purchasing and review again after more sales data."
        )

    # -----------------------------
    # LLM HOOK (PHASE 4 READY)
    # -----------------------------
    def _llm_explain(self, context: Dict) -> str:
        """
        Placeholder for Phase 4 (LLM like TinyLlama/OpenAI)

        You will later plug:
            - TinyLlama
            - Mistral
            - OpenAI GPT
        """
        return (
            f"[LLM MODE ENABLED]\n"
            f"Product {context['product_id']} requires decision explanation.\n"
            f"Context: {context}\n"
            f"(Replace with real LLM call in Phase 4)"
        )
