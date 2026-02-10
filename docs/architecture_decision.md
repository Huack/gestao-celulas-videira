# 🏗️ Arquitetura do Sistema - Gestão de Células Videira

> **Documento de Decisão Arquitetural (ADR)**  
> Versão: 1.0 | Data: 2026-02-08  
> Autor: Arquiteto de Software

---

## 📋 Sumário Executivo

Sistema de gestão de células para igrejas, multiplataforma (iOS, Android, Web), com foco em **segurança**, **escalabilidade** e **manutenibilidade**.

---

## 🎯 Requisitos Técnicos

| Requisito | Prioridade |
|-----------|------------|
| Apps nativos iOS e Android | 🔴 Alta |
| Versão Web (mobile e desktop) | 🔴 Alta |
| Autenticação segura (email, SMS) | 🔴 Alta |
| Funcionalidade offline básica | 🟡 Média |
| Notificações push | 🟡 Média |
| Sincronização em tempo real | 🟢 Baixa |

---

## 🛠️ Stack Tecnológica Definida

### Frontend (Codebase Única)

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT NATIVE + EXPO                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   iOS App   │  │ Android App │  │   Web App   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                         ▲                                   │
│                    Expo Router                              │
│                    (Navegação)                              │
└─────────────────────────────────────────────────────────────┘
```

| Tecnologia | Versão | Justificativa |
|------------|--------|---------------|
| **React Native** | 0.73+ | Framework híbrido mais maduro do mercado |
| **Expo SDK** | 50+ | Simplifica build, deploy e APIs nativas |
| **TypeScript** | 5.x | Tipagem estática = menos bugs em produção |
| **Expo Router** | 3.x | File-based routing, similar ao Next.js |
| **NativeWind** | 4.x | Tailwind CSS para React Native |
| **TanStack Query** | 5.x | Cache, sincronização e estado servidor |
| **Zustand** | 4.x | Estado global simples e performático |

### Backend (BaaS - Backend as a Service)

```
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Auth     │  │  Database   │  │   Storage   │         │
│  │  (JWT/RLS)  │  │ (PostgreSQL)│  │   (S3-like) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │  Realtime   │  │   Edge Fn   │                          │
│  │ (WebSocket) │  │   (Deno)    │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

| Serviço | Uso |
|---------|-----|
| **Supabase Auth** | Login email/senha, SMS OTP, OAuth |
| **PostgreSQL** | Banco relacional com RLS (Row Level Security) |
| **Supabase Storage** | Fotos de perfil, materiais de estudo |
| **Edge Functions** | Lógica server-side (relatórios, integrações) |
| **Realtime** | Notificações em tempo real |

---

