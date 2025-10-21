class CitationManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.copy-btn')) {
                this.copyToClipboard(e.target.closest('.copy-btn'));
            }
        });
    }

    async copyToClipboard(button) {
        const text = button.dataset.text;

        const originalHTML = button.innerHTML;
        const originalClasses = button.className;

        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess(button, originalHTML, originalClasses);
        } catch (err) {
            this.fallbackCopyToClipboard(text, button, originalHTML, originalClasses);
        }
    }

    showCopySuccess(button, originalHTML, originalClasses) {
        button.innerHTML = '<i class="bi bi-check"></i> Copied!';
        button.classList.add('copied');

        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.className = originalClasses;
            button.disabled = false;
        }, 2000);
    }

    fallbackCopyToClipboard(text, button, originalHTML, originalClasses) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            this.showCopySuccess(button, originalHTML, originalClasses);
        } catch (err) {
            button.innerHTML = '<i class="bi bi-x"></i> Error';
            button.disabled = true;

            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.className = originalClasses;
                button.disabled = false;
            }, 2000);
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

const citationManager = new CitationManager();