/**
 * biblia.js – Lógica da Bíblia Offline (v2 – Performance Otimizada)
 *
 * Melhorias:
 * - DataService para abstração de dados (pronto para Supabase)
 * - IndexedDB para cache offline (via DataService)
 * - Web Worker para busca de versículos (não trava a UI)
 * - Touch targets otimizados para mobile
 * - Debounce adaptativo (mobile = 600ms, desktop = 400ms)
 *
 * Dependência: js/data-service.js (deve ser carregado antes)
 */

const VERSOES = {
    naa: { nome: 'NAA', desc: 'Nova Almeida Atualizada' },
    nvi: { nome: 'NVI', desc: 'Nova Versão Internacional' },
    nvt: { nome: 'NVT', desc: 'Nova Versão Transformadora' },
    acf: { nome: 'ACF', desc: 'Almeida Corrigida e Fiel' },
    ara: { nome: 'ARA', desc: 'Almeida Revista e Atualizada' },
    aa: { nome: 'AA', desc: 'Almeida Revisada' },
    ntlh: { nome: 'NTLH', desc: 'Nova Tradução na Linguagem de Hoje' },
};

const LIVROS_INFO = [
    // Antigo Testamento (39 livros)
    { abbrev: 'gn', name: 'Gênesis', testament: 'AT' },
    { abbrev: 'ex', name: 'Êxodo', testament: 'AT' },
    { abbrev: 'lv', name: 'Levítico', testament: 'AT' },
    { abbrev: 'nm', name: 'Números', testament: 'AT' },
    { abbrev: 'dt', name: 'Deuteronômio', testament: 'AT' },
    { abbrev: 'js', name: 'Josué', testament: 'AT' },
    { abbrev: 'jz', name: 'Juízes', testament: 'AT' },
    { abbrev: 'rt', name: 'Rute', testament: 'AT' },
    { abbrev: '1sm', name: '1 Samuel', testament: 'AT' },
    { abbrev: '2sm', name: '2 Samuel', testament: 'AT' },
    { abbrev: '1rs', name: '1 Reis', testament: 'AT' },
    { abbrev: '2rs', name: '2 Reis', testament: 'AT' },
    { abbrev: '1cr', name: '1 Crônicas', testament: 'AT' },
    { abbrev: '2cr', name: '2 Crônicas', testament: 'AT' },
    { abbrev: 'ed', name: 'Esdras', testament: 'AT' },
    { abbrev: 'ne', name: 'Neemias', testament: 'AT' },
    { abbrev: 'et', name: 'Ester', testament: 'AT' },
    { abbrev: 'jó', name: 'Jó', testament: 'AT' },
    { abbrev: 'sl', name: 'Salmos', testament: 'AT' },
    { abbrev: 'pv', name: 'Provérbios', testament: 'AT' },
    { abbrev: 'ec', name: 'Eclesiastes', testament: 'AT' },
    { abbrev: 'ct', name: 'Cânticos', testament: 'AT' },
    { abbrev: 'is', name: 'Isaías', testament: 'AT' },
    { abbrev: 'jr', name: 'Jeremias', testament: 'AT' },
    { abbrev: 'lm', name: 'Lamentações', testament: 'AT' },
    { abbrev: 'ez', name: 'Ezequiel', testament: 'AT' },
    { abbrev: 'dn', name: 'Daniel', testament: 'AT' },
    { abbrev: 'os', name: 'Oséias', testament: 'AT' },
    { abbrev: 'jl', name: 'Joel', testament: 'AT' },
    { abbrev: 'am', name: 'Amós', testament: 'AT' },
    { abbrev: 'ob', name: 'Obadias', testament: 'AT' },
    { abbrev: 'jn', name: 'Jonas', testament: 'AT' },
    { abbrev: 'mq', name: 'Miquéias', testament: 'AT' },
    { abbrev: 'na', name: 'Naum', testament: 'AT' },
    { abbrev: 'hc', name: 'Habacuque', testament: 'AT' },
    { abbrev: 'sf', name: 'Sofonias', testament: 'AT' },
    { abbrev: 'ag', name: 'Ageu', testament: 'AT' },
    { abbrev: 'zc', name: 'Zacarias', testament: 'AT' },
    { abbrev: 'ml', name: 'Malaquias', testament: 'AT' },
    // Novo Testamento (27 livros)
    { abbrev: 'mt', name: 'Mateus', testament: 'NT' },
    { abbrev: 'mc', name: 'Marcos', testament: 'NT' },
    { abbrev: 'lc', name: 'Lucas', testament: 'NT' },
    { abbrev: 'jo', name: 'João', testament: 'NT' },
    { abbrev: 'at', name: 'Atos', testament: 'NT' },
    { abbrev: 'rm', name: 'Romanos', testament: 'NT' },
    { abbrev: '1co', name: '1 Coríntios', testament: 'NT' },
    { abbrev: '2co', name: '2 Coríntios', testament: 'NT' },
    { abbrev: 'gl', name: 'Gálatas', testament: 'NT' },
    { abbrev: 'ef', name: 'Efésios', testament: 'NT' },
    { abbrev: 'fp', name: 'Filipenses', testament: 'NT' },
    { abbrev: 'cl', name: 'Colossenses', testament: 'NT' },
    { abbrev: '1ts', name: '1 Tessalonicenses', testament: 'NT' },
    { abbrev: '2ts', name: '2 Tessalonicenses', testament: 'NT' },
    { abbrev: '1tm', name: '1 Timóteo', testament: 'NT' },
    { abbrev: '2tm', name: '2 Timóteo', testament: 'NT' },
    { abbrev: 'tt', name: 'Tito', testament: 'NT' },
    { abbrev: 'fm', name: 'Filemom', testament: 'NT' },
    { abbrev: 'hb', name: 'Hebreus', testament: 'NT' },
    { abbrev: 'tg', name: 'Tiago', testament: 'NT' },
    { abbrev: '1pe', name: '1 Pedro', testament: 'NT' },
    { abbrev: '2pe', name: '2 Pedro', testament: 'NT' },
    { abbrev: '1jo', name: '1 João', testament: 'NT' },
    { abbrev: '2jo', name: '2 João', testament: 'NT' },
    { abbrev: '3jo', name: '3 João', testament: 'NT' },
    { abbrev: 'jd', name: 'Judas', testament: 'NT' },
    { abbrev: 'ap', name: 'Apocalipse', testament: 'NT' },
];