## 🏛️ Arquitetura de Software: Clean Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│         (Screens, Components, Hooks, Navigation)            │
│                            ▲                                │
│                            │                                │
├────────────────────────────┼────────────────────────────────┤
│                     APPLICATION LAYER                       │
│              (Use Cases, Application Services)              │
│                            ▲                                │
│                            │                                │
├────────────────────────────┼────────────────────────────────┤
│                      DOMAIN LAYER                           │
│           (Entities, Value Objects, Domain Services)        │
│                       Regras de Negócio                     │
├────────────────────────────┼────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                      │
│       (Repositories, APIs, Storage, External Services)      │
└─────────────────────────────────────────────────────────────┘
```

### Regra de Dependência

> **As camadas internas NÃO conhecem as externas.**  
> Domain não sabe que existe Supabase. Apenas conhece interfaces.

---

## 📁 Estrutura de Pastas (Proposta)

```
📦 gestao-celulas-app/
├── 📂 app/                      # Expo Router (telas)
│   ├── (auth)/                  # Grupo: telas públicas
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (app)/                   # Grupo: telas autenticadas
│   │   ├── (tabs)/              # Bottom tabs
│   │   │   ├── home.tsx
│   │   │   ├── celula.tsx
│   │   │   └── perfil.tsx
│   │   └── celula/[id].tsx      # Rota dinâmica
│   └── _layout.tsx              # Layout raiz
│
├── 📂 src/
│   ├── 📂 domain/               # 💎 NÚCLEO PURO
│   │   ├── entities/            # Membro, Célula, Rede, etc.
│   │   ├── value-objects/       # Email, CPF, Telefone
│   │   ├── repositories/        # Interfaces (ports)
│   │   └── services/            # Regras de domínio
│   │
│   ├── 📂 application/          # 🔧 CASOS DE USO
│   │   ├── usecases/            # RegistrarPresenca, etc.
│   │   └── dtos/                # Data Transfer Objects
│   │
│   ├── 📂 infrastructure/       # 🔌 ADAPTADORES SECUNDÁRIOS
│   │   ├── supabase/            # Implementação Supabase (atual)
│   │   ├── storage/             # Implementação LocalStorage
│   │   ├── api/                 # Cliente HTTP (Axios/Fetch)
│   │   │
│   │   └── _sugestao_futura/    # 💡 PARA ESCALABILIDADE (Desacoplamento)
│   │       ├── adapters/        # Implementações concretas (Supabase, Firebase, Memory)
│   │       ├── http/            # Cliente HTTP agnóstico
│   │       └── cache/           # Estratégia de cache
│   │
│   │
│   ├── 📂 presentation/         # 🎨 UI
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── hooks/               # Custom hooks
│   │   └── styles/              # Tokens, temas
│   │
│   └── 📂 shared/               # 🧰 UTILITÁRIOS
│       ├── constants/           # Constantes globais
│       ├── utils/               # Funções auxiliares
│       └── types/               # Tipos TypeScript
│
├── 📂 __tests__/                # Testes
├── app.json                     # Config Expo
├── tailwind.config.js           # Config NativeWind
└── tsconfig.json                # Config TypeScript
```

---

## 🔐 Segurança e Proteção Contra Ataques

> **Seção elaborada por especialista em AppSec (Application Security)**

---

### 🛡️ 1. Proteção contra Força Bruta

#### 1.1 Rate Limiting (Limitação de Requisições)

```typescript
/**
 * Configuração de Rate Limiting no Supabase Edge Functions
 * 
 * OBJETIVO: Impedir que atacantes façam milhares de tentativas
 * de login em sequência para descobrir senhas.
 * 
 * REGRA: Máximo de 5 tentativas por IP a cada 15 minutos
 */
const RATE_LIMIT_CONFIG = {
  login: {
    maxAttempts: 5,        // Máximo de tentativas
    windowMinutes: 15,      // Janela de tempo
    blockMinutes: 30,       // Tempo de bloqueio após exceder
  },
  passwordReset: {
    maxAttempts: 3,
    windowMinutes: 60,
    blockMinutes: 60,
  },
};
```

#### 1.2 Bloqueio Progressivo de Conta

| Tentativas Falhas | Ação |
|-------------------|------|
| 3 | Delay de 5 segundos na resposta |
| 5 | CAPTCHA obrigatório |
| 10 | Conta bloqueada por 30 minutos |
| 15 | Notificação por email ao usuário |
| 20+ | Bloqueio até reset manual |

#### 1.3 Implementação no Supabase

```sql
-- Tabela para rastrear tentativas de login
CREATE TABLE auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  email TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE
);

-- Índice para consultas rápidas
CREATE INDEX idx_auth_attempts_ip ON auth_attempts(ip_address, attempted_at);

-- Função para verificar se IP está bloqueado
CREATE OR REPLACE FUNCTION is_ip_blocked(check_ip INET)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM auth_attempts
  WHERE ip_address = check_ip
    AND success = FALSE
    AND attempted_at > NOW() - INTERVAL '15 minutes';
  
  RETURN attempt_count >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 🔒 2. Autenticação Segura

#### 2.1 JWT com Rotação Automática

```typescript
/**
 * Configuração de tokens JWT
 * 
 * ACCESS TOKEN: Curta duração, usado para cada requisição
 * REFRESH TOKEN: Longa duração, usado para renovar access token
 * 
 * IMPORTANTE: Nunca armazene tokens em localStorage (vulnerável a XSS)
 * Use SecureStore (Expo) ou cookies HttpOnly (Web)
 */
const TOKEN_CONFIG = {
  accessToken: {
    expiresIn: '15m',      // Expira em 15 minutos
    algorithm: 'HS256',
  },
  refreshToken: {
    expiresIn: '7d',       // Expira em 7 dias
    rotateOnUse: true,     // Gera novo token a cada uso
  },
};
```

#### 2.2 Armazenamento Seguro de Tokens

| Plataforma | Método | Segurança |
|------------|--------|-----------|
| iOS | Keychain (via expo-secure-store) | 🟢 Alta |
| Android | EncryptedSharedPreferences | 🟢 Alta |
| Web | Cookie HttpOnly + Secure + SameSite | 🟡 Média |

