import requests
import json
import os
import time


PYPI_PACKAGES = [
    'smartpasslib',
    'clipassman',
    'clipassgen',
    'smart-tsp-solver',
    'smart-tsp-benchmark',
    'smart-2fa-secure',
    'babylonian-image-library',
    'smart-babylon-library',
    'commandman',
    'smartpathlibrary',
    'smartexecutorlib',
    'climan',
    'github-ssh-key',
    'commandpack',
    'smartprinter',
    'smartcliapp',
    'commandex',
    'smartrandom',
    'smarttextdecorator',
    'smartauthen',
    'smart-redis-storage',
    'smart-text-randomizer',
    'smart-repository-manager-core'
]


def fetch_package_info(package_name):
    url = f"https://pypi.org/pypi/{package_name}/json"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            info = data['info']
            
            return {
                'name': package_name,
                'version': info.get('version', '0.0.0'),
                'summary': info.get('summary', 'No summary available'),
                'description': info.get('description', 'No description available'),
                'project_url': f"https://pypi.org/project/{package_name}/",
                'error': False
            }
        else:
            return {
                'name': package_name,
                'error': True,
                'error_msg': f'HTTP {response.status_code}'
            }
    except Exception as e:
        return {
            'name': package_name,
            'error': True,
            'error_msg': str(e)
        }


def fetch_all_packages():
    print("Fetching PyPI packages...")
    
    results = []
    
    for i, package in enumerate(PYPI_PACKAGES):
        print(f"  [{i+1}/{len(PYPI_PACKAGES)}] Fetching {package}...")
        
        package_info = fetch_package_info(package)
        results.append(package_info)
        
        time.sleep(0.5)
    
    with open('data/pypi.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    successful = len([p for p in results if not p.get('error')])
    failed = len([p for p in results if p.get('error')])
    
    print(f"✅ Saved {successful} successful and {failed} failed packages to data/pypi.json")


if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    fetch_all_packages()
