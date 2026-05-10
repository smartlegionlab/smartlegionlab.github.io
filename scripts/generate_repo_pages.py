import json
import os
import shutil
import tempfile
import re
from datetime import datetime
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom
from jinja2 import Environment, FileSystemLoader

try:
    import markdown
    MARKDOWN_AVAILABLE = True
    print("✅ Markdown support enabled")
except ImportError:
    MARKDOWN_AVAILABLE = False
    print("⚠️ Markdown not installed. Run: pip install markdown")
    print("   Description will be shown as plain text")

REPO_JSON_PATH = 'data/repos.json'
REPO_TEMPLATE_PATH = 'templates/repo_template.html'
REPO_OUTPUT_DIR = 'repositories'

PACKAGE_JSON_PATH = 'data/pypi.json'
PACKAGE_TEMPLATE_PATH = 'templates/package_template.html'
PACKAGE_OUTPUT_DIR = 'packages'

SITEMAP_PATH = 'sitemap.xml'
BASE_URL = 'https://smartlegionlab.ru'

BASE_PAGES = [
    {'loc': f"{BASE_URL}/", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '1.0'},
    {'loc': f"{BASE_URL}/about.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/skills.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/projects.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.9'},
    {'loc': f"{BASE_URL}/research.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.9'},
    {'loc': f"{BASE_URL}/research/pointer-based-security.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/research/local-data-regeneration.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/research/deterministic-game-engine.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/research/position-candidate-hypothesis.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/packages.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/articles.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystems.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystem/smartpasslib-ecosystem.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystem/babylon-ecosystem.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystem/repo-manager-ecosystem.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystem/2fa-ecosystem.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystem/tsp-ecosystem.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystem/research-ecosystem.html", 'lastmod': '2026-03-07', 'changefreq': 'weekly', 'priority': '0.8'},
]

LANGUAGE_COLORS = {
    'Python': '#3572A5', 'JavaScript': '#f1e05a', 'HTML': '#e34c26',
    'CSS': '#563d7c', 'TypeScript': '#2b7489', 'Shell': '#89e051',
    'Dockerfile': '#384d54', 'Jupyter Notebook': '#DA5B0B',
    'PHP': '#4F5D95', 'Java': '#b07219', 'C++': '#f34b7d',
    'C#': '#178600', 'Ruby': '#701516', 'Go': '#00ADD8', 'Rust': '#dea584'
}

def ensure_dir(directory):
    Path(directory).mkdir(parents=True, exist_ok=True)
    print(f"📁 The directory is ready: {directory}")

def safe_replace_output(new_dir, target_dir):
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
        print(f"🧹 The old directory has been removed: {target_dir}")
    shutil.move(new_dir, target_dir)
    print(f"✅ New directory installed: {target_dir}")

def format_date(date_string):
    if not date_string:
        return ''
    try:
        d = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return d.strftime('%b %d, %Y')
    except:
        return date_string[:10]

def format_date_iso(date_string):
    if not date_string:
        return datetime.now().strftime('%Y-%m-%d')
    try:
        d = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return d.strftime('%Y-%m-%d')
    except:
        return datetime.now().strftime('%Y-%m-%d')


def optimize_markdown_images(html):
    # Сначала обрабатываем обычные изображения
    pattern = r'<img\s+([^>]*?)src="([^"]+)"([^>]*?)>'

    def add_loading_attrs(match):
        attrs = match.group(1) + match.group(3)
        src = match.group(2)

        if 'loading=' not in attrs:
            attrs += ' loading="lazy"'

        if any(badge in src for badge in ['shields.io', 'pepy.tech', 'badge']):
            if 'style=' in attrs:
                attrs = re.sub(r'style="([^"]*)"', r'style="\1; max-height: 20px; width: auto;"', attrs)
            else:
                attrs += ' style="max-height: 20px; width: auto;"'
        else:
            if 'width=' not in attrs and 'height=' not in attrs:
                attrs += ' width="100%" height="auto"'

        return f'<img {attrs} src="{src}">'

    return re.sub(pattern, add_loading_attrs, html)

def generate_repo_pages(repos_data, output_dir):
    template_dir = os.path.dirname(REPO_TEMPLATE_PATH)
    template_file = os.path.basename(REPO_TEMPLATE_PATH)
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template(template_file)
    generated = []
    failed_repos = []
    today = datetime.now().strftime('%Y-%m-%d')
    for repo in repos_data:
        if repo.get('archived'):
            print(f"⏭️ Skipping an archived repo: {repo['name']}")
            continue
        try:
            size_mb = round(repo.get('size', 0) / 1024, 2)
            license_name = repo.get('license', {}).get('name', '') if repo.get('license') else ''
            context = {
                'repo_name': repo['name'],
                'repo_full_name': repo.get('full_name', repo['name']),
                'repo_description': repo.get('description') or 'No description provided.',
                'repo_url': repo['html_url'],
                'language': repo.get('language'),
                'language_color': LANGUAGE_COLORS.get(repo.get('language'), '#8b949e'),
                'stars': repo.get('stargazers_count', 0),
                'forks': repo.get('forks_count', 0),
                'watchers': repo.get('watchers_count', 0),
                'open_issues': repo.get('open_issues_count', 0),
                'created_at': format_date(repo.get('created_at')),
                'updated_at': format_date(repo.get('updated_at')),
                'pushed_at': format_date(repo.get('pushed_at')),
                'size_mb': size_mb,
                'default_branch': repo.get('default_branch', 'main'),
                'license_name': license_name,
                'homepage': repo.get('homepage'),
                'topics': repo.get('topics', []),
                'is_fork': repo.get('fork', False),
                'is_archived': repo.get('archived', False),
                'is_private': repo.get('private', False),
            }
            html_content = template.render(**context)
            output_path = os.path.join(output_dir, f"{repo['name']}.html")
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"✅ Generated repo: {output_path}")
            generated.append({
                'loc': f"{BASE_URL}/repositories/{repo['name']}.html",
                'lastmod': today,
                'changefreq': 'daily',
                'priority': '0.7'
            })
        except Exception as e:
            print(f"❌ Error generating page for {repo['name']}: {str(e)}")
            failed_repos.append(repo['name'])
    return generated, failed_repos

def markdown_to_html(text):
    if not text:
        return ''
    if MARKDOWN_AVAILABLE:
        try:
            html = markdown.markdown(
                text,
                extensions=[
                    'markdown.extensions.extra',
                    'markdown.extensions.codehilite',
                    'markdown.extensions.toc',
                    'markdown.extensions.tables',
                    'markdown.extensions.fenced_code',
                    'markdown.extensions.nl2br',
                ]
            )
            return optimize_markdown_images(html)
        except Exception as e:
            print(f"⚠️ Markdown conversion error: {e}")
            return f"<pre>{text}</pre>"
    else:
        return f"<pre>{text}</pre>"

def generate_package_pages(packages_data, output_dir):
    template_dir = os.path.dirname(PACKAGE_TEMPLATE_PATH)
    template_file = os.path.basename(PACKAGE_TEMPLATE_PATH)
    env = Environment(loader=FileSystemLoader(template_dir))
    env.filters['markdown'] = markdown_to_html
    template = env.get_template(template_file)
    generated = []
    failed_packages = []
    today = datetime.now().strftime('%Y-%m-%d')
    for package in packages_data:
        try:
            if package.get('error'):
                print(f"⚠️ Skipping package with error: {package.get('name', 'unknown')}")
                continue
            name = package.get('name', 'unknown')
            version = package.get('version', 'N/A')
            summary = package.get('summary', 'No summary provided.')
            description = package.get('description', '')
            project_url = package.get('project_url', '#')
            release_date = package.get('release_date')
            downloads = package.get('downloads')
            requires_python = package.get('requires_python')
            license_info = package.get('license')
            context = {
                'name': name,
                'version': version,
                'summary': summary,
                'description': description,
                'project_url': project_url,
                'error': False,
                'release_date': release_date,
                'downloads': downloads,
                'requires_python': requires_python,
                'license': license_info,
                'author': package.get('author'),
                'author_email': package.get('author_email'),
                'maintainer': package.get('maintainer'),
                'maintainer_email': package.get('maintainer_email'),
                'home_page': package.get('home_page'),
                'keywords': package.get('keywords'),
                'classifiers': package.get('classifiers', []),
                'platform': package.get('platform'),
                'requires_dist': package.get('requires_dist', []),
                'provides_extras': package.get('provides_extras', []),
                'requires_external': package.get('requires_external', []),
                'project_urls': package.get('project_urls', {}),
                'docs_url': package.get('docs_url'),
                'package_url': package.get('package_url')
            }
            html_content = template.render(**context)
            output_path = os.path.join(output_dir, f"{name}.html")
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"✅ Generated package: {output_path}")
            generated.append({
                'loc': f"{BASE_URL}/packages/{name}.html",
                'lastmod': today,
                'changefreq': 'daily',
                'priority': '0.7'
            })
        except Exception as e:
            print(f"❌ Error generating page for package {package.get('name', 'unknown')}: {str(e)}")
            failed_packages.append(package.get('name', 'unknown'))
    return generated, failed_packages

