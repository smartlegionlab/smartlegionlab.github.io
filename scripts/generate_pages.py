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



def calculate_repo_score(repo):
    stars = repo.get('stargazers_count', 0)
    forks = repo.get('forks_count', 0)
    watchers = repo.get('watchers_count', 0)

    return (stars * 3) + (forks * 2) + watchers


def calculate_article_score(article):
    reactions = article.get('positive_reactions_count', 0)
    comments = article.get('comments_count', 0)
    views = article.get('page_views_count', 0)

    return (reactions * 3) + (comments * 2) + (views // 10)


def calculate_package_score(package):
    version_count = len(package.get('versions', [])) if isinstance(package.get('versions'), list) else 0
    score = version_count * 2

    if package.get('requires_dist'):
        score += len(package['requires_dist'])

    return score


def get_top_repos(repos, n=6):
    if not repos:
        return []

    active_repos = [r for r in repos if not r.get('archived')]

    for repo in active_repos:
        repo['score'] = calculate_repo_score(repo)

    sorted_repos = sorted(active_repos, key=lambda x: x['score'], reverse=True)

    return sorted_repos[:n]


def get_top_articles(articles, n=6):
    if not articles:
        return []

    for article in articles:
        article['score'] = calculate_article_score(article)

    sorted_articles = sorted(articles, key=lambda x: x['score'], reverse=True)

    return sorted_articles[:n]


def get_top_packages(packages, n=6):
    if not packages:
        return []

    valid_packages = [p for p in packages if not p.get('error')]

    for package in valid_packages:
        package['score'] = calculate_package_score(package)

    sorted_packages = sorted(valid_packages, key=lambda x: x['score'], reverse=True)

    return sorted_packages[:n]


def generate_repo_cards(repos, limit=100, is_featured=False):
    cards = []
    colors = {
        'Python': '#3572A5', 'JavaScript': '#f1e05a', 'HTML': '#e34c26',
        'CSS': '#563d7c', 'TypeScript': '#2b7489', 'Shell': '#89e051',
        'Dockerfile': '#384d54', 'Jupyter Notebook': '#DA5B0B',
        'PHP': '#4F5D95', 'Java': '#b07219', 'C++': '#f34b7d',
        'C#': '#178600', 'Ruby': '#701516', 'Go': '#00ADD8', 'Rust': '#dea584'
    }

    for repo in repos[:limit]:
        if repo.get('archived'): continue
        color = colors.get(repo.get('language'), '#8b949e')

        featured_badge = '<span class="repo-badge bg-warning"><i class="bi bi-star-fill"></i> Featured</span>' if is_featured else ''

        card = f'''        <div class="repo-card">
            <div class="repo-badges">
                {featured_badge}
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


def generate_article_cards(articles, limit=100, is_featured=False):
    cards = []
    for article in articles[:limit]:
        published_date = format_date(article.get('published_at'))
        read_time = article.get('reading_time_minutes', '')
        read_time_html = f'{read_time} min read' if read_time else ''
        is_popular = article.get('positive_reactions_count', 0) > 10
        has_discussion = article.get('comments_count', 0) > 5
        author_name = article.get('user', {}).get('name', 'Alexander Suvorov')

        featured_badge = '<span class="repo-badge bg-warning"><i class="bi bi-star-fill"></i> Featured</span>' if is_featured else ''

        topics_block = ''
        if article.get('tag_list'):
            tag_spans = ''.join([f'<span class="repo-topic" title="{tag}">{tag}</span>'
                                 for tag in article.get('tag_list', [])[:5]])
            if len(article.get('tag_list', [])) > 5:
                tag_spans += f'<span class="repo-topic">+{len(article["tag_list"]) - 5} more</span>'
            topics_block = f'<div class="repo-topics">{tag_spans}</div>'

        card = f'''        <div class="repo-card">
            <div class="repo-badges">
                {featured_badge}
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


def generate_package_cards(packages, limit=100, is_featured=False):
    cards = []
    for pkg in packages[:limit]:
        if pkg.get('error'): continue

        featured_badge = '<span class="repo-badge bg-warning"><i class="bi bi-star-fill"></i> Featured</span>' if is_featured else ''

        version_count = len(pkg.get('versions', [])) if isinstance(pkg.get('versions'), list) else 1

        card = f'''        <div class="repo-card">
            <div class="repo-badges">
                {featured_badge}
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


def update_html_with_id(html_file, container_id, cards_html, featured_container_id=None, featured_cards_html=None):
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

    if featured_container_id and featured_cards_html:
        featured_container = soup.find(id=featured_container_id)

        if featured_container:
            featured_container.clear()
            featured_cards = BeautifulSoup(featured_cards_html, 'html.parser')
            for card in featured_cards.children:
                if card.name:
                    featured_container.append(card)
        else:
            featured_section_html = f'''
            <div class="content-section" id="featured-section">
             <div class="container">
              <h2 class="section-title">
               <i class="bi bi-star-fill text-warning"></i>
               Featured
              </h2>
              <p class="text-muted mb-4">Most popular and active projects</p>
              <div class="repo-grid" id="{featured_container_id}">
               {featured_cards_html}
              </div>
              <hr class="my-5">
             </div>
            </div>
            '''

            main_section = soup.find(id=container_id).find_parent('div', class_='content-section')
            if main_section:
                featured_soup = BeautifulSoup(featured_section_html, 'html.parser')
                main_section.insert_before(featured_soup)

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

        top_repos = get_top_repos(repos, n=6)
        top_repos_names = [r['name'] for r in top_repos]

        print(f"📊 Top repositories: {', '.join([r['name'] for r in top_repos])}")

        all_repos_cards = []
        for repo in repos:
            is_top = repo['name'] in top_repos_names
            repo_card = generate_repo_cards([repo], is_featured=is_top)
            all_repos_cards.append(repo_card)

        top_cards = generate_repo_cards(top_repos, is_featured=True)

        update_html_with_id(
            'projects.html',
            'repos-container',
            '\n'.join(all_repos_cards),
            'featured-repos-container',
            top_cards
        )

    if articles:
        articles.sort(key=lambda x: x.get('published_at', ''), reverse=True)

        top_articles = get_top_articles(articles, n=6)
        top_article_ids = [a['id'] for a in top_articles]

        print(f"📊 Top articles: {', '.join([a['title'][:30] + '...' for a in top_articles])}")

        all_articles_cards = []
        for article in articles:
            is_top = article['id'] in top_article_ids
            article_card = generate_article_cards([article], is_featured=is_top)
            all_articles_cards.append(article_card)

        top_cards = generate_article_cards(top_articles, is_featured=True)

        update_html_with_id(
            'articles.html',
            'articles-container',
            '\n'.join(all_articles_cards),
            'featured-articles-container',
            top_cards
        )

    if packages:
        packages = [p for p in packages if not p.get('error')]

        top_packages = get_top_packages(packages, n=6)
        top_package_names = [p['name'] for p in top_packages]

        print(f"📊 Top packages: {', '.join([p['name'] for p in top_packages])}")

        all_packages_cards = []
        for package in packages:
            is_top = package['name'] in top_package_names
            package_card = generate_package_cards([package], is_featured=is_top)
            all_packages_cards.append(package_card)

        top_cards = generate_package_cards(top_packages, is_featured=True)

        update_html_with_id(
            'packages.html',
            'packages-container',
            '\n'.join(all_packages_cards),
            'featured-packages-container',
            top_cards
        )

    print('✅ Done!')


if __name__ == '__main__':
    main()
