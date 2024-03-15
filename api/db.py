import sqlite3
DATABASE_NAME = "test.db"


def get_db():
    conn = sqlite3.connect(DATABASE_NAME)
    return conn