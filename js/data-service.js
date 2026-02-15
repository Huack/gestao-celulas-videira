/**
 * data-service.js – Camada de abstração de dados
 * 
 * ARQUITETURA:
 *   - user/cell → Supabase (banco de dados remoto)
 *   - bible    → IndexedDB (cache local, sempre offline)
 *   - preferences → Supabase (user_preferences)
 * 
 * DEPENDÊNCIAS (carregar ANTES deste script):
 *   1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   2. <script src="../js/supabase-config.js"></script>
 *   3. <script src="../js/data-service.js"></script>
 * 
 * DEV MODE (sem auth):
 *   - Usa um único "dev user" auto-criado
 *   - Sem login/senha necessário
 *   - RLS desabilitado
 */

const DataService = (() => {

    // ID do usuário atual (em dev: criado automaticamente)
    let _currentUserId = null;
    let _sb = null; // Supabase client

    // ═══════════════════════════════════════════════════
    // SUPABASE HELPERS
    // ═══════════════════════════════════════════════════

    function sb() {
        if (!_sb) {
            _sb = typeof getSupabase === 'function' ? getSupabase() : null;
        }
        return _sb;
    }

    /**
     * Em dev: cria ou reutiliza um "dev user" no banco
     * Em prod: vai usar Supabase Auth
     */
    async function ensureUser() {
        if (_currentUserId) return _currentUserId;

        // Tentar recuperar do sessionStorage (sobrevive refresh na mesma aba)
        const cached = sessionStorage.getItem('_ds_userId');
        if (cached) {
            _currentUserId = cached;
            return _currentUserId;
        }

        return null;
    }

    /**
     * Cria um novo perfil no banco (usado no registro)
     */
    async function createProfile(data) {
        const client = sb();
        if (!client) return _fallbackStorage.createProfile(data);

        const { data: profile, error } = await client
            .from('profiles')
            .insert({
                name: data.name || null,
                email: data.email || null,
                phone: data.phone || null,
                profile: data.profile || 'visitante',
                is_first_access: true,
                onboarding_complete: false
            })
            .select()
            .single();

        if (error) {
            console.error('[DataService] Erro ao criar perfil:', error);
            return _fallbackStorage.createProfile(data);
        }

        _currentUserId = profile.id;
        sessionStorage.setItem('_ds_userId', profile.id);
        return profile.id;
    }


    // ═══════════════════════════════════════════════════
    // FALLBACK — Quando Supabase não está disponível
    // ═══════════════════════════════════════════════════

    const _fallbackStorage = {
        createProfile(data) {
            const id = 'local_' + Date.now();
            sessionStorage.setItem('userName', data.name || '');
            sessionStorage.setItem('userEmail', data.email || '');
            sessionStorage.setItem('userPhone', data.phone || '');
            sessionStorage.setItem('userProfile', data.profile || 'visitante');
            sessionStorage.setItem('isFirstAccess', 'true');
            sessionStorage.setItem('_ds_userId', id);
            _currentUserId = id;
            return id;
        },
        getUser() {
            return {
                name: sessionStorage.getItem('userName'),
                email: sessionStorage.getItem('userEmail'),
                phone: sessionStorage.getItem('userPhone'),
                profile: sessionStorage.getItem('userProfile'),
                is_first_access: sessionStorage.getItem('isFirstAccess') === 'true',
                onboarding_complete: sessionStorage.getItem('onboardingComplete') === 'true'
            };
        },
        updateUser(field, value) {
            const map = {
                name: 'userName', email: 'userEmail', phone: 'userPhone',
                profile: 'userProfile', is_first_access: 'isFirstAccess',
                onboarding_complete: 'onboardingComplete'
            };
            const key = map[field];
            if (key) {
                if (typeof value === 'boolean') {
                    if (value) sessionStorage.setItem(key, 'true');
                    else sessionStorage.removeItem(key);
                } else {
                    sessionStorage.setItem(key, value);
                }
            }
        }
    };


    // ═══════════════════════════════════════════════════
    // IndexedDB (mantém para cache de Bíblia)
    // ═══════════════════════════════════════════════════

    const IDB = {
        _dbName: 'GestaoApp',
        _dbVersion: 1,
        _stores: ['bibleCache', 'userData'],

        async _open() {
            return new Promise((resolve, reject) => {
                const req = indexedDB.open(this._dbName, this._dbVersion);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    this._stores.forEach(name => {
                        if (!db.objectStoreNames.contains(name)) {
                            db.createObjectStore(name, { keyPath: 'id' });
                        }
                    });
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        },

        async get(storeName, key) {
            try {
                const db = await this._open();
                return new Promise((resolve) => {
                    const tx = db.transaction(storeName, 'readonly');
                    const store = tx.objectStore(storeName);
                    const req = store.get(key);
                    req.onsuccess = () => resolve(req.result?.data || null);
                    req.onerror = () => resolve(null);
                });
            } catch { return null; }
        },

        async set(storeName, key, data) {
            try {
                const db = await this._open();
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                store.put({ id: key, data, updatedAt: Date.now() });
                return new Promise((resolve) => {
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                });
            } catch { return false; }
        },

        async remove(storeName, key) {
            try {
                const db = await this._open();
                const tx = db.transaction(storeName, 'readwrite');
                tx.objectStore(storeName).delete(key);
                return new Promise((resolve) => {
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                });
            } catch { return false; }
        }
    };


    // ═══════════════════════════════════════════════════
    // DOMÍNIOS DE DADOS — API pública
    // ═══════════════════════════════════════════════════

    const user = {
        async getName() {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) return _fallbackStorage.getUser().name;
            const { data } = await client.from('profiles').select('name').eq('id', uid).single();
            return data?.name || null;
        },

        async getEmail() {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) return _fallbackStorage.getUser().email;
            const { data } = await client.from('profiles').select('email').eq('id', uid).single();
            return data?.email || null;
        },

        async getProfile() {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) return _fallbackStorage.getUser().profile;
            const { data } = await client.from('profiles').select('profile').eq('id', uid).single();
            return data?.profile || 'visitante';
        },

        async setProfile(profile) {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) { _fallbackStorage.updateUser('profile', profile); return; }
            await client.from('profiles').update({ profile, updated_at: new Date().toISOString() }).eq('id', uid);
        },

        async setEmail(email) {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) { _fallbackStorage.updateUser('email', email); return; }
            await client.from('profiles').update({ email, updated_at: new Date().toISOString() }).eq('id', uid);
        },

        async isFirstAccess() {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) return _fallbackStorage.getUser().is_first_access;
            const { data } = await client.from('profiles').select('is_first_access').eq('id', uid).single();
            return data?.is_first_access ?? false;
        },

        async setFirstAccess(value) {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) { _fallbackStorage.updateUser('is_first_access', value); return; }
            await client.from('profiles').update({ is_first_access: value, updated_at: new Date().toISOString() }).eq('id', uid);
        },

        async isOnboardingComplete() {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) return _fallbackStorage.getUser().onboarding_complete;
            const { data } = await client.from('profiles').select('onboarding_complete').eq('id', uid).single();
            return data?.onboarding_complete ?? false;
        },

        async setOnboardingComplete(value) {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) { _fallbackStorage.updateUser('onboarding_complete', value); return; }
            await client.from('profiles').update({ onboarding_complete: value, updated_at: new Date().toISOString() }).eq('id', uid);
        },

        /**
         * Salva dados completos de registro → INSERT no Supabase
         */
        async saveRegistration(data) {
            await createProfile(data);
        },

        /**
         * Limpa dados de sessão (logout)
         */
        async clearSession() {
            _currentUserId = null;
            sessionStorage.removeItem('_ds_userId');
        }
    };


    const cell = {
        async getLastVisited() {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) {
                try { return JSON.parse(sessionStorage.getItem('lastVisitedCell')); }
                catch { return null; }
            }
            const { data } = await client
                .from('visitor_cells')
                .select('*')
                .eq('user_id', uid)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (!data) return null;
            return {
                id: data.cell_id,
                name: data.cell_name,
                leader: data.cell_leader,
                tags: data.cell_tags || []
            };
        },

        async hasSkippedChoice() {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) return sessionStorage.getItem('skippedCellChoice') === 'true';
            const { data } = await client
                .from('visitor_cells')
                .select('skipped_choice')
                .eq('user_id', uid)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            return data?.skipped_choice ?? false;
        },

        async setSkippedChoice(value) {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) {
                if (value) sessionStorage.setItem('skippedCellChoice', 'true');
                else sessionStorage.removeItem('skippedCellChoice');
                return;
            }
            // Upsert: marca como "pulou escolha"
            await client.from('visitor_cells').insert({
                user_id: uid,
                cell_id: 'skipped',
                cell_name: null,
                skipped_choice: true,
                is_active: true
            });
        },

        /**
         * Salva seleção completa de célula → INSERT no Supabase
         */
        async saveSelection(cellData) {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) {
                sessionStorage.setItem('selectedCellId', cellData.id || '');
                sessionStorage.setItem('selectedCellName', cellData.name || '');
                sessionStorage.setItem('lastVisitedCell', JSON.stringify(cellData));
                return;
            }

            // Desativar células anteriores
            await client.from('visitor_cells')
                .update({ is_active: false })
                .eq('user_id', uid);

            // Inserir nova seleção
            await client.from('visitor_cells').insert({
                user_id: uid,
                cell_id: cellData.id || 'unknown',
                cell_name: cellData.name,
                cell_leader: cellData.leader,
                cell_tags: cellData.tags || [],
                skipped_choice: false,
                is_active: true
            });
        },

        async clearSelection() {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) {
                ['selectedCellId', 'selectedCellName', 'lastVisitedCell', 'skippedCellChoice']
                    .forEach(k => sessionStorage.removeItem(k));
                return;
            }
            await client.from('visitor_cells')
                .update({ is_active: false })
                .eq('user_id', uid);
        }
    };


    const bible = {
        async getPreferredVersion() {
            // Sempre local (não depende de Supabase)
            try { return localStorage.getItem('bibliaVersao') || 'naa'; }
            catch { return 'naa'; }
        },
        async setPreferredVersion(version) {
            try { localStorage.setItem('bibliaVersao', version); }
            catch { /* ignore */ }
        },

        // Cache de dados da Bíblia (IndexedDB — sempre local)
        async getCachedData(version) {
            return IDB.get('bibleCache', version);
        },
        async setCachedData(version, data) {
            return IDB.set('bibleCache', version, data);
        },
        async removeCachedData(version) {
            return IDB.remove('bibleCache', version);
        },

        // Favoritos (futuro)
        async getBookmarks() {
            try { return JSON.parse(localStorage.getItem('bibliaFavoritos')) || []; }
            catch { return []; }
        },
        async addBookmark(ref) {
            const bookmarks = await this.getBookmarks();
            bookmarks.push({ ...ref, createdAt: Date.now() });
            localStorage.setItem('bibliaFavoritos', JSON.stringify(bookmarks));
        },
        async removeBookmark(index) {
            const bookmarks = await this.getBookmarks();
            bookmarks.splice(index, 1);
            localStorage.setItem('bibliaFavoritos', JSON.stringify(bookmarks));
        }
    };


    const preferences = {
        async get(key, defaultValue = null) {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) {
                try { return localStorage.getItem('pref_' + key) ?? defaultValue; }
                catch { return defaultValue; }
            }
            const { data } = await client
                .from('user_preferences')
                .select('value')
                .eq('user_id', uid)
                .eq('key', key)
                .single();
            return data?.value ?? defaultValue;
        },

        async set(key, value) {
            const client = sb();
            const uid = await ensureUser();
            if (!client || !uid) {
                try { localStorage.setItem('pref_' + key, value); }
                catch { /* ignore */ }
                return;
            }
            await client.from('user_preferences').upsert({
                user_id: uid,
                key,
                value: String(value),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,key' });
        },

        async getJSON(key, defaultValue = null) {
            const val = await this.get(key);
            if (val === null) return defaultValue;
            try { return JSON.parse(val); }
            catch { return defaultValue; }
        },

        async setJSON(key, value) {
            await this.set(key, JSON.stringify(value));
        }
    };


    // ═══════════════════════════════════════════════════
    // API PÚBLICA
    // ═══════════════════════════════════════════════════

    return {
        user,
        cell,
        bible,
        preferences,

        /**
         * Inicializa DataService
         * Conecta ao Supabase se disponível
         */
        async init() {
            _sb = typeof getSupabase === 'function' ? getSupabase() : null;
            if (_sb) {
                console.log('[DataService] Conectado ao Supabase (' + (SUPABASE_CONFIG?.mode || 'unknown') + ')');
            } else {
                console.warn('[DataService] Supabase não disponível. Usando fallback local.');
            }
            await ensureUser();
            return true;
        },

        /**
         * Retorna o ID do usuário atual
         */
        getUserId() {
            return _currentUserId;
        },

        /**
         * Limpa todos os dados do app (logout completo)
         */
        async clearAll() {
            await user.clearSession();
            await cell.clearSelection();
            // Não limpar cache da Bíblia (dados estáticos)
        }
    };

})();

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.DataService = DataService;
}
