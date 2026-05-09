import logging
import pandas as pd
from prophet import Prophet
from typing import Dict, Any
import numpy as np

logger = logging.getLogger(__name__)


class ProphetEngine:

    def __init__(self):
        self.models = {}

    def predict(
        self,
        product: Dict[str, Any],
        sales_data: pd.DataFrame,
        periods: int = 30
    ) -> Dict[str, Any]:

        if sales_data is None or sales_data.empty:
            return self._empty_response(product)

        # If there is very little history, use a simple fallback heuristic
        # instead of returning zeros. This gives the decision engine data to act on.
        if len(sales_data) < 7:
            try:
                return self._fallback_forecast(product, sales_data, periods)
            except Exception:
                return self._empty_response(product)

        df = sales_data.copy()

        df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
        df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)
        df["y"] = df["y"].clip(lower=0)

        df = df.dropna(subset=["ds"])
        df = df.groupby("ds", as_index=False)["y"].sum()

        df = self._fill_missing_days(df)

        try:
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=False,
                changepoint_prior_scale=0.05
            )
            model.fit(df)

        except Exception as e:
            logger.exception("Prophet training failed")
            return self._empty_response(product)

        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)

        result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(periods)
        result = result.dropna()

        result["yhat"] = result["yhat"].fillna(0).clip(lower=0)

        predicted_demand = float(result["yhat"].sum())
        avg_daily = predicted_demand / max(periods, 1)

        interval_width = (result["yhat_upper"] - result["yhat_lower"]).mean()
        mean_forecast = result["yhat"].mean()
        historical_std = max(df["y"].std(), 1.0)

        uncertainty_ratio = interval_width / (abs(mean_forecast) + historical_std)

        confidence = float(np.clip(1 / (1 + uncertainty_ratio), 0.05, 1.0))

        historical_avg = df["y"].mean()
        future_avg = result["yhat"].mean()

        if future_avg > historical_avg * 1.1:
            trend = "up"
        elif future_avg < historical_avg * 0.9:
            trend = "down"
        else:
            trend = "stable"

        return {
            "product_id": product.get("id"),
            "product": self._normalize_product(product),

            "forecast": result.to_dict(orient="records"),

            "metrics": {
                "predicted_demand": predicted_demand,
                "avg_daily_demand": avg_daily,
                "confidence_score": confidence,
                "trend": trend
            }
        }

    # =========================
    # HELPERS
    # =========================
    def _normalize_product(self, product):
        return {
            "id": product.get("id"),
            "name": product.get("name"),
            "current_quantity": product.get("current_quantity", 0),
        }

    def _fill_missing_days(self, df):
        df = df.set_index("ds")

        full_range = pd.date_range(
            start=df.index.min(),
            end=df.index.max(),
            freq="D"
        )

        df = df.reindex(full_range)
        df["y"] = df["y"].fillna(0)

        df = df.reset_index()
        df.columns = ["ds", "y"]

        return df

    def _empty_response(self, product):
        return {
            "product_id": product.get("id"),
            "product": self._normalize_product(product),
            "metrics": {
                "predicted_demand": 0,
                "avg_daily_demand": 0,
                "confidence_score": 0,
                "trend": "stable"
            },
            "forecast": []
        }

    def _fallback_forecast(self, product: Dict[str, Any], sales_data: pd.DataFrame, periods: int = 30):
        """
        Simple heuristic fallback when sales history is too short for Prophet.
        - Uses average daily sales from available days
        - Sets confidence based on number of data points and variance
        - Produces a simple flat forecast for `periods` days
        """
        df = sales_data.copy()

        # normalize columns
        if "ds" in df.columns:
            df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
        if "y" in df.columns:
            df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)
        elif "quantity" in df.columns:
            df["y"] = pd.to_numeric(df.get("quantity"), errors="coerce").fillna(0)
        else:
            df["y"] = 0

        df = df.dropna(subset=["ds"]) if "ds" in df.columns else df

        days = max(1, len(df))
        historical_avg = float(df["y"].mean()) if not df.empty else 0.0

        # predicted demand over the period
        predicted_demand = float(historical_avg * periods)
        avg_daily = float(historical_avg)

        # Confidence heuristic: base + data_points factor - variance penalty
        variance = float(df["y"].std()) if not df.empty else 0.0
        base = 0.2
        data_factor = min(0.4, 0.05 * days)
        variance_penalty = min(0.3, variance / (historical_avg + 1e-6) * 0.1)
        confidence = float(np.clip(base + data_factor - variance_penalty, 0.05, 0.9))

        # build simple repeated forecast records
        records = []
        start = pd.to_datetime(df["ds"].max()) if ("ds" in df.columns and not df.empty) else pd.Timestamp.today()
        for i in range(1, periods + 1):
            records.append({
                "ds": str(start + pd.Timedelta(days=i)),
                "yhat": avg_daily,
                "yhat_lower": max(0, avg_daily - variance),
                "yhat_upper": avg_daily + variance,
            })

        trend = "up" if avg_daily > (historical_avg * 1.05) else "stable"

        return {
            "product_id": product.get("id"),
            "product": self._normalize_product(product),
            "forecast": records,
            "metrics": {
                "predicted_demand": predicted_demand,
                "avg_daily_demand": avg_daily,
                "confidence_score": confidence,
                "trend": trend
            }
        }
