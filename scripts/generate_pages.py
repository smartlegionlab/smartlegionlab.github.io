import json
from datetime import datetime

from bs4 import BeautifulSoup


def format_date(date_string):
    if not date_string:
        return ''
    try:
        d = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return d.strftime('%b %d, %Y')
    except:
        return date_string[:10]


def generate_repo_cards(repos):
    cards = []
    colors = {
        'Python': '#3572A5', 'JavaScript': '#f1e05a', 'HTML': '#e34c26',
        'CSS': '#563d7c', 'TypeScript': '#2b7489', 'Shell': '#89e051',
        'Dockerfile': '#384d54', 'Jupyter Notebook': '#DA5B0B',
        'PHP': '#4F5D95', 'Java': '#b07219', 'C++': '#f34b7d',
        'C#': '#178600', 'Ruby': '#701516', 'Go': '#00ADD8', 'Rust': '#dea584'
    }

    for repo in repos:
        if repo.get('archived'): continue
        color = colors.get(repo.get('language'), '#8b949e')

        card = f'''        <div class="repo-card">
            <div class="repo-badges">
                {f'<span class="repo-badge bg-secondary">Fork</span>' if repo.get('fork') else ''}
                {f'<span class="repo-badge bg-danger">Archived</span>' if repo.get('archived') else ''}
                {f'<span class="repo-badge bg-warning">Private</span>' if repo.get('private') else ''}
            </div>
            <div class="repo-header">
                <div class="repo-title-section">
                    <a href="{repo['html_url']}" target="_blank" class="repo-title">{repo['name']}</a>
                    <div class="repo-owner"><i class="bi bi-person"></i> {repo.get('owner', {}).get('login', 'smartlegionlab')}</div>
                </div>
                <div class="repo-stats">
                    <span class="repo-stat text-warning"><i class="bi bi-star"></i> {repo.get('stargazers_count', 0)}</span>
                    <span class="repo-stat text-info"><i class="bi bi-diagram-2"></i> {repo.get('forks_count', 0)}</span>
                    {f'<span class="repo-stat text-primary"><i class="bi bi-eye"></i> {repo.get("watchers_count", 0)}</span>' if repo.get('watchers_count', 0) > 0 else ''}
                </div>
            </div>
            <p class="repo-description">{repo.get('description', 'No description provided')}</p>
            {f'<div class="repo-topics">{"".join([f"<span class=\"repo-topic\">{topic}</span>" for topic in repo.get("topics", [])])}</div>' if repo.get('topics') else ''}
            <div class="repo-meta">
                {f'<div class="repo-meta-item"><div class="repo-language"><span class="language-dot" style="background-color: {color}"></span> {repo["language"]}</div></div>' if repo.get('language') else ''}
                <div class="repo-meta-item"><i class="bi bi-calendar"></i> Created: {format_date(repo.get("created_at"))}</div>
                <div class="repo-meta-item"><i class="bi bi-arrow-clockwise"></i> Updated: {format_date(repo.get("updated_at"))}</div>
                {f'<div class="repo-meta-item"><i class="bi bi-hdd"></i> {round(repo.get("size", 0) / 1024 * 10) / 10} MB</div>' if repo.get('size') else ''}
            </div>
            <div class="repo-footer">
                <div class="repo-updated"><i class="bi bi-clock"></i> Last updated {format_date(repo.get("pushed_at"))}</div>
                <div class="btn-group">
                    <a href="repositories/{repo['name']}.html" class="btn btn-outline-warning repo-action"><i class="bi bi-box-arrow-up-right"></i> View</a>
                    <a href="{repo['html_url']}" target="_blank" class="btn btn-outline-primary repo-action"><i class="bi bi-box-arrow-up-right"></i> Github</a>
                </div>
            </div>
        </div>'''
        cards.append(card)
    return '\n'.join(cards)


def generate_article_cards(articles):
    cards = []
    for article in articles:
        published_date = format_date(article.get('published_at'))
        read_time = article.get('reading_time_minutes', '')
        read_time_html = f'{read_time} min read' if read_time else ''
        is_popular = article.get('positive_reactions_count', 0) > 10
        has_discussion = article.get('comments_count', 0) > 5
        author_name = article.get('user', {}).get('name', 'Alexander Suvorov')

        topics_block = ''
        if article.get('tag_list'):
            tag_spans = ''.join([f'<span class="repo-topic" title="{tag}">{tag}</span>'
                                 for tag in article.get('tag_list', [])[:5]])
            if len(article.get('tag_list', [])) > 5:
                tag_spans += f'<span class="repo-topic">+{len(article["tag_list"]) - 5} more</span>'
            topics_block = f'<div class="repo-topics">{tag_spans}</div>'

        card = f'''        <div class="repo-card">
            <div class="repo-badges">
                {f'<span class="repo-badge bg-success">Popular</span>' if is_popular else ''}
                {f'<span class="repo-badge bg-info">Active Discussion</span>' if has_discussion else ''}
                {f'<span class="repo-badge bg-primary">Published</span>' if article.get('published_at') else ''}
            </div>
            <div class="repo-header">
                <div class="repo-title-section">
                    <a href="{article['url']}" target="_blank" class="repo-title" title="{article['title']}">
                        {article['title']}
                    </a>
                    <div class="repo-owner">
                        <i class="bi bi-person"></i> {author_name}
                    </div>
                </div>
                <div class="repo-stats">
                    <span class="repo-stat text-danger" title="Likes">
                        <i class="bi bi-heart"></i> {article.get('positive_reactions_count', 0)}
                    </span>
                    <span class="repo-stat text-info" title="Comments">
                        <i class="bi bi-chat"></i> {article.get('comments_count', 0)}
                    </span>
                    {f'<span class="repo-stat text-warning" title="Reactions"><i class="bi bi-emoji-smile"></i> {article.get("public_reactions_count", 0)}</span>' if article.get('public_reactions_count', 0) > 0 else ''}
                </div>
            </div>
            <p class="repo-description">{article.get('description', 'No description provided')}</p>
            {topics_block}
            <div class="repo-meta">
                <div class="repo-meta-item">
                    <i class="bi bi-calendar"></i> Published: {published_date}
                </div>
                {f'<div class="repo-meta-item"><i class="bi bi-clock"></i> {read_time_html}</div>' if read_time_html else ''}
                {f'<div class="repo-meta-item"><i class="bi bi-eye"></i> {article.get("page_views_count", 0)} views</div>' if article.get('page_views_count', 0) > 0 else ''}
            </div>
            <div class="repo-footer">
                <div class="repo-updated">
                    <i class="bi bi-tags"></i> {len(article.get('tag_list', []))} tags
                </div>
                <a href="{article['url']}" target="_blank" class="repo-action" title="Read full article">
                    <i class="bi bi-box-arrow-up-right"></i> Read Article
                </a>
            </div>
        </div>'''
        cards.append(card)
    return '\n'.join(cards)


