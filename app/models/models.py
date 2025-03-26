import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        return None

def fetch_projects():
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
            SELECT * FROM projects 
            ORDER BY created_at DESC
            """
            cursor.execute(query)
            projects = cursor.fetchall()
            cursor.close()
            connection.close()
            return projects
        except Error as e:
            print(f"Error fetching projects: {e}")
            return []
    return []

def fetch_experience():
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
            SELECT * FROM experience 
            ORDER BY start_date DESC
            """
            cursor.execute(query)
            experience = cursor.fetchall()
            cursor.close()
            connection.close()
            return experience
        except Error as e:
            print(f"Error fetching experience: {e}")
            return []
    return []

def fetch_education():
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
            SELECT * FROM education 
            ORDER BY start_date DESC
            """
            cursor.execute(query)
            education = cursor.fetchall()
            cursor.close()
            connection.close()
            return education
        except Error as e:
            print(f"Error fetching education: {e}")
            return []
    return []

def fetch_certifications():
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
            SELECT * FROM certifications 
            ORDER BY issued_date DESC
            """
            cursor.execute(query)
            certifications = cursor.fetchall()
            cursor.close()
            connection.close()
            return certifications
        except Error as e:
            print(f"Error fetching certifications: {e}")
            return []
    return []

def submit_enquiry(name, email, message):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = """
            INSERT INTO enquiries (name, email, message) 
            VALUES (%s, %s, %s)
            """
            values = (name, email, message)
            cursor.execute(query, values)
            connection.commit()
            cursor.close()
            connection.close()
            return True
        except Error as e:
            print(f"Error submitting enquiry: {e}")
            return False
    return False 