import pandas as pd
from prophet import Prophet
from typing import Dict, Any



class ProphetEngine:
    """
    PURE Forecast Engine (SaaS-ready)
    """

    def __init__(self):
        self.models = {}

    def predict(
        self,
        product: Dict[str, Any],
        sales_data: pd.DataFrame,
        periods: int = 30
    ) -> Dict[str, Any]:

        if sales_data is None or len(sales_data) == 0:
            return self._empty_response(product)

        if len(sales_data) < 7:
            return {
                "product_id": product.get("id"),
                "product": product,
                "forecast": [],
                "metrics": {
                    "predicted_demand": 0,
                    "avg_daily_demand": 0,
                    "confidence_score": 0.0
                },
                "message": "Not enough data (min 7 days required)"
            }

        df = sales_data.copy()

        df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
        df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)

        df = df.dropna(subset=["ds"])
        df = df.groupby("ds", as_index=False)["y"].sum()
        df = self._fill_missing_days(df)

        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False,
            changepoint_prior_scale=0.05
        )

        model.fit(df)

        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)

        result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(periods).copy()
        result["yhat"] = result["yhat"].clip(lower=0)

        predicted_demand = float(result["yhat"].sum())
        avg_daily = float(result["yhat"].mean())

        confidence = min(1.0, max(0.5, 1 - (df["y"].std() / (df["y"].mean() + 1))))

        return {
            "product": {
                "id": product.get("id"),
                "name": product.get("name"),
                "sku": product.get("sku"),
                "category": product.get("category"),
                "current_stock": product.get("current_stock", 0),
            },
            "forecast": result.to_dict(orient="records"),
            "metrics": {
                "predicted_demand": predicted_demand,
                "avg_daily_demand": avg_daily,
                "confidence_score": confidence
            },
            "model_meta": {
                "model": "prophet",
                "periods": periods,
                "data_points": len(df)
            }
        }

    def _fill_missing_days(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.set_index("ds")

        full_range = pd.date_range(
            start=df.index.min(),
            end=df.index.max(),
            freq="D"
        )

        df = df.reindex(full_range, fill_value=0)
        df = df.reset_index()
        df.columns = ["ds", "y"]

        return df

    def _empty_response(self, product: Dict[str, Any]) -> dict:
        return {
            "product": product,
            "forecast": [],
            "metrics": {
                "predicted_demand": 0,
                "avg_daily_demand": 0,
                "confidence_score": 0.0
            },
            "message": "Not enough data for forecasting"
        }


# =============================
# EXTERNAL ENTRY POINT (IMPORTANT)
# =============================
def run_forecast(product, sales_data):
    engine = ProphetEngine()
    return engine.predict(product, sales_data)