// ── Estado da app ──
let currentVersion = 'naa'; // será carregado via DataService.init()
let currentView = 'books';   // 'books' | 'chapters' | 'reading'
let currentBookIndex = null;
let currentChapter = null;
let bibliaCache = {};         // { versao: jsonData } — in-memory
let searchTimeout = null;
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const SEARCH_DEBOUNCE = isMobile ? 600 : 400;
// IndexedDB gerenciado pelo DataService (js/data-service.js)

// ── Web Worker para busca ──
let searchWorker = null;
let workerVersion = null;

function initSearchWorker() {
    if (searchWorker) return;
    try {
        searchWorker = new Worker('../js/biblia-search-worker.js');
        searchWorker.onmessage = handleWorkerMessage;
        searchWorker.onerror = () => {
            // Fallback: se worker falhar, usa busca na thread principal
            searchWorker = null;
        };
    } catch {
        searchWorker = null;
    }
}

function sendDataToWorker(versao, data) {
    if (!searchWorker) return;
    if (workerVersion === versao) return; // já tem os dados
    searchWorker.postMessage({
        type: 'setData',
        version: versao,
        data: data
    });
    workerVersion = versao;
}

function handleWorkerMessage(e) {
    const { type, results, query } = e.data;
    if (type === 'results') {
        renderSearchResults(results, query);
    }
}

