/**
 * Supabase Configuration
 * 
 * Detecta automaticamente se está em dev (localhost) ou prod.
 * Em dev: usa Supabase Local (Docker)
 * Em prod: usa Supabase Cloud (trocar URL e key abaixo)
 */
const SUPABASE_CONFIG = (() => {
    const isDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (isDev) {
        return {
            url: 'http://127.0.0.1:54321',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
            mode: 'dev'
        };
    }

    // ── PRODUÇÃO: substituir com suas credenciais do Supabase Cloud ──
    return {
        url: 'https://SEU-PROJETO.supabase.co',
        anonKey: 'SUA_ANON_KEY_AQUI',
        mode: 'prod'
    };
})();

// Inicializar client Supabase
let _supabaseClient = null;

function getSupabase() {
    if (!_supabaseClient) {
        if (typeof supabase === 'undefined' || !supabase.createClient) {
            console.warn('[SupabaseConfig] Supabase JS não carregado. Usando fallback local.');
            return null;
        }
        _supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log(`[SupabaseConfig] Conectado em modo: ${SUPABASE_CONFIG.mode}`);
    }
    return _supabaseClient;
}
