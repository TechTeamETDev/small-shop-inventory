from app.db import Database
from app.prophet_engine import ProphetEngine
from app.ai.decision_engine import DecisionEngine

db = Database("mysql+pymysql://root:@localhost/smallshop")

engine = ProphetEngine()
decision_engine = DecisionEngine()

df = db.get_sales_history(product_id=1)

forecast = engine.predict(
    product_id=1,
    sales_data=df,
    current_stock=20
)

decision = decision_engine.evaluate(forecast)

print("FORECAST:", forecast)
print("DECISION:", decision)