```typescript
// ✅ CORRETO: Usando SecureStore no React Native
import * as SecureStore from 'expo-secure-store';

async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('auth_token', token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

// ❌ ERRADO: Nunca faça isso!
// localStorage.setItem('auth_token', token);
```

#### 2.3 Multi-Factor Authentication (MFA)

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE LOGIN MFA                       │
│                                                             │
│   [1] Email/Senha → [2] Verifica → [3] Envia OTP (SMS)     │
│                         ✓              ↓                    │
│                                   [4] Usuário digita OTP    │
│                                        ↓                    │
│                                   [5] Valida OTP            │
│                                        ↓                    │
│                                   [6] Acesso Concedido ✓    │
└─────────────────────────────────────────────────────────────┘
```

---

### 🛑 3. Proteção contra Injeção (SQL, NoSQL, XSS)

#### 3.1 SQL Injection - Prevenção

```typescript
/**
 * REGRA DE OURO: Nunca concatene strings em queries SQL
 * 
 * O Supabase usa queries parametrizadas automaticamente,
 * mas devemos validar inputs do usuário ANTES de enviar.
 */

// ❌ VULNERÁVEL - Nunca faça isso!
const vulnerableQuery = `SELECT * FROM users WHERE email = '${userInput}'`;

// ✅ SEGURO - Supabase faz sanitização automática
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', userInput); // Input é escapado automaticamente
```

#### 3.2 XSS (Cross-Site Scripting) - Prevenção

```typescript
/**
 * Sanitização de inputs do usuário
 * 
 * QUANDO USAR: Sempre que exibir conteúdo gerado pelo usuário
 * (nomes, comentários, pedidos de oração, etc.)
 */
import DOMPurify from 'dompurify';

function sanitizeUserInput(input: string): string {
  // Remove tags HTML perigosas, mantém texto seguro
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Não permite nenhuma tag HTML
    ALLOWED_ATTR: [], // Não permite nenhum atributo
  });
}

