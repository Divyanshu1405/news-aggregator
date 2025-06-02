from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/news')
def get_news():
    query = request.args.get('q', '')
    category = request.args.get('category', '')
    url = f"https://newsapi.org/v2/top-headlines?apiKey=YOUR_API_KEY&country=us&q={query}&category={category}"
    response = requests.get(url)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)
