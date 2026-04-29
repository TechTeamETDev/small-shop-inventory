from sqlalchemy import create_engine, text
import pandas as pd
from dotenv import load_dotenv

load_dotenv()


class Database:
    """
    Handles all database queries for AI engine
    """

    def __init__(self, db_url: str):
        self.engine = create_engine(db_url, pool_pre_ping=True)

    def get_sales_history(self, product_id: int, start_date=None, end_date=None):
        query = """
        SELECT 
            DATE(s.sale_date) as ds,
            SUM(si.quantity) as y
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        WHERE si.product_id = :product_id
        """

        params = {"product_id": product_id}

        if start_date:
            query += " AND s.sale_date >= :start_date"
            params["start_date"] = start_date

        if end_date:
            query += " AND s.sale_date <= :end_date"
            params["end_date"] = end_date

        query += """
        GROUP BY DATE(s.sale_date)
        ORDER BY ds ASC
        """

        try:
            with self.engine.connect() as conn:
                result = conn.execute(text(query), params)
                rows = result.fetchall()

            df = pd.DataFrame(rows, columns=["ds", "y"])

            if df.empty:
                return df

            df = df.copy()
            df["ds"] = pd.to_datetime(df["ds"])
            df["y"] = df["y"].astype(float)

            return df

        except Exception as e:
            print(f"[DB ERROR] get_sales_history: {e}")
            return pd.DataFrame(columns=["ds", "y"])

    def get_products(self):
        query = "SELECT id, name, current_quantity FROM products"

        try:
            with self.engine.connect() as conn:
                result = conn.execute(text(query))
                rows = result.fetchall()

            return pd.DataFrame(rows, columns=["id", "name", "current_quantity"])

        except Exception as e:
            print(f"[DB ERROR] get_products: {e}")
            return pd.DataFrame()