# 🌐 Alexander Suvorov - Technical Portfolio

**Technical Portfolio**: [smartlegionlab.ru](https://smartlegionlab.ru)

**Academic Portfolio**: [alexander-suvorov.ru](https://alexander-suvorov.ru)  

## 🎯 About the Project

Modern, responsive technical portfolio showcasing Alexander Suvorov's expertise in Python development, system architecture, and open-source contributions. The site combines professional presentation with automated data updates via GitHub Actions.

## ✨ Key Features

### 🎨 Design & Interface
- **Dark theme** with gradient backgrounds and accent colors
- **Fully responsive design** for all devices
- **Animated elements** and smooth transitions
- **Interactive navigation** with scroll progress bar
- **Professional typography** and visual hierarchy

### 💻 Technical Implementation
- **Static site** hosted on GitHub Pages (zero cost)
- **GitHub Actions** for automated data collection (daily updates)
- **Local JSON files** for all dynamic content
- **No server-side code** - pure HTML/CSS/JavaScript

### 📊 Data Sources & Automation
- **GitHub repositories**: Auto-fetched daily via GitHub Actions
- **Dev.to articles**: Auto-fetched daily via GitHub Actions
- **PyPI packages**: Auto-fetched daily via GitHub Actions
- **All data stored** in `/data/*.json` files
- **Zero client-side API calls** - everything from local files

### 📦 Content Display
- **25+ PyPI packages** with installation commands
- **50+ GitHub repositories** with real-time statistics
- **Technical articles** from Dev.to
- **Research publications** with DOI links

## 🛠 Technology Stack

**Frontend:**
- HTML5 with semantic markup
- CSS3 with custom properties
- Bootstrap 5 + Bootstrap Icons
- Vanilla JavaScript (ES6+)

**Automation:**
- GitHub Actions (Python scripts)
- Daily scheduled updates
- Automatic commits to repository

**Data Format:**
- JSON files in `/data/` directory
- No external API calls from client
- Fast loading from same domain

## 🎯 Main Sections

1. **Hero Section** - Professional introduction with key metrics
2. **Professional Profile** - Expertise and career overview
3. **Research & Paradigms** - Published academic work
4. **Projects & Contributions** - GitHub, PyPI, and Dev.to content
5. **Areas of Expertise** - Detailed skills and competencies
6. **Core Skills** - Technical stack and capabilities
7. **Contacts** - Professional network and communication channels

## 🔧 Architectural Features

- **Modular JavaScript architecture** with specialized managers
- **Skeleton loaders** for smooth content loading
- **Intersection Observer** for lazy animations
- **Mobile-first responsive design**
- **Graceful error handling** with user-friendly messages

## 🎨 Unique Elements

- **Animated avatar** with morphing effects
- **Scroll progress bar** for navigation
- **Interactive cards** with hover animations
- **Tab-based organization** for different platforms
- **Animated statistics counters**
- **Particle background** (desktop only)

## 📱 Optimizations

- **Mobile-first responsive design**
- **No external API calls** from browser
- **Local JSON files** for all content
- **Optimized SVG icons**
- **Lazy loading animations**
- **Smooth transitions**

## 🤖 How It Works

1. **GitHub Actions** runs daily (or on demand)
2. **Python scripts** fetch data from:
   - GitHub API (repositories)
   - Dev.to API (articles)
   - PyPI API (packages)
3. **JSON files** are updated in `/data/` directory
4. **Site redeploys** automatically to GitHub Pages
5. **Visitors** get fast content from local files

## 📁 Repository Structure

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── config.js
│   ├── utils.js
│   ├── repository-manager.js
│   ├── article-manager.js
│   ├── pypi-manager.js
│   ├── scroll-manager.js
│   ├── animation-manager.js
│   ├── particle-background.js
│   └── stats-manager.js
├── data/
│   ├── repos.json (auto-generated)
│   ├── articles.json (auto-generated)
│   └── pypi.json (auto-generated)
└── .github/workflows/
    └── update-data.yml
```

## 🚀 Local Development

1. Clone the repository
2. Start a local server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000`

## 🔄 Manual Data Update

To force update all data:
1. Go to GitHub repository → Actions tab
2. Select "Update Data" workflow
3. Click "Run workflow"

## 📊 Live Data

- **GitHub**: 50+ public repositories
- **Dev.to**: Technical articles
- **PyPI**: 25+ published Python packages

---

![Technical Portfolio](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/technical_portfolio.png)