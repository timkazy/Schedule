from dotenv import load_dotenv
import os

from repository import database, queries

BACKEND_PORT = int(os.getenv('BACKEND_PORT'))

dbCreator = database.DatabaseCreator()
dbCreator.init_database()

dbInitializer = database.DatabaseInitializer()
dbInitializer.fill_data()

print(queries.get_input_data())
