from app.db import Database

db = Database("mysql+pymysql://root:@localhost/smallshop")

print(db.get_product_by_id(1))