// ── Carrega JSON de uma versão (DataService cache → fetch) ──
async function loadBiblia(versao) {
    if (bibliaCache[versao]) return bibliaCache[versao];

    // 1) Tentar cache via DataService (IndexedDB internamente)
    const cached = await DataService.bible.getCachedData(versao);
    if (cached) {
        bibliaCache[versao] = cached;
        sendDataToWorker(versao, cached);
        return cached;
    }

    // 2) Migrar dados antigos do localStorage (se existirem)
    try {
        const oldCached = localStorage.getItem('biblia_' + versao);
        if (oldCached) {
            const parsed = JSON.parse(oldCached);
            bibliaCache[versao] = parsed;
            await DataService.bible.setCachedData(versao, parsed);
            localStorage.removeItem('biblia_' + versao);
            sendDataToWorker(versao, parsed);
            return parsed;
        }
    } catch { /* ignore */ }

    // 3) Fetch do servidor
    const url = `../data/biblia-${versao}.json`;
    showLoading(true);
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Arquivo não encontrado');
        const data = await resp.json();
        bibliaCache[versao] = data;
        DataService.bible.setCachedData(versao, data).catch(() => { });
        sendDataToWorker(versao, data);
        return data;
    } catch (err) {
        showError('Erro ao carregar a Bíblia. Verifique sua conexão.');
        throw err;
    } finally {
        showLoading(false);
    }
}

// ── UI helpers ──
function showLoading(show) {
    document.getElementById('loadingOverlay').classList.toggle('hidden', !show);
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
}

// ── Render: Lista de Livros ──
function renderBooks() {
    currentView = 'books';
    updateHeader('Bíblia', false);

    const container = document.getElementById('content');
    const vt = LIVROS_INFO.filter(l => l.testament === 'AT');
    const nt = LIVROS_INFO.filter(l => l.testament === 'NT');

    container.innerHTML = `
        <!-- Version selector -->
        <div class="flex flex-wrap gap-2 mb-4">
            ${Object.entries(VERSOES).map(([key, v]) => `
                <button onclick="switchVersion('${key}')" title="${v.desc}"
                    class="version-btn px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200
                    ${key === currentVersion
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'bg-white dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/20'
        }">${v.nome}</button>
            `).join('')}
        </div>

        <!-- Version description (mobile hint) -->
        <p class="text-[11px] text-gray-400 mb-4 -mt-1">${VERSOES[currentVersion].desc}</p>

        <!-- Search bar -->
        <div class="relative mb-5">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            <input id="bookSearch" type="text" placeholder="Buscar: livro, referência (Rm 2) ou trecho..."
                class="w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                oninput="handleSearch(this.value)"
                enterkeyhint="search" inputmode="search" autocomplete="off" />
            <button id="clearSearch" onclick="clearSearch()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden p-1">
                <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
        </div>

        <!-- Search results container -->
        <div id="searchResults" class="hidden mb-5"></div>

        <!-- AT section -->
        <div id="atSection">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Antigo Testamento</h3>
            <div class="grid grid-cols-3 gap-2.5 mb-6" id="atGrid">
                ${vt.map((l, i) => bookCard(l, LIVROS_INFO.indexOf(l))).join('')}
            </div>
        </div>

        <!-- NT section -->
        <div id="ntSection">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Novo Testamento</h3>
            <div class="grid grid-cols-3 gap-2.5 mb-6" id="ntGrid">
                ${nt.map((l, i) => bookCard(l, LIVROS_INFO.indexOf(l))).join('')}
            </div>
        </div>
    `;
}

function bookCard(livro, index) {
    return `
        <button onclick="selectBook(${index})" data-book="${livro.name.toLowerCase()}" data-abbrev="${livro.abbrev}"
            class="book-card p-3 min-h-[56px] rounded-xl bg-white dark:bg-white/10 text-left transition-all duration-200 hover:shadow-md active:scale-95 border border-transparent hover:border-primary/20">
            <span class="text-sm font-semibold block truncate">${livro.name}</span>
            <span class="text-[10px] text-gray-400 uppercase">${livro.abbrev}</span>
        </button>
    `;
}

// ── Smart Search ──
function findBookByQuery(q) {
    q = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let idx = LIVROS_INFO.findIndex(l => l.abbrev === q);
    if (idx !== -1) return idx;
    idx = LIVROS_INFO.findIndex(l =>
        l.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').startsWith(q)
    );
    if (idx !== -1) return idx;
    idx = LIVROS_INFO.findIndex(l =>
        l.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
    );
    return idx;
}