// Exemplo de uso
const userComment = "<script>alert('hacked')</script>Olá!";
const safeComment = sanitizeUserInput(userComment);
// Resultado: "Olá!" (script removido)
```

#### 3.3 Content Security Policy (CSP)

```html
<!-- Headers de segurança para a versão Web -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://cdn.tailwindcss.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co;
">
```

---

### 🔐 4. Row Level Security (RLS) - Políticas Completas

```sql
-- ============================================================
-- POLÍTICAS DE SEGURANÇA A NÍVEL DE LINHA (RLS)
-- 
-- CONCEITO: Cada usuário só pode ver/editar dados que tem permissão
-- O banco de dados NEGA acesso por padrão e só PERMITE via políticas
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICA: Membros só veem dados da própria célula
-- ============================================================
CREATE POLICY "membro_ve_propria_celula" ON membros
  FOR SELECT
  USING (
    -- Usuário logado pertence à mesma célula
    celula_id = (
      SELECT celula_id FROM membros 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- POLÍTICA: Líder pode ver todas as células sob sua supervisão
-- ============================================================
CREATE POLICY "lider_ve_celulas_supervisionadas" ON celulas
  FOR SELECT
  USING (
    -- É líder desta célula
    lider_id = auth.uid()
    OR
    -- É discipulador que supervisiona o líder
    lider_id IN (
      SELECT user_id FROM membros 
      WHERE discipulador_id = auth.uid()
    )
    OR
    -- É pastor da rede
    rede_id IN (
      SELECT id FROM redes WHERE pastor_id = auth.uid()
    )
    OR
    -- É governo (vê tudo)
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND nivel >= 7
    )
  );

-- ============================================================
-- POLÍTICA: Só líder pode inserir presença na sua célula
-- ============================================================
CREATE POLICY "lider_registra_presenca" ON presencas
  FOR INSERT
  WITH CHECK (
    celula_id IN (
      SELECT id FROM celulas WHERE lider_id = auth.uid()
    )
  );
```

---

### 🚨 5. Monitoramento e Auditoria

#### 5.1 Log de Ações Sensíveis

```sql
-- Tabela de auditoria
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para auditoria automática
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id, action, table_name, record_id, 
    old_data, new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger em tabelas sensíveis
CREATE TRIGGER audit_membros
  AFTER INSERT OR UPDATE OR DELETE ON membros
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

#### 5.2 Alertas de Segurança

| Evento | Ação |
|--------|------|
| 10+ falhas de login em 1 min (mesmo IP) | Bloquear IP + Notificar admin |
| Login de país diferente | Enviar email de verificação |
| Alteração de permissão | Log + Notificar usuário |
| Exclusão em massa (>10 registros) | Requerer confirmação 2FA |

---

### 🔑 6. Gestão de Senhas

#### 6.1 Requisitos de Senha Forte

```typescript
/**
 * Validação de senha segura
 * 
 * REQUISITOS:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 * - Não pode ser uma senha comum (lista negra)
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Inclua pelo menos uma letra maiúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Inclua pelo menos uma letra minúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('Inclua pelo menos um número');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Inclua pelo menos um caractere especial (@$!%*?&)');
  }
  
  return { valid: errors.length === 0, errors };
}
```

#### 6.2 Hashing de Senhas

> ✅ **Supabase Auth já usa bcrypt com salt automático**  
> Não precisamos implementar hashing manual.

---

### 🌐 7. Segurança de Rede

#### 7.1 HTTPS Obrigatório

```typescript
// Verificação de conexão segura no app
if (__DEV__ === false && !window.location?.protocol?.startsWith('https')) {
  throw new Error('Conexão insegura detectada. Use HTTPS.');
}
```

#### 7.2 Certificate Pinning (Mobile)

```typescript
/**
 * Certificate Pinning
 * 
 * OBJETIVO: Impedir ataques Man-in-the-Middle
 * O app só aceita certificados do nosso servidor
 */
// expo-certificate-pinning ou react-native-ssl-pinning
const PINNED_CERTIFICATES = [
  'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Produção
];
```

---

### 📊 Resumo das Proteções

| Vetor de Ataque | Proteção | Status |
|-----------------|----------|--------|
| Força Bruta | Rate Limiting + Bloqueio progressivo | ✅ |
| SQL Injection | Queries parametrizadas (Supabase) | ✅ |
| XSS | Sanitização + CSP | ✅ |
| CSRF | Tokens SameSite + Verificação origin | ✅ |
| Man-in-the-Middle | HTTPS + Certificate Pinning | ✅ |
| Escalação de Privilégios | RLS + Verificação de nível | ✅ |
| Vazamento de Dados | Criptografia em repouso (Supabase) | ✅ |
| Token Hijacking | SecureStore + Rotação de tokens | ✅ |

---

---

## 🌪️ 8. Plano de Recuperação de Desastres (DR) e Continuidade

> **Estratégia para garantir que o sistema sobreviva a falhas críticas.**

### 8.1 Backup do Banco de Dados

| Nível | Método | Frequência | Retenção | Onde? |
|-------|--------|------------|----------|-------|
| **1 (Básico)** | Backup Automático Supabase | Diário | 7 dias | Supabase Cloud |
| **2 (Pro)** | Point-in-Time Recovery (PITR)* | Contínuo | Até 30 dias | Supabase Cloud |
| **3 (Externo)** | Script `pg_dump` via GitHub Actions | Semanal | 90 dias | AWS S3 / GDrive |

*> Requer plano Pro ($25/mês)*

### 8.2 Redundância de Código e Deploy

1.  **Repositório (GitHub)**:
    *   O código fonte é a "verdade absoluta".
    *   Em caso de perda do servidor de build (Expo), o código está seguro no Git.
2.  **Infraestrutura como Código (IaC)**:
    *   Scripts SQL de migração (`migrations/`) salvos no repositório.
    *   Isso permite recriar todo o banco de dados do zero em um novo projeto Supabase em minutos.

### 8.3 Procedimento de Recuperação (Runbook)

**Cenário: Supabase fica offline ou dados são corrompidos.**

1.  **Notificação**: O sistema de monitoramento alerta os admins.
2.  **Avaliação**: Verificar se é uma instabilidade temporária ou perda de dados.
3.  **Restauração (Se houver perda)**:
    *   *Opção A (Rápida)*: Restaurar backup automático do dia anterior via painel Supabase.
    *   *Opção B (Catástrofe)*: Criar novo projeto Supabase, rodar migrações do GitHub, importar último `pg_dump` externo.
4.  **Comunicação**: Informar usuários via redes sociais/email sobre a manutenção.

---

## 📱 Deploy e Distribuição

| Plataforma | Método |
|------------|--------|
| **iOS** | EAS Build → TestFlight → App Store |
| **Android** | EAS Build → Play Console |
| **Web** | Vercel ou Expo Web |

---

## 💰 Custos Estimados (Mensal)

| Serviço | Plano | Custo |
|---------|-------|-------|
| Supabase | Free (até 50k MAU) | $0 |
| Supabase | Pro (quando escalar) | $25 |
| Expo EAS | Free (30 builds/mês) | $0 |
| Expo EAS | Production | $99 |
| Vercel | Free (hobby) | $0 |
| **Total inicial** | | **$0** |

---

## ⚖️ 9. Alternativas Consideradas (e por que não escolhemos)

### 9.1 Next.js como Backend (API Routes)

Muita gente sugere usar **Next.js** para criar a API do backend. É uma ótima ferramenta, mas **não escolhemos** para este projeto porque:

1.  **Redundância**: O **Supabase** já gera uma API REST completa e segura automaticamente (PostgREST). Criar uma API no Next.js seria apenas "repassar" chamadas, adicionando latência e código inútil.
2.  **Duplicidade de Codebase**: Teríamos que manter dois projetos (App Mobile em Expo + Backend em Next.js), dificultando o compartilhamento de tipos (TypeScript) e regras de negócio.
3.  **Expo Router é o "Next.js do Mobile"**: O framework **Expo Router** que escolhemos já possui **API Routes** (funções que rodam no servidor) nativas. Se precisarmos de um endpoint personalizado, podemos criar dentro do próprio projeto Mobile (`app/api/hello+api.ts`), sem precisar de um servidor Next.js separado.

**Decisão:** Manter **Supabase** como backend principal e usar **Edge Functions** ou **Expo API Routes** para lógica personalizada quando necessário.

---

### 9.2 Stack Customizada (Node.js + Express + tRPC) - Conselhos de Amigos

Uma desenvolvedora sugeriu usar **Node.js + tRPC + Prisma + PostgreSQL**. Essa é uma stack **fantástica** e muito usada em grandes empresas, mas para o nosso cenário atual, ela traz **complexidade desnecessária**:

| Aspecto | Stack Supabase (Nossa) | Stack Customizada (Sugerida) |
| :--- | :--- | :--- |
| **Backend** | Serverless (Não precisa configurar servidor) | Servidor Node.js (Precisa configurar VPS/Docker) |
| **API** | Gerada automaticamente (PostgREST) | Manual (Escrever resolvers, rotas, testes) |
| **Banco de Dados** | Postgres Gerenciado | Postgres Auto-hospedado ou Gerenciado |
| **Tempo de Dev** | 🚀 **Muito Rápido** (Foco no Produto) | 🐢 **Médio** (Foco em Infraestrutura) |
| **Custo Inicial** | $0 (Free Tier generoso) | $$ (Hospedagem do Node + Banco + Redis) |
| **Manutenção** | Baixa (Supabase cuida da segurança/updates) | Alta (Você cuida de updates de segurança do SO/Node) |

**Veredito:** A stack sugerida é ótima para times grandes (5+ devs) que precisam de controle total do backend. Para uma **equipe ágil** ou **solo dev**, o Supabase entrega 80% do valor com 20% do esforço.

**Nota:** Podemos migrar para Node.js no futuro se necessário, pois o banco (PostgreSQL) é o mesmo!

---

## 📈 10. Estratégia de Escalabilidade (Mito vs. Realidade)

> **Dúvida Comum:** *"O Supabase aguenta milhares de usuários simultâneos?"*
> **Resposta Curta:** **Sim.** O Supabase não é um "brinquedo", é **PostgreSQL** puro otimizado para a nuvem.

### 10.1 Por que o Supabase aguenta o tranco?

1.  **PostgreSQL Enterprise:** Por baixo do capô, é o banco de dados relacional mais robusto do mundo. Grandes empresas (Apple, Instagram, Spotify) usam Postgres para *bilhões* de registros.
2.  **Supavisor (Connection Pooling):** O maior gargalo de bancos SQL são as conexões. O Supabase criou o **Supavisor**, um pooler que gerencia **milhares de conexões simultâneas** sem derrubar o banco. Ele reutiliza conexões ativas de forma inteligente (similar ao PgBouncer).
3.  **Arquitetura Serverless:** Nossas APIs (Edge Functions) rodam na rede global da Deno (CDN), escalando automaticamente de 0 a 100.000 requisições/segundo sem que precisemos configurar servidores.

### 10.2 Plano de Crescimento (Roadmap de Escala)

Se o app explodir de sucesso (Amém!), este é o plano técnico:

*   **Fase 1 (Até 50k usuários):**
    *   Plano Pro ($25/mês).
    *   Uso de índices apropriados no banco (já planejados).
    *   Cache agressivo no App (React Query).
*   **Fase 2 (50k - 500k usuários):**
    *   **Read Replicas:** Criar cópias de leitura do banco em diferentes regiões para distribuir a carga de consultas (o App lê da réplica, escreve no principal).
    *   **Otimização de Queries:** Análise de performance com `pg_stat_statements`.
*   **Fase 3 (Milhões de usuários):**
    *   **Sharding/Partitioning:** Dividir tabelas gigantes em pedaços menores (ex: `relatorios_2025`, `relatorios_2026`).
    *   **Redis Dedicado:** Implementar cache em memória para dados muito acessados (ex: feed de notícias).

**Conclusão:** O gargalo raramente é o Supabase/Postgres. Geralmente é código mal escrito (chamar o banco dentro de um loop, falta de índices, etc.). Nossa arquitetura Clean Architecture previne exatamente isso.

---

---

## 🌩️ 11. Análise de Riscos e Mitigações (Pre-Mortem)

> **"A esperança não é uma estratégia."**
> Como arquiteto sênior, é meu dever ser pessimista agora para você ter paz depois. Aqui estão os **gargalos reais** que podem derrubar o sistema se não cuidarmos:

### 🔴 Risco 1: Heavy Reads & RLS Overhead (O gargalo silencioso)
**O Problema:** O Supabase aplica suas políticas de segurança (RLS) para *cada linha* que é lida do banco. Se você fizer um `SELECT * FROM membros` com 1 milhão de usuários e uma política complexa (ex: checar 3 tabelas diferentes), o banco vai parar.
**Mitigação (Já na Arquitetura):**
1.  **Índices Compostos:** Criar índices específicos para as colunas usadas nas regras de RLS (`celula_id`, `lider_id`).
2.  **Paginação Obrigatória no Backend:** Nunca permitir que o front peça "tudo". Sempre limitar (`.range(0, 10)`).
3.  **Views Materializadas:** Para relatórios pesados (dashboard do pastor), não calcular na hora. Usar uma *Materialized View* que atualiza a cada 1 hora.

### 🔴 Risco 2: Connection Storm (Domingo, 18h)
**O Problema:** Domingo, 18h, começa o culto. 50.000 líderes abrem o app *ao mesmo tempo* para fazer check-in. O banco recebe 50k requisições simultâneas de escrita.
**Mitigação:**
1.  **Supavisor (Pooling):** Já configurado por padrão, evita que o banco caia por excesso de conexões.
2.  **Optimistic UI (Front):** O app mostra "Salvo com sucesso" instantaneamente e sincroniza em background. Se demorar 2s, o usuário nem percebe.
3.  **Filas (Edge Functions + Redis):** Se crescer muito, em vez de gravar direto no banco, o app manda para uma fila (Redis/Upstash) e um "worker" processa aos poucos.

### 🔴 Risco 3: "N+1" no Cliente (Erro de Júnior)
**O Problema:** O desenvolvedor faz um loop no front: "Para cada célula, busque o líder". Se tiver 100 células, são 101 requisições para o servidor. Isso drena a bateria do usuário e mata o banco.
**Mitigação:**
1.  **Query única com Joins:** Usar `.select('*, lider:membros(*)')` para trazer tudo em uma única batida.
2.  **Code Review Rigoroso:** Barrar qualquer loop de requisições no Pull Request.

### 🔴 Risco 4: Cache vs. Tempo Real
**O Problema:** Se todo mundo ficar ouvindo "Realtime" de tudo, a conta do Supabase explode e a performance degrada.
**Mitigação:**
1.  **Realtime Seletivo:** Só ligar o WebSocket para coisas críticas (chat, notificação urgente). Não precisa de realtime para atualizar a lista de membros.
2.  **TanStack Query (Stale-While-Revalidate):** O app mostra dados do cache (instantâneo) e atualiza em background. O usuário sente que o app é "zero latency".

## ✅ Próximos Passos

1. [ ] Aprovar esta arquitetura
2. [ ] Criar projeto Expo com estrutura de pastas
3. [ ] Configurar Supabase (auth, database, RLS)
4. [ ] Implementar autenticação
5. [ ] Criar primeiro módulo (Células)

---

## 📚 Referências

- [Expo Documentation](https://docs.expo.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NativeWind](https://www.nativewind.dev)
