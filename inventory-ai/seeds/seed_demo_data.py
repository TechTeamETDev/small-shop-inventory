import sys
import os

# ✅ MUST BE FIRST
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import random
from datetime import datetime, timedelta
from app.db import Database
from sqlalchemy import text

db = Database("mysql+pymysql://root:@localhost/smallshop")

# -------------------------
# RESET
# -------------------------
def reset_data():
    with db.engine.begin() as conn:
        conn.execute(text("DELETE FROM sale_items"))
        conn.execute(text("DELETE FROM sales"))
        print("✅ Old sales cleared")

# -------------------------
# GET PRODUCTS
# -------------------------
def get_products():
    with db.engine.connect() as conn:
        result = conn.execute(text("SELECT id FROM products"))
        return [row[0] for row in result.fetchall()]

# -------------------------
# CREATE SALES
# -------------------------
def seed_sales(num_days=30):
    product_ids = get_products()

    start_date = datetime.now() - timedelta(days=num_days)

    with db.engine.begin() as conn:
        for day in range(num_days):
            sale_date = start_date + timedelta(days=day)

            for _ in range(random.randint(2, 5)):

                total = 0
                profit = 0

                result = conn.execute(text("""
                    INSERT INTO sales 
                    (user_id, customer_name, customer_phone, total_amount, payment_method, sale_date, status, total_profit)
                    VALUES (1, :name, :phone, 0, 'cash', :date, 'completed', 0)
                """), {
                    "name": f"Customer{random.randint(100,999)}",
                    "phone": f"0911{random.randint(100000,999999)}",
                    "date": sale_date
                })

                sale_id = result.lastrowid

                for _ in range(random.randint(1, 3)):
                    product_id = random.choice(product_ids)

                    qty = random.randint(1, 5)
                    unit_price = random.randint(20, 200)
                    unit_cost = unit_price - random.randint(5, 20)

                    subtotal = qty * unit_price
                    item_profit = qty * (unit_price - unit_cost)

                    total += subtotal
                    profit += item_profit

                    conn.execute(text("""
                        INSERT INTO sale_items
                        (sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
                        VALUES
                        (:sale_id, :product_id, :qty, :price, :cost, :subtotal, :profit)
                    """), {
                        "sale_id": sale_id,
                        "product_id": product_id,
                        "qty": qty,
                        "price": unit_price,
                        "cost": unit_cost,
                        "subtotal": subtotal,
                        "profit": item_profit
                    })

                conn.execute(text("""
                    UPDATE sales
                    SET total_amount = :total, total_profit = :profit
                    WHERE id = :id
                """), {
                    "total": total,
                    "profit": profit,
                    "id": sale_id
                })

    print("✅ Demo sales data generated!")

if __name__ == "__main__":
    reset_data()
    seed_sales(60)