function parseReference(input) {
    const match = input.trim().match(/^([123]?\s*[a-záàâãéèêíóôõúç]+)[\s.:]+(\d+)(?:[:.]+(\d+))?$/i);
    if (!match) return null;

    const bookQuery = match[1].replace(/\s+/g, '').toLowerCase();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : null;

    const bookIndex = findBookByQuery(bookQuery);
    if (bookIndex === -1) return null;

    return { bookIndex, chapter, verse };
}

function handleSearch(query) {
    const clearBtn = document.getElementById('clearSearch');
    const searchResults = document.getElementById('searchResults');
    const atSection = document.getElementById('atSection');
    const ntSection = document.getElementById('ntSection');

    if (!query.trim()) {
        clearBtn?.classList.add('hidden');
        searchResults?.classList.add('hidden');
        atSection?.classList.remove('hidden');
        ntSection?.classList.remove('hidden');
        document.querySelectorAll('.book-card').forEach(c => c.style.display = '');
        clearTimeout(searchTimeout);
        return;
    }

    clearBtn?.classList.remove('hidden');

    // 1) Referência direta (ex: "Rm 2", "Jo 3:16")
    const ref = parseReference(query);
    if (ref) {
        clearTimeout(searchTimeout);
        searchResults?.classList.remove('hidden');
        atSection?.classList.add('hidden');
        ntSection?.classList.add('hidden');

        const livro = LIVROS_INFO[ref.bookIndex];
        const verseInfo = ref.verse ? `:${ref.verse}` : '';
        searchResults.innerHTML = `
            <button onclick="goToReference(${ref.bookIndex}, ${ref.chapter - 1}${ref.verse ? ', ' + (ref.verse - 1) : ''})"
                class="w-full p-4 rounded-xl bg-primary/10 border border-primary/20 text-left transition-all hover:bg-primary/20 active:scale-[0.98]">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-primary text-[24px]">menu_book</span>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm font-bold text-primary">${livro.name} ${ref.chapter}${verseInfo}</span>
                        <span class="text-xs text-gray-400 block">Ir para este trecho</span>
                    </div>
                    <span class="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
                </div>
            </button>
        `;
        return;
    }

    // 2) Filtro de livros por nome/abreviação
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    document.querySelectorAll('.book-card').forEach(card => {
        const name = (card.dataset.book || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const abbrev = card.dataset.abbrev || '';
        const match = name.includes(q) || abbrev.includes(q);
        card.style.display = match ? '' : 'none';
    });

    // 3) Busca por texto (3+ chars, debounce adaptativo)
    if (query.trim().length >= 3) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => triggerTextSearch(query.trim()), SEARCH_DEBOUNCE);
    } else {
        searchResults?.classList.add('hidden');
    }
}

function clearSearch() {
    const input = document.getElementById('bookSearch');
    if (input) { input.value = ''; handleSearch(''); input.focus(); }
}

async function triggerTextSearch(query) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    // Mostrar indicador de busca
    searchResults.classList.remove('hidden');
    document.getElementById('atSection')?.classList.add('hidden');
    document.getElementById('ntSection')?.classList.add('hidden');
    searchResults.innerHTML = `
        <div class="flex items-center justify-center gap-3 py-6 text-gray-400">
            <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm">Buscando versículos...</span>
        </div>
    `;

    try {
        const data = await loadBiblia(currentVersion);

        // Tentar via Web Worker (background thread)
        if (searchWorker) {
            sendDataToWorker(currentVersion, data);
            searchWorker.postMessage({
                type: 'search',
                query: query,
                livrosInfo: LIVROS_INFO.map(l => ({ name: l.name }))
            });
            return; // resultado vem via handleWorkerMessage → renderSearchResults
        }

        // Fallback: busca na thread principal (com yield para não travar)
        await searchVersesFallback(data, query);

    } catch (e) {
        searchResults.innerHTML = '';
        searchResults.classList.add('hidden');
        document.getElementById('atSection')?.classList.remove('hidden');
        document.getElementById('ntSection')?.classList.remove('hidden');
    }
}

