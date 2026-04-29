from app.db import Database
from app.prophet_engine import ProphetEngine
from app.ai.decision_engine import DecisionEngine
from app.ai.llm_engine import ExplanationEngine

db = Database("mysql+pymysql://root:@localhost/smallshop")

forecast_engine = ProphetEngine()
decision_engine = DecisionEngine()
llm_engine = ExplanationEngine()

df = db.get_sales_history(product_id=1)

forecast = forecast_engine.predict(
    product_id=1,
    sales_data=df,
    current_stock=20
)

decision = decision_engine.evaluate(forecast)

explanation = llm_engine.explain(forecast, decision)

print("FORECAST:", forecast)
print("DECISION:", decision)
print("EXPLANATION:", explanation)