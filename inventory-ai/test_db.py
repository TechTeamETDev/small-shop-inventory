from app.db import Database
import os
from dotenv import load_dotenv

load_dotenv()

db = Database(os.getenv("DB_URL"))

print(db.get_products())