async function searchVersesFallback(data, query) {
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const results = [];
    const MAX = 30;

    for (let b = 0; b < data.length && results.length < MAX; b++) {
        const book = data[b];
        const livro = LIVROS_INFO[b];
        if (!livro || !book?.chapters) continue;

        for (let c = 0; c < book.chapters.length && results.length < MAX; c++) {
            const chapter = book.chapters[c];
            for (let v = 0; v < chapter.length && results.length < MAX; v++) {
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

        // Yield a cada 5 livros para dar respiro à UI (mobile)
        if (b % 5 === 4) {
            await new Promise(r => setTimeout(r, 0));
        }
    }

    renderSearchResults(results, query);
}

function renderSearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    const atSection = document.getElementById('atSection');
    const ntSection = document.getElementById('ntSection');
    if (!searchResults) return;

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <span class="material-symbols-outlined text-[40px] mb-2 block opacity-50">search_off</span>
                <p class="text-sm">Nenhum versículo encontrado para "${escapeHtml(query)}"</p>
            </div>
        `;
    } else {
        searchResults.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Resultados</span>
                <span class="text-xs text-gray-400">${results.length}${results.length >= 30 ? '+' : ''} encontrado${results.length > 1 ? 's' : ''}</span>
            </div>
            <div class="space-y-2 max-h-[60vh] overflow-y-auto rounded-xl overscroll-contain">
                ${results.map(r => `
                    <button onclick="goToReference(${r.bookIndex}, ${r.chapterIndex}, ${r.verseIndex})"
                        class="w-full p-3.5 rounded-xl bg-white dark:bg-white/5 text-left transition-all hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.99] border border-gray-100 dark:border-white/5">
                        <span class="text-primary font-bold text-xs whitespace-nowrap">${r.bookName} ${r.chapter}:${r.verse}</span>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">${highlightMatch(r.text, query)}</p>
                    </button>
                `).join('')}
            </div>
        `;
    }

    searchResults.classList.remove('hidden');
    atSection?.classList.add('hidden');
    ntSection?.classList.add('hidden');
}

async function goToReference(bookIndex, chapterIndex, verseIndex) {
    currentBookIndex = bookIndex;
    await selectChapter(chapterIndex);

    if (verseIndex !== undefined && verseIndex >= 0) {
        setTimeout(() => {
            const verseEl = document.getElementById('v' + (verseIndex + 1));
            if (verseEl) {
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                verseEl.style.transition = 'background 0.3s, padding 0.3s';
                verseEl.style.background = 'rgba(212, 17, 82, 0.1)';
                verseEl.style.borderRadius = '8px';
                verseEl.style.padding = '4px 8px';
                verseEl.style.margin = '0 -8px';
                setTimeout(() => {
                    verseEl.style.background = '';
                    verseEl.style.borderRadius = '';
                    verseEl.style.padding = '';
                    verseEl.style.margin = '';
                }, 3000);
            }
        }, 200);
    }
}

