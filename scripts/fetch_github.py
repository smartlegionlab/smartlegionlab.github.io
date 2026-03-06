import requests
import json
import os


def fetch_github_repos():
    print("Fetching GitHub repositories...")
    
    url = "https://api.github.com/users/smartlegionlab/repos?sort=updated&per_page=100"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        repos = response.json()
        
        if not isinstance(repos, list) or len(repos) == 0:
            print("⚠️ Error: Invalid or empty response from GitHub API")
            print("✅ Existing data preserved.")
            return
        
        repos.sort(key=lambda x: x['pushed_at'], reverse=True)
        
        os.makedirs('data', exist_ok=True)
        
        with open('data/repos.json', 'w', encoding='utf-8') as f:
            json.dump(repos, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved {len(repos)} repositories to data/repos.json")
        
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Error fetching repositories: {e}")
        print("✅ Existing data preserved.")
        return


if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    fetch_github_repos()
