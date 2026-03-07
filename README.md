# 🌐 Alexander Suvorov - Technical Portfolio <sup>v3.2.1</sup>

[![Live Site](https://img.shields.io/badge/Live%20Site-smartlegionlab.ru-blue?style=for-the-badge&logo=github)](https://smartlegionlab.ru)
[![Academic Portfolio](https://img.shields.io/badge/Academic-alexander--suvorov.ru-purple?style=for-the-badge&logo=google-scholar)](https://alexander-suvorov.ru)
[![GitHub license](https://img.shields.io/github/license/smartlegionlab/smartlegionlab.github.io)](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/smartlegionlab/smartlegionlab.github.io)](https://github.com/smartlegionlab/smartlegionlab.github.io/)
[![GitHub stars](https://img.shields.io/github/stars/smartlegionlab/smartlegionlab.github.io?style=social)](https://github.com/smartlegionlab/smartlegionlab.github.io/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/smartlegionlab/smartlegionlab.github.io?style=social)](https://github.com/smartlegionlab/smartlegionlab.github.io/network/members)

Modern, responsive technical portfolio showcasing expertise in **Python development**, **system architecture**, and **open-source contributions**. The site combines professional presentation with automated data updates via GitHub Actions.

![Portfolio Preview](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/technical_portfolio.png)

---

## 📋 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠 Technology Stack](#-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🎯 Main Sections](#-main-sections)
- [🤖 Automation Pipeline](#-automation-pipeline)
- [📊 Data Sources](#-data-sources)
- [🚀 Local Development](#-local-development)
- [🔧 Manual Data Update](#-manual-data-update)
- [📱 Performance Optimizations](#-performance-optimizations)
- [📄 License](#-license)
- [🤝 Contributing](#-contributing)
- [📬 Contact](#-contact)

---

## ✨ Key Features

### 🎨 Design & Interface
- **Dark theme** with gradient backgrounds and accent colors
- **Fully responsive design** for all devices
- **Animated elements** and smooth transitions
- **Interactive navigation** with scroll progress bar
- **Particle background** with rotating tech keywords (desktop only)
- **Professional typography** and visual hierarchy

### 💻 Technical Implementation
- **Static site** hosted on GitHub Pages (zero cost)
- **GitHub Actions** for automated data collection (daily updates)
- **Local JSON files** for all dynamic content
- **No server-side code** - pure HTML/CSS/JavaScript
- **Modular JavaScript architecture** with specialized managers

### 📦 Content Display
- **25+ PyPI packages** with one-click installation commands
- **50+ GitHub repositories** with real-time statistics
- **Technical articles** from Dev.to with engagement metrics
- **Research publications** with DOI links and Zenodo integration

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic markup |
| CSS3 | Custom properties, animations |
| Bootstrap 5 | Responsive grid, components |
| Bootstrap Icons | Icon library |
| Vanilla JavaScript (ES6+) | Core functionality |

### Automation
| Tool | Purpose |
|------|---------|
| GitHub Actions | Scheduled data updates |
| Python 3.x | Data fetching scripts |
| BeautifulSoup4 | HTML parsing for updates |
| Requests | API communication |

### Data Format
- **JSON** files stored in `/data/` directory
- **Zero external API calls** from client-side
- **Fast loading** from same domain

---

## 📁 Project Structure

```
/
├── index.html                 # Home page
├── about.html                 # Professional profile
├── skills.html                # Technical competencies
├── projects.html              # GitHub repositories
├── research.html              # Academic research
├── packages.html              # PyPI packages
├── articles.html              # Dev.to articles
├── sitemap.xml                # SEO sitemap
│
├── css/
│   ├── style.css              # Main stylesheet
│   └── bootstrap/             # Bootstrap framework
│
├── js/
│   ├── main.js                # Application entry point
│   ├── config.js              # Global configuration
│   ├── utils.js               # Utility functions
│   ├── active-nav.js          # Navigation highlighting
│   ├── scroll-manager.js      # Scroll progress, to-top button
│   ├── animation-manager.js   # Priority-based animations
│   ├── particle-background.js # Canvas particle system
│   ├── stats-manager.js       # Statistics counters
│   ├── repository-manager.js  # GitHub repo handling
│   ├── article-manager.js     # Dev.to article handling
│   └── pypi-manager.js        # PyPI package handling
│
├── data/
│   ├── repos.json             # Auto-generated GitHub data
│   ├── articles.json          # Auto-generated Dev.to data
│   └── pypi.json              # Auto-generated PyPI data
│
└── .github/workflows/
    └── update_data.yml        # Daily automation workflow
```

---

## 🎯 Main Sections

### 1. **Hero Section**
Professional introduction with key metrics:
- 10+ years experience
- 350+ projects delivered
- 50+ open source repositories
- 20+ PyPI packages
- 7K+ commits

### 2. **Professional Profile**
- Technical leadership experience
- Business impact metrics
- Published research overview

### 3. **Research & Paradigms**
- **Pointer-Based Security**: Architectural shift from data protection to data non-existence
- **Local Data Regeneration**: Ontological shift from data transmission to synchronous state discovery
- **Deterministic Game Engine**: Practical implementation of security paradigms
- **Position-Candidate-Hypothesis**: New research direction for NP-complete problems

### 4. **Projects & Contributions**
- **GitHub**: 50+ public repositories with star/fork counts
- **PyPI**: 25+ Python packages with installation commands
- **Dev.to**: Technical articles with engagement metrics

### 5. **Areas of Expertise**
- Practical Development (Web apps, Desktop/CLI, Algorithms)
- System Architecture (Scalable design, Security, Performance)
- Research & Innovation (Academic papers, Paradigms)

### 6. **Core Skills**
- Backend: Python, Django, DRF, Flask, FastAPI, Celery
- Databases: PostgreSQL, Redis, MySQL/MariaDB
- Infrastructure: Docker, Linux, Git
- Development: JavaScript, HTML/CSS, Bootstrap, Algorithms

### 7. **Contact**
- Email
- GitHub
- Academic Portfolio
- Dev.to
- PyPI

---

## 🤖 Automation Pipeline

### GitHub Actions Workflow (`.github/workflows/update_data.yml`)

```yaml
name: Update Data

on:
  schedule:
    - cron: '0 3 * * *'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install requests beautifulsoup4

      - name: Fetch GitHub repos
        run: python scripts/fetch_github.py
        continue-on-error: true

      - name: Fetch Dev.to articles
        run: python scripts/fetch_devto.py
        continue-on-error: true

      - name: Fetch PyPI packages
        run: python scripts/fetch_pypi.py
        continue-on-error: true

      - name: Generate HTML pages
        run: python scripts/generate_pages.py

      - name: Commit and push changes
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'
          git add data/ projects.html articles.html packages.html
          git diff --quiet && git diff --staged --quiet || git commit -m "Update data and pages $(date +'%Y-%m-%d')"
          git push
```

### Python Scripts

| Script              | Purpose | API Source |
|---------------------|---------|------------|
| `fetch_github.py`   | Fetch repository data | GitHub API |
| `fetch_devto.py`    | Fetch article data | Dev.to API |
| `fetch_pypi.py`     | Fetch package metadata | PyPI JSON API |
| `generate_pages.py` | Update HTML with fetched data | BeautifulSoup4 |

---

## 📊 Data Sources

### GitHub Repositories
- **Endpoint**: `https://api.github.com/users/smartlegionlab/repos`
- **Data**: Repository names, descriptions, stars, forks, languages, topics
- **Filtering**: Archived repositories excluded

### Dev.to Articles
- **Endpoint**: `https://dev.to/api/articles?username=smartlegionlab`
- **Data**: Titles, descriptions, tags, reactions, comments, reading time
- **Sorting**: By publication date (newest first)

### PyPI Packages
- **Endpoint**: `https://pypi.org/pypi/{package_name}/json`
- **Packages**: 23 pre-configured Python packages
- **Data**: Versions, summaries, project URLs
- **Rate limiting**: 0.5s delay between requests

---

## 🚀 Local Development

### Prerequisites
- Python 3.x
- Basic HTTP server (optional)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/smartlegionlab/smartlegionlab.github.io.git
   cd smartlegionlab.github.io
   ```

2. **Install Python dependencies** (for data fetching)
   ```bash
   pip install -r scripts/requirements.txt
   ```

3. **Start a local server**
   ```bash
   python -m http.server 8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

---

## 🔧 Manual Data Update

```bash
# Fetch all data
python scripts/fetch_github.py
python scripts/fetch_devto.py
python scripts/fetch_pypi.py

# Update HTML files
python scripts/generate_pages.py
```

---

## 📄 License

[**BSD 3-Clause License**](LICENSE)

---

## 📬 Contact

**Alexander Suvorov**
- 🌐 Website: [smartlegionlab.ru](https://smartlegionlab.ru)
- 🎓 Academic: [alexander-suvorov.ru](https://alexander-suvorov.ru)
- 💻 GitHub: [@smartlegionlab](https://github.com/smartlegionlab)
- 📝 Dev.to: [@smartlegionlab](https://dev.to/smartlegionlab)
- 📦 PyPI: [@smartlegionlab](https://pypi.org/user/smartlegionlab)

---

<div align="center">
  <sub>Built with ❤️ by Alexander Suvorov</sub>
  <br>
  <sub>© 2026 Alexander Suvorov. All rights reserved.</sub>
</div>