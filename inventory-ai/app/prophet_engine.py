import pandas as pd
from prophet import Prophet


class ProphetEngine:
    """
    AI Forecast Engine using Facebook Prophet

    Responsibilities:
    - Validate sales data
    - Clean & normalize time series
    - Train forecasting model
    - Generate future demand predictions
    - Add inventory-aware insights
    """

    def __init__(self):
        self.models = {}

    # -----------------------------
    # MAIN PREDICTION
    # -----------------------------
    def predict(
        self,
        product_id: int,
        sales_data: pd.DataFrame,
        periods: int = 30,
        current_stock: int = 0
    ):
        """
        Generate demand forecast for a product

        Args:
            product_id: Product ID
            sales_data: DataFrame with columns [ds, y]
            periods: forecast horizon (days)
            current_stock: current inventory

        Returns:
            dict: forecast + inventory insights
        """

        # =============================
        # VALIDATION
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
        # DATA CLEANING
        # =============================
        df["ds"] = pd.to_datetime(df["ds"], errors="coerce")
        df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)

        df = df.dropna(subset=["ds"])
        df = df.groupby("ds").sum().reset_index()

        # Fill missing days (VERY IMPORTANT for Prophet)
        df = self._fill_missing_days(df)

        # =============================
        # MODEL CONFIG (STABLE)
        # =============================
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False,  # avoid overfitting (you don't have yearly data)
            changepoint_prior_scale=0.05  # smoother trend
        )

        model.fit(df)

        # =============================
        # FORECAST
        # =============================
        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)

        result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(periods).copy()

        # =============================
        # CLEAN PREDICTIONS
        # =============================

        # Remove negative demand
        result["yhat"] = result["yhat"].clip(lower=0)

        # Cap extreme spikes (important for small datasets)
        mean_val = result["yhat"].mean()
        upper_limit = max(mean_val * 3, 10)
        result["yhat"] = result["yhat"].clip(upper=upper_limit)

        # =============================
        # METRICS
        # =============================
        confidence = self._calculate_confidence(result)
        total_demand = int(result["yhat"].sum())

        # =============================
        # INVENTORY LOGIC
        # =============================
        stock_status = "OK"
        recommended_order = 0

        if current_stock < total_demand:
            stock_status = "LOW_STOCK_RISK"
            recommended_order = total_demand - current_stock

        elif current_stock > total_demand * 1.5:
            stock_status = "OVERSTOCK"

        # =============================
        # RESPONSE
        # =============================
        return {
            "product_id": product_id,
            "forecast_start": str(result["ds"].iloc[0].date()),
            "forecast_end": str(result["ds"].iloc[-1].date()),
            "predicted_demand": total_demand,
            "current_stock": current_stock,
            "stock_status": stock_status,
            "recommended_order": recommended_order,
            "confidence_score": float(round(confidence, 2)),
            "daily_forecast": result.to_dict(orient="records")
        }

    # -----------------------------
    # FILL MISSING DAYS
    # -----------------------------
    def _fill_missing_days(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Ensures continuous daily time series
        Prophet performs better with no gaps
        """
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
    def _calculate_confidence(self, forecast_df: pd.DataFrame) -> float:
        """
        Confidence based on prediction uncertainty
        """
        avg_width = (forecast_df["yhat_upper"] - forecast_df["yhat_lower"]).mean()
        avg_value = forecast_df["yhat"].mean()

        if avg_value == 0:
            return 0.0

        uncertainty_ratio = avg_width / (avg_value + 1e-9)
        return max(0.0, 1 - uncertainty_ratio)

    # -----------------------------
    # EMPTY RESPONSE
    # -----------------------------
    def _empty_response(self, product_id: int) -> dict:
        return {
            "product_id": product_id,
            "predicted_demand": 0,
            "confidence_score": 0.0,
            "message": "Not enough data for forecasting"
        }