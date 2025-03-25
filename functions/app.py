from flask import Flask, render_template
import mysql.connector
from dotenv import load_dotenv
import os

app = Flask(__name__)
load_dotenv()

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE')
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

@app.route('/')
def index():
    title = os.getenv('SITE_TITLE')
    slogan = os.getenv('SITE_SLOGAN')
    return render_template('index.html', title=title, slogan=slogan)

@app.route('/downloads')
def downloads():
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM documents")
        documents = cursor.fetchall()
        connection.close()
        return render_template('downloads.html', documents=documents)
    else:
        return "Database connection failed", 500

if __name__ == '__main__':
    app.run(debug=True)