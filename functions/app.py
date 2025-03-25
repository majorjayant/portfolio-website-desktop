from flask import Flask, render_template
import mysql.connector
from dotenv import load_dotenv
import os
import time

print("--- Starting app.py initialization ---")
start_time = time.time()

app = Flask(__name__)
print("Flask app created.")
load_dotenv()
print("dotenv loaded.")

def get_db_connection():
    print("--- Attempting to connect to database ---")
    try:
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE')
        )
        print("--- Database connection successful ---")
        return connection
    except mysql.connector.Error as err:
        print(f"--- Database connection error: {err} ---")
        return None

print("--- Defining routes ---")
@app.route('/')
def index():
    print("--- Index route called ---")
    title = os.getenv('SITE_TITLE')
    slogan = os.getenv('SITE_SLOGAN')
    return render_template('index.html', title=title, slogan=slogan)

@app.route('/downloads')
def downloads():
    print("--- Downloads route called ---")
    connection = get_db_connection()
    if connection:
        print("--- Database connection in downloads route successful ---")
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM documents")
        documents = cursor.fetchall()
        print("--- Documents fetched in downloads route ---")
        connection.close()
        return render_template('downloads.html', documents=documents)
    else:
        print("--- Database connection failed in downloads route ---")
        return "Database connection failed", 500

end_time = time.time()
print(f"--- app.py initialization complete in {end_time - start_time:.2f} seconds ---")

if __name__ == '__main__':
    print("--- Running app in debug mode ---")
    app.run(debug=True)