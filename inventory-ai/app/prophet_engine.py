import pandas as pd
from prophet import Prophet


class ProphetEngine:
    """
    AI Forecast Engine using Facebook Prophet
    """

    def __init__(self):
        self.models = {}

    # -----------------------------
    # MAIN PREDICTION
    # -----------------------------
    def predict(self, product_id: int, sales_data: pd.DataFrame, periods: int = 30, current_stock: int = 0):

        # =============================
        # FIX 1: Minimum data check
        # =============================
        if sales_data is None or sales_data.empty:
            return self._empty_response(product_id)

        if len(sales_data) < 7:
            return {
                "product_id": product_id,
                "message": "Not enough data (minimum 7 days required)",
                "confidence_score": 0.0,
                "predicted_demand": 0
            }

        df = sales_data.copy()

        # =============================
        # FIX 2: Handle missing dates
        # Prophet needs continuous time series
        # =============================
        df["ds"] = pd.to_datetime(df["ds"])
        df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)

        df = self._fill_missing_days(df)

        # =============================
        # Prophet Model
        # =============================
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=True
        )

        model.fit(df)

        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)

        result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(periods).copy()

        # prevent negative demand
        result["yhat"] = result["yhat"].clip(lower=0)

        # confidence
        confidence = self._calculate_confidence(result)

        # total demand
        total_demand = int(result["yhat"].sum())

        # =============================
        # FIX 3: Inventory logic
        # =============================
        stock_status = "OK"
        recommended_order = 0

        if current_stock < total_demand:
            stock_status = "LOW_STOCK_RISK"
            recommended_order = total_demand - current_stock
        elif current_stock > total_demand * 1.5:
            stock_status = "OVERSTOCK"

        return {
            "product_id": product_id,
            "forecast_start": str(result["ds"].iloc[0].date()),
            "forecast_end": str(result["ds"].iloc[-1].date()),
            "predicted_demand": total_demand,
            "current_stock": current_stock,
            "stock_status": stock_status,
            "recommended_order": recommended_order,
            "confidence_score": round(confidence, 2),
            "daily_forecast": result.to_dict(orient="records")
        }

    # -----------------------------
    # FIX 2 HELP: Fill missing days
    # -----------------------------
    def _fill_missing_days(self, df):
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

    # -----------------------------
    # CONFIDENCE SCORE
    # -----------------------------
    def _calculate_confidence(self, forecast_df):
        avg_width = (forecast_df["yhat_upper"] - forecast_df["yhat_lower"]).mean()
        avg_value = forecast_df["yhat"].mean()

        if avg_value == 0:
            return 0.0

        uncertainty_ratio = avg_width / (avg_value + 1e-9)
        return max(0, 1 - uncertainty_ratio)

    # -----------------------------
    # EMPTY RESPONSE
    # -----------------------------
    def _empty_response(self, product_id):
        return {
            "product_id": product_id,
            "predicted_demand": 0,
            "confidence_score": 0.0,
            "message": "Not enough data for forecasting"
        }