function highlightMatch(text, query) {
    const escaped = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-500/30 rounded px-0.5">$1</mark>');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Render: Capítulos de um livro ──
async function selectBook(index) {
    currentBookIndex = index;
    const livro = LIVROS_INFO[index];

    try {
        const data = await loadBiblia(currentVersion);
        const bookData = data[index];
        if (!bookData) { showError('Livro não encontrado'); return; }

        currentView = 'chapters';
        updateHeader(livro.name, true);

        const totalCaps = bookData.chapters.length;
        const container = document.getElementById('content');
        container.innerHTML = `
            <p class="text-sm text-gray-400 mb-4">${totalCaps} capítulo${totalCaps > 1 ? 's' : ''}</p>
            <div class="grid grid-cols-5 gap-2.5">
                ${bookData.chapters.map((_, i) => `
                    <button onclick="selectChapter(${i})"
                        class="aspect-square min-h-[48px] rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30 active:scale-95">
                        ${i + 1}
                    </button>
                `).join('')}
            </div>
        `;
    } catch (e) { /* error handled in loadBiblia */ }
}

// ── Render: Versículos de um capítulo ──
async function selectChapter(chapterIndex) {
    currentChapter = chapterIndex;

    try {
        const data = await loadBiblia(currentVersion);
        const bookData = data[currentBookIndex];
        const verses = bookData.chapters[chapterIndex];
        const livro = LIVROS_INFO[currentBookIndex];
        const totalCaps = bookData.chapters.length;

        currentView = 'reading';
        updateHeader(`${livro.name} ${chapterIndex + 1}`, true);

        const container = document.getElementById('content');
        container.innerHTML = `
            <!-- Chapter nav -->
            <div class="flex items-center justify-between mb-5">
                <button onclick="navChapter(-1)" ${chapterIndex === 0 ? 'disabled' : ''}
                    class="p-3 rounded-full bg-white dark:bg-white/10 disabled:opacity-30 transition-all hover:bg-gray-100 dark:hover:bg-white/20 active:scale-90">
                    <span class="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <div class="text-center">
                    <span class="text-xs text-gray-400 uppercase">${VERSOES[currentVersion].nome}</span>
                    <h2 class="text-lg font-bold">${livro.name} ${chapterIndex + 1}</h2>
                </div>
                <button onclick="navChapter(1)" ${chapterIndex === totalCaps - 1 ? 'disabled' : ''}
                    class="p-3 rounded-full bg-white dark:bg-white/10 disabled:opacity-30 transition-all hover:bg-gray-100 dark:hover:bg-white/20 active:scale-90">
                    <span class="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
            </div>

            <!-- Verses -->
            <div class="bg-white dark:bg-white/5 rounded-2xl p-5 mb-4 space-y-3">
                ${verses.map((v, i) => `
                    <p class="text-[15px] leading-relaxed" id="v${i + 1}">
                        <span class="text-primary font-bold text-xs align-super mr-1">${i + 1}</span>${v}
                    </p>
                `).join('')}
            </div>

            <!-- Share chapter button -->
            <button onclick="shareChapter()"
                class="w-full py-3.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:bg-primary/20 active:scale-95 mb-20">
                <span class="material-symbols-outlined text-[18px]">share</span>
                Compartilhar capítulo
            </button>
        `;

        document.getElementById('content').scrollTo(0, 0);
        document.querySelector('main').scrollTo(0, 0);
        window.scrollTo(0, 0);
    } catch (e) { /* error handled in loadBiblia */ }
}

// ── Navigation helpers ──
function navChapter(dir) {
    const newChap = currentChapter + dir;
    if (newChap >= 0) selectChapter(newChap);
}

async function switchVersion(versao) {
    currentVersion = versao;
    DataService.bible.setPreferredVersion(versao);

    if (currentView === 'books') {
        renderBooks();
    } else if (currentView === 'chapters') {
        selectBook(currentBookIndex);
    } else if (currentView === 'reading') {
        selectChapter(currentChapter);
    }
}

function updateHeader(title, showBack) {
    document.getElementById('headerTitle').textContent = title;
    document.getElementById('backBtn').classList.toggle('invisible', !showBack);
}

function goBack() {
    if (currentView === 'reading') {
        selectBook(currentBookIndex);
    } else if (currentView === 'chapters') {
        renderBooks();
    }
}

// ── Share ──
function shareChapter() {
    const livro = LIVROS_INFO[currentBookIndex];
    const ref = `${livro.name} ${currentChapter + 1} (${VERSOES[currentVersion].nome})`;
    const versesEls = document.querySelectorAll('[id^="v"]');
    let text = `📖 ${ref}\n\n`;
    versesEls.forEach((el, i) => {
        text += `${i + 1}. ${el.textContent.replace(/^\d+/, '').trim()}\n`;
    });

    if (navigator.share) {
        navigator.share({ title: ref, text: text });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Capítulo copiado!');
        });
    }
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-xl z-[100] animate-fade-in';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; }, 2000);
    setTimeout(() => toast.remove(), 2500);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
    await DataService.init();
    currentVersion = await DataService.bible.getPreferredVersion();
    initSearchWorker();
    renderBooks();
    // Preload current version
    loadBiblia(currentVersion).catch(() => { });
});
