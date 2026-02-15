/**
 * bottom-nav.js
 * Injeta a navegação inferior flutuante (glassmorphism) em todas as páginas.
 */

(function () {
    // 1. Remover navegação antiga se existir
    const oldNav = document.querySelector('nav.ios-tab-bar, nav.fixed.bottom-0');
    if (oldNav) oldNav.remove();

    // 2. Injetar CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .glass-nav {
            background: rgba(34, 16, 19, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-top: 1px solid rgba(212, 17, 50, 0.1);
        }
        .fab-shadow {
            box-shadow: 0 4px 20px rgba(212, 17, 50, 0.4);
        }
        /* Ajuste para não cobrir conteúdo */
        body {
            padding-bottom: 100px !important;
        }
    `;
    document.head.appendChild(style);

    // 3. Determinar link "Home" baseado no perfil (fallback para visitante)
    // Tenta pegar do DataService se já estiver carregado, senão usa sessionStorage direto ou default
    let homeLink = 'home-visitante.html';
    try {
        const profile = sessionStorage.getItem('userProfile');
        if (profile) homeLink = `home-${profile}.html`;
    } catch (e) { }

    // 4. HTML do Footer
    const footerHTML = `
    <!-- Floating Bottom Navigation Bar -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <nav class="glass-nav rounded-2xl flex items-center justify-between px-2 h-16 relative shadow-2xl">
            <!-- Left Side Items -->
            <div class="flex flex-1 justify-around items-center">
                <a class="flex flex-col items-center gap-1 group" href="${homeLink}" id="nav-home">
                    <span class="material-symbols-outlined text-gray-400 group-[.active]:text-primary text-[26px] transition-colors">home</span>
                    <span class="text-[10px] font-semibold text-gray-400 group-[.active]:text-primary transition-colors">Início</span>
                </a>
                <a class="flex flex-col items-center gap-1 group" href="encontrar-celula.html" id="nav-cell">
                    <span class="material-symbols-outlined text-gray-400 group-[.active]:text-white text-[26px] transition-colors group-hover:text-white">groups</span>
                    <span class="text-[10px] font-medium text-gray-400 group-[.active]:text-white transition-colors group-hover:text-white">Célula</span>
                </a>
            </div>

            <!-- Central Action Button (Postar) -->
            <div class="relative -top-6">
                <button onclick="alert('Funcionalidade em desenvolvimento')" 
                    class="bg-primary size-14 rounded-full flex items-center justify-center fab-shadow border-4 border-[#1a0d0f] active:scale-95 transition-transform">
                    <span class="material-symbols-outlined text-[#D4AF37] text-3xl font-bold">add</span>
                </button>
                <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                    <span class="text-[10px] font-bold text-primary uppercase tracking-tighter">Postar</span>
                </div>
            </div>

            <!-- Right Side Items -->
            <div class="flex flex-1 justify-around items-center">
                <a class="flex flex-col items-center gap-1 group" href="biblia.html" id="nav-bible">
                    <span class="material-symbols-outlined text-gray-400 group-[.active]:text-white text-[26px] transition-colors group-hover:text-white">book</span>
                    <span class="text-[10px] font-medium text-gray-400 group-[.active]:text-white transition-colors group-hover:text-white">Bíblia</span>
                </a>
                <a class="flex flex-col items-center gap-1 group" href="perfil.html" id="nav-profile">
                    <span class="material-symbols-outlined text-gray-400 group-[.active]:text-white text-[26px] transition-colors group-hover:text-white">person</span>
                    <span class="text-[10px] font-medium text-gray-400 group-[.active]:text-white transition-colors group-hover:text-white">Perfil</span>
                </a>
            </div>
        </nav>
    </div>

    <!-- Background Decoration -->
    <div class="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-20 overflow-hidden">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#d41132]/20 blur-[120px] rounded-full"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/10 blur-[120px] rounded-full"></div>
    </div>
    `;

    // 5. Injetar HTML no final do body
    const div = document.createElement('div');
    div.innerHTML = footerHTML;
    document.body.appendChild(div);

    // 6. Highlight active link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // Simple mapping
    if (currentPath.includes('home-')) {
        document.getElementById('nav-home').classList.add('active');
        document.getElementById('nav-home').querySelector('span').classList.replace('text-gray-400', 'text-primary');
    } else if (currentPath.includes('celula')) {
        document.getElementById('nav-cell').classList.add('active');
    } else if (currentPath.includes('biblia') || currentPath.includes('estudos')) {
        document.getElementById('nav-bible').classList.add('active');
    } else if (currentPath.includes('perfil')) {
        document.getElementById('nav-profile').classList.add('active');
    }

})();