def generate_sitemap(repo_urls, package_urls, output_path):
    root = Element('urlset')
    root.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    today = datetime.now().strftime('%Y-%m-%d')
    for page in BASE_PAGES:
        url_elem = SubElement(root, 'url')
        loc = SubElement(url_elem, 'loc')
        loc.text = page['loc']
        lastmod = SubElement(url_elem, 'lastmod')
        lastmod.text = today
        changefreq = SubElement(url_elem, 'changefreq')
        changefreq.text = page['changefreq']
        priority = SubElement(url_elem, 'priority')
        priority.text = page['priority']
    print(f"📄 Added base pages: {len(BASE_PAGES)}")
    for repo in repo_urls:
        url_elem = SubElement(root, 'url')
        loc = SubElement(url_elem, 'loc')
        loc.text = repo['loc']
        lastmod = SubElement(url_elem, 'lastmod')
        lastmod.text = repo['lastmod']
        changefreq = SubElement(url_elem, 'changefreq')
        changefreq.text = repo['changefreq']
        priority = SubElement(url_elem, 'priority')
        priority.text = repo['priority']
    print(f"📄 Added repository pages: {len(repo_urls)}")
    for package in package_urls:
        url_elem = SubElement(root, 'url')
        loc = SubElement(url_elem, 'loc')
        loc.text = package['loc']
        lastmod = SubElement(url_elem, 'lastmod')
        lastmod.text = package['lastmod']
        changefreq = SubElement(url_elem, 'changefreq')
        changefreq.text = package['changefreq']
        priority = SubElement(url_elem, 'priority')
        priority.text = package['priority']
    print(f"📄 Added package pages: {len(package_urls)}")
    xml_str = minidom.parseString(tostring(root)).toprettyxml(indent='  ', encoding='utf-8')
    with open(output_path, 'wb') as f:
        f.write(xml_str)
    total_urls = len(BASE_PAGES) + len(repo_urls) + len(package_urls)
    print(f"✅ Sitemap saved: {output_path}")
    print(f"   - Total URLs: {total_urls}")
    print(f"   - Generation date: {today}")

