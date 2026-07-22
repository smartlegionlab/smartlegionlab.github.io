from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

SITEMAP_PATH = 'sitemap.xml'
BASE_URL = 'https://smartlegionlab.ru'

BASE_PAGES = [
    {'loc': f"{BASE_URL}/", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '1.0'},
    {'loc': f"{BASE_URL}/projects.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.9'},
    {'loc': f"{BASE_URL}/libraries.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystems.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystems/smart-passwords-ecosystem.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystems/deterministic-ecosystem.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystems/repository-management-ecosystem.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystems/2fa-management-ecosystem.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystems/np-problem-ecosystem.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystems/research-ecosystem.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/ecosystems/todo-ecosystem.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-social-network.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-password-manager-desktop.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-2fa-manager-android.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-password-manager-web.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-repository-manager-gui.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-password-manager-csharp-desktop.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-project-manager.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-file-duplicate-manager.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-2fa-manager-desktop.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-task-manager.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/forgejo-sync-manager-gui.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-password-manager-android.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/applications/smart-repository-manager-cli.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/team.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/profiles/smartlegionlab.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/profiles/aixandrolab.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/articles.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/articles/pointer-based-security-paradigm-article.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/articles/local-data-regeneration-paradigm-article.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/articles/deterministic-game-engine-tech-report-article.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/articles/position-candidate-hypothesis-paradigm-article.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/research.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/research/pointer-based-security-paradigm.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/research/local-data-regeneration-paradigm.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/research/deterministic-game-engine-tech-report.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': f"{BASE_URL}/research/position-candidate-hypothesis-paradigm.html", 'lastmod': '2026-07-01', 'changefreq': 'weekly', 'priority': '0.8'},
]


def generate_sitemap():
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

    xml_str = minidom.parseString(tostring(root)).toprettyxml(indent='  ', encoding='utf-8')
    with open(SITEMAP_PATH, 'wb') as f:
        f.write(xml_str)

    print(f"✅ Sitemap saved: {SITEMAP_PATH}")
    print(f"   - Total URLs: {len(BASE_PAGES)}")
    print(f"   - Generation date: {today}")


if __name__ == '__main__':
    generate_sitemap()
