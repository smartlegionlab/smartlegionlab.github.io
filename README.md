# Alexander Suvorov - Automated Technical Portfolio <sup>v5.0.4</sup>

[![Live Site](https://img.shields.io/badge/Live%20Site-smartlegionlab.ru-blue?style=for-the-badge&logo=github)](https://smartlegionlab.ru)
[![GitHub license](https://img.shields.io/github/license/smartlegionlab/smartlegionlab.github.io)](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/smartlegionlab/smartlegionlab.github.io)](https://github.com/smartlegionlab/smartlegionlab.github.io/)
[![GitHub stars](https://img.shields.io/github/stars/smartlegionlab/smartlegionlab.github.io?style=social)](https://github.com/smartlegionlab/smartlegionlab.github.io/stargazers)
[![GitHub Actions](https://img.shields.io/badge/CI/CD-GitHub%20Actions-blue?logo=github-actions)](https://github.com/features/actions)
[![Python](https://img.shields.io/badge/Python-3.8+-green?logo=python)](https://python.org)
[![Static Site](https://img.shields.io/badge/Hosting-GitHub%20Pages-orange?logo=github)](https://pages.github.com)

**Modern, self-updating technical portfolio** showcasing expertise in **Python development**, **system architecture**, and **open-source contributions**. This isn't just a static site—it's a fully automated ecosystem that fetches live data and builds itself daily.

![Portfolio Preview](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/technical_portfolio.png)

---

## ⚠️ Disclaimer

**By using this software, you agree to the full disclaimer terms.**

**Summary:** Software provided "AS IS" without warranty. You assume all risks.

**Full legal disclaimer:** See [DISCLAIMER.md](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/DISCLAIMER.md)

---

## Zero-Cost Automated Static Site Generator

**Serverless Static Site Generator with CI/CD**:

[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-blue?logo=github-actions)](https://github.com/features/actions)
[![Python](https://img.shields.io/badge/Python-3.8+-green?logo=python)](https://python.org)
[![GitHub Pages](https://img.shields.io/badge/Hosting-GitHub%20Pages-orange?logo=github)](https://pages.github.com)

### How It Works

This site is **fully automated** — it builds and updates itself daily without any manual intervention or hosting costs!

### Key Features

| Feature               | How It Works                                              | Benefit                                                       |
|-----------------------|-----------------------------------------------------------|---------------------------------------------------------------|
| **Fully Automated**   | GitHub Actions cron job runs daily                        | Always up-to-date, zero manual work                           |
| **Dynamic Content**   | Fetches live data from GitHub, PyPI, Dev.to & Zenodo APIs | Shows real repository, package, article and publication stats |
| **Atomic Deployment** | Generates all pages in temp directory first               | Never broken site — all or nothing                            |
| **Auto Sitemap**      | Dynamically includes all pages                            | Perfect SEO, always current                                   |
| **Zero Cost**         | Hosted on GitHub Pages                                    | Only pay for domain name                                      |
| **Secure**            | No database, no backend                                   | Static = unhackable                                           |

### By The Numbers

```
Repository Pages: 65+ (and growing)
Package Pages:    25+ PyPI packages
Ecosystem Pages:  7 dedicated ecosystem pages
Research Pages:   4 paradigm publications + tech report
Static Pages:     11 core pages
Updates:          Daily automatic
Hosting Cost:     $0 (only domain)
```

### Tech Stack

```python
# The magic happens here ↓
[
    "Python 3.8+",
    "GitHub Actions (CI/CD)",
    "Jinja2 Templating",
    "GitHub API v3/v4",
    "PyPI JSON API",
    "Dev.to API",
    "Zenodo API",
    "Markdown parsing",
    "XML Sitemap generation",
    "Atomic file operations"
]
```

### What It Does

1. **Every day at midnight UTC**, GitHub Actions wakes up
2. Fetches **live data** from GitHub, PyPI, Dev.to and Zenodo APIs
3. Generates **60+ HTML pages** in a temporary directory
4. Creates **fresh sitemap.xml** with all URLs
5. If **ALL pages** generate successfully — replaces old site atomically
6. If ANY error occurs — keeps old site untouched
7. Deploys to **GitHub Pages** automatically

### Why This Matters

> **"Build once, deploy manually" is so 2010.  
> "Build automatically, host for free" is 2026.**

This architecture demonstrates that you can run a **professional, dynamic-looking website** with zero infrastructure costs, zero maintenance, and zero security headaches — just smart automation and free tier services.

---

<p>
<b>Zero Cost • Zero Maintenance • Maximum Automation</b>
</p>

---

## Technology Stack: Under the Hood

### Frontend: The User Experience
| Technology                    | Purpose                                                                      |
|-------------------------------|------------------------------------------------------------------------------|
| **HTML5**                     | Semantic, accessible markup                                                  |
| **CSS3**                      | Custom properties, keyframe animations, responsive design                    |
| **Bootstrap 5**               | Robust grid system and pre-built components                                  |
| **Bootstrap Icons**           | Consistent, lightweight icon set                                             |
| **Vanilla JavaScript (ES6+)** | No bloat. Modular classes for particles, scroll, animations, and active nav. |

### Build System & Automation: The Engine
| Tool/Library                              | Purpose                                                                                    |
|-------------------------------------------|--------------------------------------------------------------------------------------------|
| **GitHub Actions**                        | The cron job that runs the entire show daily.                                              |
| **Python 3.8+**                           | Core language for all build scripts.                                                       |
| **Jinja2**                                | Powerful templating engine to generate 70+ detail pages from a single template.            |
| **BeautifulSoup4**                        | Parses and surgically updates the main HTML files (`projects.html`, etc.) with fresh data. |
| **Requests**                              | Fetches data from GitHub, PyPI, Dev.to, and Zenodo APIs.                                   |
| **Markdown**                              | Converts PyPI package descriptions from markdown to beautiful HTML for detail pages.       |
| **Pygments**                              | Provides syntax highlighting for code blocks in those markdown descriptions.               |
| **Temporary Directory + `shutil.move()`** | Implements the **atomic deployment** strategy.                                             |

### Data Sources
| Source     | API Endpoint                                  | Data Fetched                                                      |
|------------|-----------------------------------------------|-------------------------------------------------------------------|
| **GitHub** | `api.github.com/users/smartlegionlab/repos`   | Repo names, descriptions, stars, forks, languages, topics, dates. |
| **PyPI**   | `pypi.org/pypi/{package_name}/json`           | Version, summary, full description (in markdown), project URLs.   |
| **Dev.to** | `dev.to/api/articles?username=smartlegionlab` | Titles, descriptions, tags, reactions, comments, reading time.    |
| **Zenodo** | `zenodo.org/api/records/{record_id}`          | Views and downloads statistics for research publications.         |

---

## Project Structure: A Deep Dive

```
/
├── .github/workflows/
│   └── update_data.yml        # The daily cron job configuration
│
├── scripts/                    # The brains of the operation
│   ├── fetch_github.py         # Fetches repo data, handles errors
│   ├── fetch_devto.py          # Fetches article data
│   ├── fetch_pypi.py           # Fetches package data with rate limiting
│   ├── fetch_zenodo.py         # Fetches publication statistics
│   ├── generate_pages.py       # Updates main pages (projects.html, etc.) with cards
│   └── generate_repo_pages.py  # Generates detail pages + sitemap atomically
│
├── templates/                   # Templates for the detail pages
│   ├── repo_template.html       # Jinja2 template for GitHub repo pages
│   └── package_template.html    # Jinja2 template for PyPI package pages
│
├── data/                        # Auto-generated JSON data (cached from APIs)
│   ├── repos.json
│   ├── articles.json
│   ├── pypi.json
│   └── zenodo.json
│
├── ecosystem/                   # Dedicated ecosystem pages
│   ├── smartpasslib-ecosystem.html
│   ├── babylon-ecosystem.html
│   ├── repo-manager-ecosystem.html
│   ├── 2fa-ecosystem.html
│   ├── tsp-ecosystem.html
│   └── research-ecosystem.html
│
├── js/                          # Modular front-end logic
│   ├── active-nav.js             # Highlights current page in navigation
│   ├── animation-manager.js      # Controls priority-based animations
│   ├── particle-background.js    # Canvas-based animated tech word background
│   ├── scroll-manager.js         # Handles scroll-to-top button and progress bar
│   ├── stats-manager.js          # Updates Zenodo statistics dynamically
│   └── config.js                 # Global config (usernames, counters)
│
├── css/                          # Styles
│   ├── style.css                 # All custom styles (dark theme, cards, animations)
│   └── bootstrap/                # Full Bootstrap framework
│
├── repositories/                  # OUTPUT: Dynamically generated GitHub repo pages
│   ├── smartpasslib.html
│   ├── clipassman.html
│   └── ... (65+ files)
│
├── packages/                      # OUTPUT: Dynamically generated PyPI package pages
│   ├── smartpasslib.html
│   └── ... (23+ files)
│
├── research/                      # Research pages
│   ├── pointer-based-security.html
│   ├── local-data-regeneration.html
│   ├── deterministic-game-engine.html
│   └── position-candidate-hypothesis.html
│
├── index.html                     # Home page
├── about.html                     # Professional profile
├── ecosystems.html                # Main ecosystems listing
├── projects.html                  # GitHub repo listing (auto-updated)
├── packages.html                  # PyPI package listing (auto-updated)
├── articles.html                  # Dev.to article listing (auto-updated)
├── research.html                  # Academic research overview
├── skills.html                    # Technical skills
└── sitemap.xml                    # AUTO-GENERATED sitemap for all 80+ pages
```

---

## The Main Sections: What You'll See

- **Hero Section**: Professional introduction with key metrics (Experience, Projects, Repos).
- **Professional Profile**: Technical leadership, business impact, and published research.
- **Research & Paradigms**: Cards linking to detailed pages for concepts (Pointer-Based Security, PCH, etc.).
- **Ecosystems**: Dedicated pages for each cross-platform ecosystem (SmartPassLib, TSP, 2FA, Repo Manager, Babylon Libraries, Research Ecosystem).
- **Automated Project Showcase**:
    - **Projects (`projects.html`)**: A grid of GitHub repos with live stats (stars, forks), topics, and a "View" button.
    - **Packages (`packages.html`)**: A grid of PyPI packages with descriptions, version badges, and a `pip install` copy button.
    - **Articles (`articles.html`)**: A grid of Dev.to articles with engagement metrics.
- **Detailed Project, Package and Research Pages**:
    - **Repository Pages**: Full-page deep dive into a single repo with all metadata.
    - **Package Pages**: Full-page view of a PyPI package with rendered README.
    - **Research Pages**: Full-page view of each research paradigm with PDF viewer and stats.

---

## Local Development & Manual Build

You can run the entire build process locally to test changes.

### Prerequisites
- Python 3.8+
- Git

### Setup & Build
1.  **Clone the repository**
    ```bash
    git clone https://github.com/smartlegionlab/smartlegionlab.github.io.git
    cd smartlegionlab.github.io
    ```

2.  **Install Python dependencies**
    ```bash
    pip install requests beautifulsoup4 jinja2 markdown pygments
    ```

3.  **Run the full build pipeline (in the correct order)**
    ```bash
    # 1. Fetch the latest data from all sources
    python scripts/fetch_github.py
    python scripts/fetch_devto.py
    python scripts/fetch_pypi.py
    python scripts/fetch_zenodo.py

    # 2. Update the main listing pages with new data cards
    python scripts/generate_pages.py

    # 3. Generate all detail pages AND the sitemap atomically
    python scripts/generate_repo_pages.py
    ```

4.  **Preview the site locally**
    ```bash
    python -m http.server 8000
    ```
    Open your browser to `http://localhost:8000`.

---

## License

This project is licensed under the **BSD 3-Clause License**. See the [LICENSE](LICENSE) file for details.

---

## 📬 Connect with Alexander Suvorov

- **🌐 Portfolio:** [smartlegionlab.ru](https://smartlegionlab.ru)
- **🔬 Academic Portfolio:** [alexander-suvorov.ru](https://alexander-suvorov.ru)
- **💻 GitHub:** [@smartlegionlab](https://github.com/smartlegionlab)
- **📝 Dev.to Blog:** [@smartlegionlab](https://dev.to/smartlegionlab)
- **📦 PyPI Packages:** [@smartlegionlab](https://pypi.org/user/smartlegionlab)
- **📚 ORCID:** [0009-0006-3427-9611](https://orcid.org/0009-0006-3427-9611)
- **🏛️ Zenodo:** [Research Profile](https://zenodo.org/records/17204738)

---

<div align="center">
  <sub>Built with ❤️ by Alexander Suvorov</sub>
  <br>
  <sub>© 2026 Alexander Suvorov. All rights reserved.</sub>
</div>