def generate_package_cards(packages):
    cards = []
    for pkg in packages:
        if pkg.get('error'): continue

        version_count = len(pkg.get('versions', [])) if isinstance(pkg.get('versions'), list) else 1

        card = f'''        <div class="repo-card">
            <div class="repo-badges">
                {f'<span class="repo-badge bg-info">{version_count} versions</span>' if version_count > 1 else ''}
            </div>
            <div class="repo-header">
                <div class="repo-title-section" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <a href="{pkg.get('project_url', f'https://pypi.org/project/{pkg["name"]}/')}" target="_blank" class="repo-title">{pkg['name']}</a>
                    <span class="pip-badge text-warning" style="background: rgba(13, 110, 253, 0.1); border: 1px solid var(--accent);">v{pkg.get('version', '?')}</span>
                </div>
            </div>

            <p class="repo-description">{pkg.get('summary', pkg.get('description', 'No description available'))}</p>

            <div class="package-tabs-container">
                <div class="package-format">
                    <span class="pip-command">pip install {pkg['name']}</span>
                    <button class="copy-btn" onclick="copyToClipboard('pip install {pkg['name']}', this)" title="Copy to clipboard">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
            </div>

            {f'<div class="repo-meta"><div class="repo-meta-item"><i class="bi bi-box"></i> {version_count} versions available</div></div>' if version_count > 1 else ''}

            <div class="repo-footer" style="display: flex; justify-content: flex-end; width: 100%;">
                <div class="btn-group">
                    <a href="packages/{pkg["name"]}.html" class="btn btn-outline-warning repo-action">
                        <i class="bi bi-box-arrow-up-right"></i> View
                    </a> 
                    <a href="{pkg.get('project_url', f'https://pypi.org/project/{pkg["name"]}/')}" target="_blank" class="btn btn-outline-primary repo-action">
                        <i class="bi bi-box-arrow-up-right"></i> View on PyPI
                    </a>
                </div>
            </div>
        </div>'''
        cards.append(card)
    return '\n'.join(cards)


def update_html_with_id(html_file, container_id, cards_html):
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    container = soup.find(id=container_id)
    if not container:
        print(f"❌ ID '{container_id}' not found")
        return False

    container.clear()
    new_cards = BeautifulSoup(cards_html, 'html.parser')
    for card in new_cards.children:
        if card.name:
            container.append(card)

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())

    print(f"✅ Updated {html_file}")
    return True


def main():
    repos = []
    articles = []
    packages = []

    try:
        with open('data/repos.json', 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if content:
                repos = json.loads(content)
            else:
                print("⚠️  data/repos.json is empty")
    except FileNotFoundError:
        print("⚠️  data/repos.json not found")
    except json.JSONDecodeError as e:
        print(f"⚠️  data/repos.json is corrupted: {e}")

    try:
        with open('data/articles.json', 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if content:
                articles = json.loads(content)
            else:
                print("⚠️  data/articles.json is empty")
    except FileNotFoundError:
        print("⚠️  data/articles.json not found")
    except json.JSONDecodeError as e:
        print(f"⚠️  data/articles.json is corrupted: {e}")

    try:
        with open('data/pypi.json', 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if content:
                packages = json.loads(content)
            else:
                print("⚠️  data/pypi.json is empty")
    except FileNotFoundError:
        print("⚠️  data/pypi.json not found")
    except json.JSONDecodeError as e:
        print(f"⚠️  data/pypi.json is corrupted: {e}")

    if repos:
        repos = [r for r in repos if not r.get('archived')]
        repos.sort(key=lambda x: x.get('pushed_at', ''), reverse=True)

        all_repos_cards = []
        for repo in repos:
            repo_card = generate_repo_cards([repo])
            all_repos_cards.append(repo_card)

        update_html_with_id(
            'projects.html',
            'repos-container',
            '\n'.join(all_repos_cards),
        )

    if packages:
        packages = [p for p in packages if not p.get('error')]

        all_packages_cards = []
        for package in packages:
            package_card = generate_package_cards([package])
            all_packages_cards.append(package_card)

        update_html_with_id(
            'packages.html',
            'packages-container',
            '\n'.join(all_packages_cards),
        )

    print('✅ Done!')


if __name__ == '__main__':
    main()
