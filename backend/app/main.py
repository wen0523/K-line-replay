from api.router import app
from flask_cors import CORS

CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}}, supports_credentials=True)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)