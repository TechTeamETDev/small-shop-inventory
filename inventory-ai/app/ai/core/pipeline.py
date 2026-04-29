def run(self, product_id: int, periods: int = 30):

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
        product_id=product_id,
        sales_data=sales_data,
        current_stock=current_stock,
        periods=periods
    )

    forecast["current_stock"] = current_stock
    context.forecast = forecast

    # 2. DECISION
    context.decision = self.decision.evaluate(context.forecast)

    # 3. RISK (FIXED INPUT)
    context.risk = self.risk.evaluate({
        **context.forecast,
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
        context.risk["risk_score"]
    )

    # 6. METADATA
    context.metadata.update({
        "product_id": product_id,
        "periods": periods
    })

    return context