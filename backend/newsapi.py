import requests
import os
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
BASE_URL = "https://newsapi.org/v2"

def fetch_news(category="", q="", language="en", from_date=None, to_date=None):
    if from_date and to_date:
        url = f"{BASE_URL}/everything"
        params = {
            "q": q or "latest",
            "from": from_date,
            "to": to_date,
            "language": language,
            "apiKey": NEWS_API_KEY,
            "pageSize": 30,
        }
    else:
        url = f"{BASE_URL}/top-headlines"
        params = {
            "category": category or None,
            "q": q or None,
            "language": language,
            "country": "in",
            "apiKey": NEWS_API_KEY,
            "pageSize": 30,
        }

    params = {k: v for k, v in params.items() if v}

    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch news", "status_code": response.status_code}
