from repository import database

dbCreator = database.DatabaseCreator()
dbCreator.init_database()

dbInitializer = database.DatabaseInitializer()
dbInitializer.fill_data()