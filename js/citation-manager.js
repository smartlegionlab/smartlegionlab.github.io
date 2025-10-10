class CitationManager {
    constructor() {
        this.papers = {
            'pointer-paradigm': {
                author: 'Suvorov, Alexander',
                title: 'The Pointer-Based Security Paradigm: Architectural Shift from Data Protection to Data Non-Existence',
                month: 'sep',
                year: '2025',
                publisher: 'Zenodo',
                doi: '10.5281/zenodo.17204738',
                url: 'https://doi.org/10.5281/zenodo.17204738'
            },
            'localdata-paradigm': {
                author: 'Suvorov, Alexander',
                title: 'The Local Data Regeneration Paradigm: Ontological Shift from Data Transmission to Synchronous State Discovery',
                month: 'oct',
                year: '2025',
                publisher: 'Zenodo',
                doi: '10.5281/zenodo.17264327',
                url: 'https://doi.org/10.5281/zenodo.17264327'
            }
        };
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.citation-btn')) {
                const button = e.target.closest('.citation-btn');
                const paperId = button.dataset.doi;
                this.showCitationModal(paperId);
            }

            if (e.target.closest('.copy-btn')) {
                this.copyToClipboard(e.target.closest('.copy-btn'));
            }
        });
    }

    generateBibTeX(paper) {
        const citeKey = paper.doi.replace(/[^a-zA-Z0-9]/g, '_');
        return `@misc{${citeKey},
  author       = {${paper.author}},
  title        = {${paper.title}},
  month        = ${paper.month},
  year         = ${paper.year},
  publisher    = {${paper.publisher}},
  doi          = {${paper.doi}},
  url          = {${paper.url}}
}`;
    }

    generateAPA(paper) {
        return `Suvorov, A. (${paper.year}). ${paper.title}. Zenodo. https://doi.org/${paper.doi}`;
    }

    generateMLA(paper) {
        const months = {
            'sep': 'September',
            'oct': 'October'
        };
        const day = paper.month === 'sep' ? '26' : '4';
        const month = months[paper.month];

        return `Suvorov, A. ${paper.title}. Zenodo, ${day} ${month} ${paper.year} г., https://doi.org/${paper.doi}.`;
    }

    showCitationModal(paperId) {
        const paper = this.papers[paperId];
        if (!paper) return;

        const safeId = paperId.replace(/[^a-zA-Z0-9]/g, '-');

        const modalHTML = `
            <div class="modal fade" id="citationModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title text-light">
                                <i class="bi bi-quote me-2"></i>Cite Research
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <ul class="nav nav-tabs citation-tabs mb-3">
                                <li class="nav-item">
                                    <a class="nav-link active" data-bs-toggle="tab" href="#bibtex-${safeId}">BibTeX</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-bs-toggle="tab" href="#apa-${safeId}">APA</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-bs-toggle="tab" href="#mla-${safeId}">MLA</a>
                                </li>
                            </ul>

                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="bibtex-${safeId}">
                                    <div class="citation-format">
                                        <button class="copy-btn" data-text="${this.generateBibTeX(paper).replace(/"/g, '&quot;')}">
                                            <i class="bi bi-clipboard"></i> Copy
                                        </button>
                                        <pre class="citation-text">${this.generateBibTeX(paper)}</pre>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="apa-${safeId}">
                                    <div class="citation-format">
                                        <button class="copy-btn" data-text="${this.generateAPA(paper).replace(/"/g, '&quot;')}">
                                            <i class="bi bi-clipboard"></i> Copy
                                        </button>
                                        <p class="citation-text">${this.generateAPA(paper)}</p>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="mla-${safeId}">
                                    <div class="citation-format">
                                        <button class="copy-btn" data-text="${this.generateMLA(paper).replace(/"/g, '&quot;')}">
                                            <i class="bi bi-clipboard"></i> Copy
                                        </button>
                                        <p class="citation-text">${this.generateMLA(paper)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const oldModal = document.getElementById('citationModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = new bootstrap.Modal(document.getElementById('citationModal'));
        modal.show();

        const modalElement = document.getElementById('citationModal');
        modalElement.addEventListener('shown.bs.modal', () => {
            const tabLinks = modalElement.querySelectorAll('.citation-tabs .nav-link');
            tabLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = this.getAttribute('href');

                    tabLinks.forEach(l => l.classList.remove('active'));
                    modalElement.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));

                    this.classList.add('active');
                    const targetPane = modalElement.querySelector(target);
                    if (targetPane) {
                        targetPane.classList.add('show', 'active');
                    }
                });
            });
        });
    }

    async copyToClipboard(button) {
        const text = button.dataset.text;
        try {
            await navigator.clipboard.writeText(text);

            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="bi bi-check"></i> Copied!';
            button.style.background = '#198754';

            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
            }, 2000);

        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
}
