from app.db import Database
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv

load_dotenv()
db = Database(os.getenv('DATABASE_URL'))

# ========================================
# GENERATE REALISTIC SALES DATA
# ========================================
print("🔄 Generating 30 days of sales data...\n")

today = datetime.now()
start_date = today - timedelta(days=30)

# Product 1 (Tv): ~2-3 units/day
print("📦 Product 1 (Tv): Adding 30 days of sales (2-3 units/day)")
for i in range(30):
    sale_date = start_date + timedelta(days=i)
    quantity = random.randint(2, 3)

    # Insert sale
    db.execute("""
        INSERT INTO sales (
            user_id, customer_name, customer_phone,
            total_amount, payment_method,
            sale_date, status, total_profit,
            created_at, updated_at
        )
        VALUES (
            :user_id, :name, :phone,
            :amount, :payment_method,
            :date, :status, :total_profit,
            :created_at, :updated_at
        )
    """, {
        "user_id": 1,
        "name": f"Customer{random.randint(100,999)}",
        "phone": f"0911{random.randint(100000,999999)}",
        "amount": quantity * 100,  # Assume 100 per unit
        "payment_method": "cash",
        "date": sale_date,
        "status": "completed",
        "total_profit": 0,
        "created_at": sale_date,
        "updated_at": sale_date
    })

    # Get the sale ID we just created
    sale_row = db.fetch_one(
        "SELECT id FROM sales WHERE sale_date = :date ORDER BY id DESC LIMIT 1",
        {"date": sale_date}
    )

    if sale_row:
        # Insert sale items (use product prices from DB if available)
        prod = db.fetch_one("SELECT unit_sell_price, unit_buy_price FROM products WHERE id = 1")
        unit_sell = prod["unit_sell_price"] if prod and prod.get("unit_sell_price") else 100
        unit_buy = prod["unit_buy_price"] if prod and prod.get("unit_buy_price") else unit_sell * 0.6
        subtotal = quantity * unit_sell
        profit = subtotal - (quantity * unit_buy)

        db.execute("""
            INSERT INTO sale_items (
                sale_id, product_id, quantity,
                unit_price, unit_cost,
                subtotal, profit,
                stock_after_sale, cost_total,
                created_at, updated_at
            )
            VALUES (
                :sale_id, :product_id, :quantity,
                :unit_price, :unit_cost,
                :subtotal, :profit,
                :stock_after_sale, :cost_total,
                :created_at, :updated_at
            )
        """, {
            "sale_id": sale_row["id"],
            "product_id": 1,
            "quantity": quantity,
            "unit_price": unit_sell,
            "unit_cost": unit_buy,
            "subtotal": subtotal,
            "profit": profit,
            "stock_after_sale": 0,
            "cost_total": quantity * unit_buy,
            "created_at": sale_date,
            "updated_at": sale_date
        })

        # Update sale totals
        db.execute("""
            UPDATE sales
            SET total_amount = total_amount + :amt,
                total_profit = total_profit + :prof,
                updated_at = :now
            WHERE id = :id
        """, {
            "amt": subtotal,
            "prof": profit,
            "now": sale_date,
            "id": sale_row["id"]
        })

print("✅ Product 1 sales data created\n")

# Product 2 (Tv1): ~4-6 units/day (higher demand, lower stock = CRITICAL!)
print("📦 Product 2 (Tv1): Adding 30 days of sales (4-6 units/day)")
for i in range(30):
    sale_date = start_date + timedelta(days=i)
    quantity = random.randint(4, 6)

    # Insert sale
    db.execute("""
        INSERT INTO sales (
            user_id, customer_name, customer_phone,
            total_amount, payment_method,
            sale_date, status, total_profit,
            created_at, updated_at
        )
        VALUES (
            :user_id, :name, :phone,
            :amount, :payment_method,
            :date, :status, :total_profit,
            :created_at, :updated_at
        )
    """, {
        "user_id": 1,
        "name": f"Customer{random.randint(100,999)}",
        "phone": f"0911{random.randint(100000,999999)}",
        "amount": quantity * 150,  # Assume 150 per unit
        "payment_method": "cash",
        "date": sale_date,
        "status": "completed",
        "total_profit": 0,
        "created_at": sale_date,
        "updated_at": sale_date
    })

    # Get the sale ID
    sale_row = db.fetch_one(
        "SELECT id FROM sales WHERE sale_date = :date ORDER BY id DESC LIMIT 1",
        {"date": sale_date}
    )

    if sale_row:
        prod = db.fetch_one("SELECT unit_sell_price, unit_buy_price FROM products WHERE id = 2")
        unit_sell = prod["unit_sell_price"] if prod and prod.get("unit_sell_price") else 150
        unit_buy = prod["unit_buy_price"] if prod and prod.get("unit_buy_price") else unit_sell * 0.6
        subtotal = quantity * unit_sell
        profit = subtotal - (quantity * unit_buy)

        db.execute("""
            INSERT INTO sale_items (
                sale_id, product_id, quantity,
                unit_price, unit_cost,
                subtotal, profit,
                stock_after_sale, cost_total,
                created_at, updated_at
            )
            VALUES (
                :sale_id, :product_id, :quantity,
                :unit_price, :unit_cost,
                :subtotal, :profit,
                :stock_after_sale, :cost_total,
                :created_at, :updated_at
            )
        """, {
            "sale_id": sale_row["id"],
            "product_id": 2,
            "quantity": quantity,
            "unit_price": unit_sell,
            "unit_cost": unit_buy,
            "subtotal": subtotal,
            "profit": profit,
            "stock_after_sale": 0,
            "cost_total": quantity * unit_buy,
            "created_at": sale_date,
            "updated_at": sale_date
        })

        db.execute("""
            UPDATE sales
            SET total_amount = total_amount + :amt,
                total_profit = total_profit + :prof,
                updated_at = :now
            WHERE id = :id
        """, {
            "amt": subtotal,
            "prof": profit,
            "now": sale_date,
            "id": sale_row["id"]
        })

print("✅ Product 2 sales data created\n")
print("=" * 50)
print("✨ Test data generated! Ready for testing.")
print("=" * 50)
