import os
from dotenv import load_dotenv

load_dotenv()

from app.db import Database
from app.prophet_engine import ProphetEngine
from app.ai.engines.decision_engine import DecisionEngine
from app.ai.engines.risk_engine import RiskEngine
from app.ai.engines.alert_engine import AlertEngine
from app.ai.engines.llm_engine import ExplanationEngine
from app.ai.core.pipeline import InventoryPipeline
from app.ai_repository import AIRepository

DB_URL = os.getenv('DATABASE_URL')
if not DB_URL:
    raise SystemExit('DATABASE_URL not set')

print('Initializing...')
db = Database(DB_URL)
repo = AIRepository(db)

pipeline = InventoryPipeline(
    db=db,
    prophet=ProphetEngine(),
    decision=DecisionEngine(),
    risk=RiskEngine(),
    explainer=ExplanationEngine(use_llm=False),
    alerts=AlertEngine(),
    repo=repo
)

product_ids = db.get_all_product_ids()
print(f'Found {len(product_ids)} products')

for pid in product_ids:
    try:
        print(f'Running pipeline for product {pid}...')
        ctx = pipeline.run(pid)
        if ctx:
            print('  saved:', ctx.prediction_result.get('recommended_action'))
        else:
            print('  skipped (no context)')
    except Exception as e:
        print('  failed:', e)

print('Done.')
