const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'pages');
const JS_FILE = 'bottom-nav.js';

// Exclusões
const EXCLUDES_FILES = [
    'login.html',
    'onboarding.html',
    'cadastro-visitante.html',
    'escolher-celula.html'
];

const EXCLUDES_DIRS = [
    'boas-vindas',
    'cadastro'
];

function getAllHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!EXCLUDES_DIRS.includes(file)) {
                getAllHtmlFiles(filePath, fileList);
            }
        } else {
            if (path.extname(file) === '.html' && !EXCLUDES_FILES.includes(file)) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'js', JS_FILE)).replace(/\\/g, '/');

    // 1. Remover nav antiga (simplificado, assume que nav está no final ou tem classe específica IOS ou fixed bottom)
    // Remove nav com class ios-tab-bar OU nav fixed bottom
    // Cuidado para não remover header

    // Regex para remover nav antiga específica (ios-tab-bar ou fixed bottom)
    // Tenta ser específico para não quebrar outros navs
    const navRegex = /<nav[^>]*class="[^"]*(ios-tab-bar|fixed bottom-0)[^"]*"[^>]*>[\s\S]*?<\/nav>/gi;

    let newContent = content.replace(navRegex, '<!-- Nav antiga removida pelo bottom-nav.js -->');

    // 2. Injetar script se não existir
    if (!newContent.includes(JS_FILE)) {
        const scriptTag = `<script src="${relativePath}"></script>`;
        newContent = newContent.replace('</body>', `    ${scriptTag}\n</body>`);

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${path.relative(PAGES_DIR, filePath)}`);
        } else {
            console.log(`Skipped (no body tag?): ${path.relative(PAGES_DIR, filePath)}`);
        }
    } else {
        console.log(`Skipped (already has script): ${path.relative(PAGES_DIR, filePath)}`);
    }
}

const files = getAllHtmlFiles(PAGES_DIR);
console.log(`Found ${files.length} files to update.`);

files.forEach(updateFile);
