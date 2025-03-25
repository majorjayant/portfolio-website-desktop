from flask import Flask

app = Flask(__name__)

print("Minimal app starting...")

@app.route('/')
def index():
    return "Hello from minimal app!"

if __name__ == '__main__':
    app.run(debug=True)