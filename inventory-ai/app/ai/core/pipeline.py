from typing import Optional

from app.ai.core.inventory_context import InventoryContext
from app.prophet_engine import ProphetEngine
from app.ai.engines.decision_engine import DecisionEngine
from app.ai.engines.risk_engine import RiskEngine
from app.ai.engines.llm_engine import ExplanationEngine
from app.ai.engines.alert_engine import AlertEngine


class InventoryPipeline:
    """Simple pipeline wrapper to run forecast → decision → risk → explain → alerts"""

    def __init__(self, db, prophet: Optional[ProphetEngine] = None):
        self.db = db
        self.prophet = prophet or ProphetEngine()
        self.decision = DecisionEngine()
        self.risk = RiskEngine()
        self.explainer = ExplanationEngine()
        self.alerts = AlertEngine()

    def run(self, product_id: int, periods: int = 30) -> InventoryContext:

        product = self.db.get_product_by_id(product_id)
        sales_data = self.db.get_sales_history_cached(product_id)

        if not product:
            raise ValueError(f"Product {product_id} not found")

        current_stock = product.get("current_quantity", 0)

        context = InventoryContext(
            product_id=product_id,
            sku=product.get("sku"),
            name=product.get("name"),
            category=product.get("category")
        )

        # 1. FORECAST
        forecast = self.prophet.predict(
            product=product,
            sales_data=sales_data,
            periods=periods
        )

        # ensure current stock present
        if isinstance(forecast, dict):
            forecast.setdefault("product", {})
            forecast["product"]["current_stock"] = current_stock

        context.forecast = forecast

        # 2. DECISION
        context.decision = self.decision.evaluate(context.forecast)

        # 3. RISK
        context.risk = self.risk.evaluate({
            **(context.forecast if isinstance(context.forecast, dict) else {}),
            "current_stock": current_stock
        })

        # 4. EXPLANATION
        context.explanation = self.explainer.explain(
            context.forecast,
            context.decision
        )

        # 5. ALERTS
        context.alerts = self.alerts.generate_alerts(
            context.forecast,
            context.decision,
            context.risk
        )

        # 6. METADATA
        context.metadata.update({
            "product_id": product_id,
            "periods": periods
        })

        return context
