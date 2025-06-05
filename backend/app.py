from flask import Flask, request, jsonify
from flask_cors import CORS
from newsapi import fetch_news

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "FetchPress backend is running!"

@app.route("/news")
def get_news():
    category = request.args.get("category", "")
    q = request.args.get("q", "")
    language = request.args.get("language", "en")
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    news = fetch_news(category, q, language, from_date, to_date)
    return jsonify(news)

if __name__ == "__main__":
    app.run(debug=True)
