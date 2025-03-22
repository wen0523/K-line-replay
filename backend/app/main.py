from flask import Flask
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/data')
def get_ohlcv_data():
    with open('/home/wen/Projects/K-line-replay/backend/data/ohlcv_data.json', 'r') as f:
        data = json.load(f)

    print(type(data))
    return {
        'name':'BTC',
        'data':data,
    }

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)