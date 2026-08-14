# Smart Legion Lab · Automated Technical Portfolio <sup>v7.3.1</sup>

[![Live Site](https://img.shields.io/badge/Live%20Site-smartlegionlab.ru-blue?style=for-the-badge&logo=github)](https://smartlegionlab.ru)
[![GitHub license](https://img.shields.io/github/license/smartlegionlab/smartlegionlab.github.io)](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8+-green?logo=python)](https://python.org)
[![Static Site](https://img.shields.io/badge/Hosting-GitHub%20Pages-orange?logo=github)](https://pages.github.com)
[![CI/CD](https://img.shields.io/badge/CI/CD-GitHub%20Actions-blue?logo=github-actions)](https://github.com/features/actions)

**Modern, self-updating technical portfolio** showcasing the work of Alexander Suvorov and Smart Legion Lab in **software architecture**, **open-source development**, and **theoretical computer science research**. This isn't just a static site—it's a fully automated ecosystem that fetches live data and builds itself daily.

![Main Page](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/logo.png)

---

## ⚠️ Disclaimer

**By using this software, you agree to the full disclaimer terms.**

**Summary:** Software provided "AS IS" without warranty. You assume all risks.

**Full legal disclaimer:** See [DISCLAIMER.md](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/DISCLAIMER.md)

---

## ⚡ Project Overview

This portfolio is designed to be a central hub for all activities of Smart Legion Lab. It automatically aggregates and presents information from various sources (GitHub, PyPI, Dev.to, Zenodo), creating a unified and always up-to-date showcase.

### Key Features

*   **Fully Automated CI/CD**: The site rebuilds itself daily via GitHub Actions, fetching fresh data from APIs.
*   **Zero-Cost Hosting**: Hosted on GitHub Pages, requiring only a domain name.
*   **Dynamic Content**: All project stats, package versions, and research metrics are pulled live.
*   **Secure Architecture**: A static site with no database or backend is inherently more secure.
*   **Atomic Deployment**: The site only updates if *all* pages generate successfully, guaranteeing zero downtime.

---

## 🌐 Site Structure & Screenshots

The site is organized into several key sections, each serving a specific purpose.

### 1. Homepage
The central dashboard providing a quick overview of the lab's work and key metrics.

![Homepage Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/logo.png)

*   **Overview**: Introduction to Smart Legion Lab and its core activities.
*   **Key Metrics**: Quick access to the number of projects, libraries, publications, and more.

---

### 2. Research & Publications
A dedicated section for Alexander Suvorov's independent research in fundamental computer science.

![Research Page Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/research.png)

*   **Published Paradigms**: Showcases four foundational paradigms with DOI links, including:
    *   Pointer‑Based Security Paradigm
    *   Local Data Regeneration Paradigm
    *   Position-Candidate-Hypothesis Paradigm
    *   Deterministic Game Engine (Tech Report)
*   **Zenodo Integration**: Real-time view/download statistics from Zenodo for each publication.
*   **ORCID & Zenodo Links**: Direct access to academic profiles.

---

### 3. Ecosystems
This section highlights the cross‑platform ecosystems built by Smart Legion Lab.

![Ecosystems Page Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/ecosystems.png)

*   **Unified Logic, Many Platforms**: Each ecosystem (e.g., Smart Passwords, 2FA Management) is a suite of apps and libraries built for different platforms (Web, Desktop, Mobile, CLI) from a single idea.
*   **Ecosystem List**: Includes Smart Passwords, NP Problem, 2FA Management, Repository Management, Deterministic, Research, and ToDo Ecosystems.

---

### 4. Applications
A showcase of all desktop, web, mobile, CLI tools, and Telegram bots.

![Applications Page Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/applications.png)

*   **Search & Filter**: Quickly find an app by name, type, or author (e.g., `@smartlegionlab` or `@aixandrolab`).
*   **Application Cards**: Each card displays the app's type, version, description, and a direct link to its details page and GitHub repository.
*   **Interactive Badges**: Visual tags for `web`, `desktop`, `mobile`, `cli`, and `bot` for easy scanning.

---

### 5. Projects
A complete, filterable list of all public repositories.

![Projects Page Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/projects.png)

*   **Full Repository List**: Showcases all 90+ public projects.
*   **Advanced Filtering**: Filter by language (Python, Go, C#, etc.) or author (`@smartlegionlab`, `@aixandrolab`).
*   **Project Details**: Each card provides a description, key topics, and links to the project's detail page and GitHub repo.

---

### 6. Libraries
A detailed view of all PyPI packages and libraries developed by Smart Legion Lab.

![Libraries Page Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/libraries.png)

*   **PyPI Integration**: Displays real-time version badges and PyPI links for every library.
*   **Language Support**: Highlights libraries for Python, Go, JavaScript, Kotlin, and C#.
*   **Library Cards**: Each card shows the library's description, a "View" button, and direct links to GitHub and PyPI.

---

### 7. Articles
A curated list of articles and blog posts published on Dev.to and other platforms.

![Articles Page Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/articles.png)

*   **Article List**: Cards for each article, including metadata and a preview of the content.

---

### 8. About & Team
An overview of the team behind Smart Legion Lab.

![Team Page Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/team.png)

*   **Team Profiles**: Detailed profiles for Alexander Suvorov (Sr.) and Alexander Suvorov (Jr.).
*   **Contact Information**: Direct links to email, GitHub, and other professional networks.

---

## 🛸 Extra: Developer Console & 3D Site Map

Beyond the standard navigation, the site includes two unique interactive features that showcase the technical depth of the project.

---

### 🖥️ In-Browser Developer Console

A fully functional terminal built into the site, accessible via the **"Console"** button in the bottom-left corner of any page. It's a direct interface to the `smartpasslib` library and other site utilities.

![Developer Console Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/console.png)

**Console Features:**
*   **Password Generation**:
    *   `smartpass` — Generates a deterministic password from a secret phrase (identical algorithm to the core library).
    *   `randpass` — Generates a cryptographically secure random password.
*   **Utilities**:
    *   `calc` — Evaluate mathematical expressions directly in the console.
    *   `demo` — A visual demo showcasing the build process and project stats.
    *   `map` — Launches a rocket animation and redirects to the 3D Site Map.
    *   `clear` / `history` — Manage the terminal session.
*   **Mini-Game**: `dino` — A playable Chrome Dino-style game built in vanilla JS.
*   **Command History & Autocomplete**: Navigate previously used commands with the `↑` and `↓` arrow keys.

This is not just a gimmick; it's a practical demonstration of the `smartpasslib` JavaScript implementation and the site's modular architecture.

---

### 🌌 3D Interactive Site Map ("Universe")

An immersive 3D visualization of the entire website structure, accessible via the **"Site Map"** link in the footer or by typing `map` in the developer console. It renders the `sitemap.xml` as an explorable solar system.

![3D Site Map Screenshot](https://github.com/smartlegionlab/smartlegionlab.github.io/blob/master/data/images/universe.png)

**Universe Features:**
*   **Visual Hierarchy**:
    *   **The Sun** — The homepage (central node).
    *   **Planets** — The main sections of the site (Research, Projects, Applications, etc.).
    *   **Moons** — Individual pages within each section.
*   **Interactive Controls**:
    *   **Drag** to rotate the camera.
    *   **Scroll** to zoom in/out.
    *   **Click** a planet or moon to send your "ship" (the "You" avatar) to it.
    *   **Double-click** any object to open a modal with details and a direct link to that page.
*   **History Panel**: Tracks the journey of three "users" (You, SmartLegionLab, Aixandrolab) as they navigate the universe. Click any history entry to instantly travel to that page.
*   **Live Stats**: Displays the total number of sections and pages parsed from the `sitemap.xml`.

---

## ✨ Advanced Site Features

*   **Live Statistics**: Key metrics (e.g., article count, ecosystem count) are automatically updated via the `StatsManager` (`/js/stats-manager.js`).
*   **Scroll Progress**: A visual indicator (`ScrollManager`) shows your reading progress on any page.
*   **Particle Background**: A dynamic, tech-themed particle system (`ParticleBackground`) creates an immersive atmosphere.

---

## 🚀 Local Development

You can run the entire build process locally.

### Prerequisites
*   Python 3.8+
*   Git

### Setup & Build
1.  **Clone the repository**
    ```bash
    git clone https://github.com/smartlegionlab/smartlegionlab.github.io.git
    cd smartlegionlab.github.io
    ```

2.  **Install dependencies**
    ```bash
    pip install requests beautifulsoup4 jinja2 markdown pygments
    ```

3.  **Run the full build pipeline**
    ```bash
    # 1. Fetch live data from APIs
    python scripts/fetch_github.py
    python scripts/fetch_devto.py
    python scripts/fetch_pypi.py
    python scripts/fetch_zenodo.py

    # 2. Generate all static HTML files
    python scripts/generate_data.py
    ```

4.  **Preview the site**
    ```bash
    python -m http.server 8000
    ```
    Open your browser to `http://localhost:8000`.

---

## 📄 License

This project is licensed under the **BSD 3-Clause License**. See the [LICENSE](LICENSE) file for details.

---

## 📬 Connect

*   **🌐 Portfolio:** [smartlegionlab.ru](https://smartlegionlab.ru)
*   **💻 GitHub:** [@smartlegionlab](https://github.com/smartlegionlab)
*   **📝 Dev.to Blog:** [@smartlegionlab](https://dev.to/smartlegionlab)
*   **📦 PyPI Packages:** [@smartlegionlab](https://pypi.org/user/smartlegionlab)
*   **📚 ORCID:** [0009-0006-3427-9611](https://orcid.org/0009-0006-3427-9611)
*   **🏛️ Zenodo:** [Research Community](https://zenodo.org/communities/smartlegionlab)

---

<div align="center">
  <sub>Built with ❤️ by Alexander Suvorov</sub>
  <br>
  <sub>© 2026 Alexander Suvorov. All rights reserved.</sub>
</div>