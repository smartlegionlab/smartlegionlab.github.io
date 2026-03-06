import json
import re
from datetime import datetime


def format_date(date_string):
    if not date_string:
        return ''
    try:
        d = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return d.strftime('%b %d, %Y')
    except:
        return date_string[:10]


def generate_article_cards(articles, limit=100):
    cards = []
    
    for article in articles[:limit]:
        published_date = format_date(article.get('published_at'))
        read_time = article.get('reading_time_minutes', '')
        read_time_html = f'{read_time} min read' if read_time else ''
        
        is_popular = article.get('positive_reactions_count', 0) > 10
        has_discussion = article.get('comments_count', 0) > 5
        author_name = article.get('user', {}).get('name', 'Alexander Suvorov')
        
        card = f'''
        <div class="repo-card">
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
                    {f'''
                    <span class="repo-stat text-warning" title="Reactions">
                        <i class="bi bi-emoji-smile"></i> {article.get('public_reactions_count', 0)}
                    </span>
                    ''' if article.get('public_reactions_count', 0) > 0 else ''}
                </div>
            </div>

            <p class="repo-description">{article.get('description', 'No description provided')}</p>

            {f'''
            <div class="repo-topics">
                {''.join([f'<span class="repo-topic" title="{tag}">{tag}</span>' for tag in article.get('tag_list', [])[:5]])}
                {f'<span class="repo-topic">+{len(article["tag_list"]) - 5} more</span>' if len(article.get('tag_list', [])) > 5 else ''}
            </div>
            ''' if article.get('tag_list') else ''}

            <div class="repo-meta">
                <div class="repo-meta-item">
                    <i class="bi bi-calendar"></i> Published: {published_date}
                </div>
                {f'''
                <div class="repo-meta-item">
                    <i class="bi bi-clock"></i> {read_time_html}
                </div>
                ''' if read_time_html else ''}
                {f'''
                <div class="repo-meta-item">
                    <i class="bi bi-eye"></i> {article.get('page_views_count', 0)} views
                </div>
                ''' if article.get('page_views_count', 0) > 0 else ''}
            </div>

            <div class="repo-footer">
                <div class="repo-updated">
                    <i class="bi bi-tags"></i> {len(article.get('tag_list', []))} tags
                </div>
                <a href="{article['url']}" target="_blank" class="repo-action" title="Read full article">
                    <i class="bi bi-box-arrow-up-right"></i> Read Article
                </a>
            </div>
        </div>
        '''
        cards.append(card)
    
    return '\n'.join(cards)


def generate_repo_cards(repos, limit=100):
    cards = []
    
    language_colors = {
        'Python': '#3572A5',
        'JavaScript': '#f1e05a',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'TypeScript': '#2b7489',
        'Shell': '#89e051',
        'Dockerfile': '#384d54',
        'Jupyter Notebook': '#DA5B0B',
        'PHP': '#4F5D95',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C#': '#178600',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584'
    }
    
    for repo in repos[:limit]:
        if repo.get('archived'):
            continue
            
        lang_color = language_colors.get(repo.get('language'), '#8b949e')
        
        created_date = format_date(repo.get('created_at'))
        updated_date = format_date(repo.get('updated_at'))
        pushed_date = format_date(repo.get('pushed_at'))
        
        card = f'''
        <div class="repo-card">
            <div class="repo-badges">
                {f'<span class="repo-badge bg-secondary">Fork</span>' if repo.get('fork') else ''}
                {f'<span class="repo-badge bg-danger">Archived</span>' if repo.get('archived') else ''}
                {f'<span class="repo-badge bg-warning">Private</span>' if repo.get('private') else ''}
            </div>

            <div class="repo-header">
                <div class="repo-title-section">
                    <a href="{repo['html_url']}" target="_blank" class="repo-title">
                        {repo['name']}
                    </a>
                    <div class="repo-owner">
                        <i class="bi bi-person"></i> {repo.get('owner', {}).get('login', 'smartlegionlab')}
                    </div>
                </div>
                <div class="repo-stats">
                    <span class="repo-stat text-warning" title="Stars">
                        <i class="bi bi-star"></i> {repo.get('stargazers_count', 0)}
                    </span>
                    <span class="repo-stat text-info" title="Forks">
                        <i class="bi bi-diagram-2"></i> {repo.get('forks_count', 0)}
                    </span>
                    {f'''
                    <span class="repo-stat text-primary" title="Watchers">
                        <i class="bi bi-eye"></i> {repo.get('watchers_count', 0)}
                    </span>
                    ''' if repo.get('watchers_count', 0) > 0 else ''}
                </div>
            </div>

            <p class="repo-description">{repo.get('description', 'No description provided')}</p>

            {f'''
            <div class="repo-topics">
                {''.join([f'<span class="repo-topic">{topic}</span>' for topic in repo.get('topics', [])])}
            </div>
            ''' if repo.get('topics') else ''}

            <div class="repo-meta">
                {f'''
                <div class="repo-meta-item">
                    <div class="repo-language">
                        <span class="language-dot" style="background-color: {lang_color}"></span>
                        {repo['language']}
                    </div>
                </div>
                ''' if repo.get('language') else ''}
                <div class="repo-meta-item">
                    <i class="bi bi-calendar"></i> Created: {created_date}
                </div>
                <div class="repo-meta-item">
                    <i class="bi bi-arrow-clockwise"></i> Updated: {updated_date}
                </div>
                {f'''
                <div class="repo-meta-item">
                    <i class="bi bi-hdd"></i> {round(repo.get('size', 0) / 1024 * 10) / 10} MB
                </div>
                ''' if repo.get('size') else ''}
            </div>

            <div class="repo-footer">
                <div class="repo-updated">
                    <i class="bi bi-clock"></i> Last updated {pushed_date}
                </div>
                <a href="{repo['html_url']}" target="_blank" class="repo-action">
                    <i class="bi bi-box-arrow-up-right"></i> View
                </a>
            </div>
        </div>
        '''
        cards.append(card)
    
    return '\n'.join(cards)


