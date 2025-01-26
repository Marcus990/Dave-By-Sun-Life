import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def init_db(app):
    mongodb_uri = os.getenv('MONGODB_URI')
    client = MongoClient(mongodb_uri)
    app.db = client.etfs_db
    return app.db 