def main():
    print("🚀 Start generating repository and package pages...")
    print("=" * 50)
    if not MARKDOWN_AVAILABLE:
        print("\n⚠️ For better Markdown rendering, install:")
        print("   pip install markdown")
        print("   pip install pygments")
        print("=" * 50)
    files_to_check = [
        (REPO_JSON_PATH, "repositories JSON"),
        (REPO_TEMPLATE_PATH, "repository template"),
        (PACKAGE_JSON_PATH, "packages JSON"),
        (PACKAGE_TEMPLATE_PATH, "package template")
    ]
    all_files_exist = True
    for path, description in files_to_check:
        if not os.path.exists(path):
            print(f"❌ File {path} ({description}) not found!")
            all_files_exist = False
    if not all_files_exist:
        print("\n🛑 Missing required files. Aborting.")
        return
    with open(REPO_JSON_PATH, 'r', encoding='utf-8') as f:
        repos_data = json.load(f)
    print(f"📦 Loaded {len(repos_data)} repositories from JSON")
    with open(PACKAGE_JSON_PATH, 'r', encoding='utf-8') as f:
        packages_data = json.load(f)
    print(f"📦 Loaded {len(packages_data)} packages from JSON")
    print(f"📄 Templates loaded: repo, package")
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"📁 Created temporary directory: {temp_dir}")
        temp_repos_dir = os.path.join(temp_dir, 'repositories')
        temp_packages_dir = os.path.join(temp_dir, 'packages')
        ensure_dir(temp_repos_dir)
        ensure_dir(temp_packages_dir)
        print("\n" + "=" * 30)
        print("📚 Generating repository pages...")
        repo_urls, failed_repos = generate_repo_pages(repos_data, temp_repos_dir)
        print("\n" + "=" * 30)
        print("📦 Generating package pages...")
        package_urls, failed_packages = generate_package_pages(packages_data, temp_packages_dir)
        errors = []
        if failed_repos:
            errors.append(f"Repositories: {len(failed_repos)} failed")
        if failed_packages:
            errors.append(f"Packages: {len(failed_packages)} failed")
        if errors:
            print("\n❌ Generation failed:")
            for error in errors:
                print(f"   - {error}")
            if failed_repos:
                print("\nFailed repositories:")
                for repo in failed_repos:
                    print(f"   - {repo}")
            if failed_packages:
                print("\nFailed packages:")
                for pkg in failed_packages:
                    print(f"   - {pkg}")
            print("\n🛑 Aborting update. Original files remain untouched.")
            return
        print(f"\n✅ Successfully generated {len(repo_urls)} repository pages")
        print(f"✅ Successfully generated {len(package_urls)} package pages")
        temp_sitemap_path = os.path.join(temp_dir, 'sitemap.xml')
        generate_sitemap(repo_urls, package_urls, temp_sitemap_path)
        print("\n🔄 All pages generated successfully. Replacing old files...")
        safe_replace_output(temp_repos_dir, REPO_OUTPUT_DIR)
        safe_replace_output(temp_packages_dir, PACKAGE_OUTPUT_DIR)
        if os.path.exists(SITEMAP_PATH):
            os.remove(SITEMAP_PATH)
        shutil.copy2(temp_sitemap_path, SITEMAP_PATH)
        print(f"✅ Sitemap installed: {SITEMAP_PATH}")
    print("\n✨ Ready! All files have been updated atomically.")
    print(f"   - Repositories: {len(repo_urls)} pages")
    print(f"   - Packages: {len(package_urls)} pages")
    print(f"   - Total URLs in sitemap: {len(BASE_PAGES) + len(repo_urls) + len(package_urls)}")
    if not MARKDOWN_AVAILABLE:
        print("\n💡 Tip: Install markdown for better formatting:")
        print("   pip install markdown pygments")

if __name__ == '__main__':
    main()
