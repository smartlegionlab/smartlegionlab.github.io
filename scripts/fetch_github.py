import requests
import json
import os
from datetime import datetime


def fetch_github_user_info():
    print("Fetching GitHub user information...")

    url = "https://api.github.com/users/smartlegionlab"

    try:
        response = requests.get(url)
        response.raise_for_status()

        user_data = response.json()

        user_data['fetched_at'] = datetime.now().isoformat()

        os.makedirs('data', exist_ok=True)

        with open('data/user.json', 'w', encoding='utf-8') as f:
            json.dump(user_data, f, indent=2, ensure_ascii=False)

        print(f"✅ Saved user information to data/user.json")
        return user_data

    except requests.exceptions.RequestException as e:
        print(f"⚠️ Error fetching user info: {e}")
        return None


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


def fetch_github_events():
    print("Fetching recent GitHub events...")

    url = "https://api.github.com/users/smartlegionlab/events?per_page=10"

    try:
        response = requests.get(url)
        response.raise_for_status()

        events = response.json()

        os.makedirs('data', exist_ok=True)

        with open('data/events.json', 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)

        print(f"✅ Saved {len(events)} recent events to data/events.json")

    except requests.exceptions.RequestException as e:
        print(f"⚠️ Error fetching events: {e}")


def fetch_all_github_data():
    print("=" * 50)
    print("Starting GitHub data fetch...")
    print("=" * 50)

    user_info = fetch_github_user_info()
    fetch_github_repos()
    fetch_github_events()

    if user_info:
        print("\n📊 GitHub Profile Summary:")
        print(f"   • Name: {user_info.get('name', 'N/A')}")
        print(f"   • Public Repos: {user_info.get('public_repos', 0)}")
        print(f"   • Followers: {user_info.get('followers', 0)}")
        print(f"   • Following: {user_info.get('following', 0)}")
        print(f"   • Account created: {user_info.get('created_at', 'N/A')[:10]}")

    print("=" * 50)
    print("✅ All data fetched successfully!")
    print("=" * 50)


if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    fetch_all_github_data()