def generate_package_cards(packages, limit=100):
    cards = []
    
    for pkg in packages[:limit]:
        if pkg.get('error'):
            continue
            
        name = pkg['name']
        version = pkg.get('version', '?')
        summary = pkg.get('summary', pkg.get('description', 'No description available'))
        url = pkg.get('project_url', f'https://pypi.org/project/{name}/')
        
        card = f'''
        <div class="repo-card">
            <div class="repo-header">
                <div class="repo-title-section" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <a href="{url}" target="_blank" class="repo-title">
                        {name}
                    </a>
                    <span class="repo-badge" style="background: rgba(13, 110, 253, 0.1); border: 1px solid var(--accent); color: var(--accent);">v{version}</span>
                </div>
            </div>

            <p class="repo-description">{summary}</p>

            <div class="citation-tabs-container mt-3">
                <div class="citation-format text-center" style="position: relative;">
                    <p class="citation-text">pip install {name}</p>
                </div>
            </div>

            <div class="repo-footer" style="display: flex; justify-content: flex-end; width: 100%;">
                <a href="{url}" target="_blank" class="repo-action" title="View on PyPI">
                    <i class="bi bi-box-arrow-up-right"></i> View on PyPI
                </a>
            </div>
        </div>
        '''
        cards.append(card)
    
    return '\n'.join(cards)


def update_page_content(file_path, start_marker, end_marker, new_content):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = f'({start_marker}.*?{end_marker})'
    replacement = f'{start_marker}\n                        {new_content}\n                    {end_marker}'
    
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    with open('data/repos.json', 'r', encoding='utf-8') as f:
        repos = json.load(f)
    
    with open('data/articles.json', 'r', encoding='utf-8') as f:
        articles = json.load(f)
    
    with open('data/pypi.json', 'r', encoding='utf-8') as f:
        packages = json.load(f)
    
    repos = [r for r in repos if not r.get('archived')]
    repos.sort(key=lambda x: x.get('pushed_at', ''), reverse=True)
    
    articles.sort(key=lambda x: x.get('published_at', ''), reverse=True)
    
    packages = [p for p in packages if not p.get('error')]
    
    repo_cards = generate_repo_cards(repos)
    article_cards = generate_article_cards(articles)
    package_cards = generate_package_cards(packages)
    
    if update_page_content('projects.html', '<!-- REPO_CARDS_START -->', '<!-- REPO_CARDS_END -->', repo_cards):
        print("✅ Updated projects.html")
    
    if update_page_content('articles.html', '<!-- ARTICLE_CARDS_START -->', '<!-- ARTICLE_CARDS_END -->', article_cards):
        print("✅ Updated articles.html")
    
    if update_page_content('packages.html', '<!-- PACKAGE_CARDS_START -->', '<!-- PACKAGE_CARDS_END -->', package_cards):
        print("✅ Updated packages.html")
    
    print("✨ All pages have been updated!")


if __name__ == '__main__':
    main()
