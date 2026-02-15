/**
 * biblia-search-worker.js – Web Worker para busca de versículos
 * Executa a busca pesada em background thread, evitando travar a UI.
 */

// Cache de dados recebidos da thread principal
let cachedData = null;
let cachedVersion = null;

self.onmessage = function (e) {
    const { type, data, version, query, livrosInfo } = e.data;

    if (type === 'setData') {
        // Thread principal envia os dados da Bíblia para o worker cachear
        cachedData = data;
        cachedVersion = version;
        return;
    }

    if (type === 'search') {
        if (!cachedData) {
            self.postMessage({ type: 'error', message: 'Dados não carregados' });
            return;
        }

        const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const results = [];
        const MAX_RESULTS = 30;

        for (let b = 0; b < cachedData.length && results.length < MAX_RESULTS; b++) {
            const book = cachedData[b];
            const livro = livrosInfo[b];
            if (!livro || !book?.chapters) continue;

            for (let c = 0; c < book.chapters.length && results.length < MAX_RESULTS; c++) {
                const chapter = book.chapters[c];
                for (let v = 0; v < chapter.length && results.length < MAX_RESULTS; v++) {
                    const verseText = chapter[v];
                    const normalized = verseText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    if (normalized.includes(q)) {
                        results.push({
                            bookIndex: b,
                            bookName: livro.name,
                            chapter: c + 1,
                            verse: v + 1,
                            text: verseText,
                            chapterIndex: c,
                            verseIndex: v
                        });
                    }
                }
            }
        }

        self.postMessage({ type: 'results', results, query });
    }
};
