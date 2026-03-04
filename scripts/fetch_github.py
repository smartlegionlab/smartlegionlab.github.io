import requests
import json
import os


def fetch_github_repos():
    print("Fetching GitHub repositories...")
    
    url = "https://api.github.com/users/smartlegionlab/repos?sort=updated&per_page=100"
    
    response = requests.get(url)
    response.raise_for_status()
    
    repos = response.json()
    
    repos.sort(key=lambda x: x['pushed_at'], reverse=True)
    
    with open('data/repos.json', 'w', encoding='utf-8') as f:
        json.dump(repos, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {len(repos)} repositories to data/repos.json")


if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    fetch_github_repos()
