import requests
import json
import os
import time


ZENODO_RECORDS = {
    'pointerParadigm': '17204738',
    'localDataParadigm': '17264327',
    'deterministicEngine': '17383447',
    'pchParadigm': '17614888'
}


def fetch_record_stats(record_id):
    url = f"https://zenodo.org/api/records/{record_id}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            stats = data.get('stats', {})
            
            return {
                'unique_views': stats.get('unique_views', 0),
                'unique_downloads': stats.get('unique_downloads', 0),
                'total_views': stats.get('views', 0),
                'total_downloads': stats.get('downloads', 0)
            }
        else:
            print(f"  ⚠️ Record {record_id} returned {response.status_code}")
            return None
    except Exception as e:
        print(f"  ❌ Error fetching {record_id}: {e}")
        return None


def fetch_all_stats():
    print("📡 Fetching Zenodo statistics...")
    
    results = {}
    
    for key, record_id in ZENODO_RECORDS.items():
        print(f"  Fetching {key} ({record_id})...")
        stats = fetch_record_stats(record_id)
        results[key] = stats
        time.sleep(0.5)
    
    return results


if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    
    stats = fetch_all_stats()
    
    with open('data/zenodo.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Zenodo stats saved to data/zenodo.json")
