import requests
import json
import os


def fetch_devto_articles():
    print("Fetching Dev.to articles...")
    
    url = "https://dev.to/api/articles?username=smartlegionlab&per_page=100"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        articles = response.json()
        
        if not isinstance(articles, list):
            print("⚠️ Error: Invalid response from Dev.to API")
            print("✅ Existing data preserved.")
            return
        
        os.makedirs('data', exist_ok=True)
        
        with open('data/articles.json', 'w', encoding='utf-8') as f:
            json.dump(articles, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved {len(articles)} articles to data/articles.json")
        
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Error fetching articles: {e}")
        print("✅ Existing data preserved.")
        return


if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    fetch_devto_articles()
