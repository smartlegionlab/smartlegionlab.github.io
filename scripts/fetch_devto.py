import requests
import json
import os


def fetch_devto_articles():
    print("Fetching Dev.to articles...")
    
    url = "https://dev.to/api/articles?username=smartlegionlab&per_page=100"
    
    response = requests.get(url)
    response.raise_for_status()
    
    articles = response.json()
    
    with open('data/articles.json', 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(articles)} articles to data/articles.json")


if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    fetch_devto_articles()
