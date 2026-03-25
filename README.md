# 📋 Sistema de Reservas - Guia Completo de Instalação

Este projeto é um sistema de reservas de salas desenvolvido com **Next.js + Supabase** para uso interno.

---

# 🚀 1. REQUISITOS

Antes de começar, você precisa ter instalado:

* Node.js (versão 18 ou superior)
* npm (vem junto com Node)
* Acesso ao projeto (via pasta ou Git)

---

# 📦 2. CLONAR OU COPIAR O PROJETO

## Opção 1: Via Git

```bash
git clone https://github.com/seu-repo.git
cd seu-repo
```

## Opção 2: Via Pasta

* Baixe ou copie a pasta do projeto
* Abra ela no VS Code ou terminal

---

# ⚙️ 3. CONFIGURAR VARIÁVEIS DE AMBIENTE

Crie um arquivo na raiz do projeto chamado:

```bash
.env.local
```

E adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=COLE_AQUI
NEXT_PUBLIC_SUPABASE_ANON_KEY=COLE_AQUI
```

⚠️ IMPORTANTE:

* Nunca compartilhar esse arquivo
* Nunca subir para o GitHub

---

# 📥 4. INSTALAR DEPENDÊNCIAS

No terminal, dentro da pasta do projeto:

```bash
npm install
```

---

# ▶️ 5. RODAR O PROJETO

## Modo desenvolvimento:

```bash
npm run dev
```

Acesse no navegador:

```
http://localhost:3000
```

---

## 🚀 Modo produção (recomendado para uso interno)

```bash
npm run build
npm start
```

---

# 🌐 6. ACESSO NA REDE INTERNA

Para permitir acesso de outros computadores:

```bash
npm run dev -- --host
```

Ou:

```bash
npm start -- --host
```

Depois acesse via IP da máquina:

```
http://192.168.X.X:3000
```

---

# 🗄️ 7. BANCO DE DADOS (SUPABASE)

Certifique-se de que:

* As tabelas existem:

  * `rooms`
  * `reservations`

* O RLS (Row Level Security) está configurado corretamente

## Policies mínimas:

```sql
-- liberar leitura das salas
CREATE POLICY "Allow read rooms"
ON rooms
FOR SELECT
TO public
USING (true);

-- liberar leitura das reservas
CREATE POLICY "Allow read reservations"
ON reservations
FOR SELECT
TO public
USING (true);

-- liberar criação de reservas
CREATE POLICY "Allow insert reservations"
ON reservations
FOR INSERT
TO public
WITH CHECK (true);
```

---

# ❌ 8. ERROS COMUNS

## ❌ Não aparece dados

* Verificar RLS no Supabase
* Verificar se existem dados nas tabelas

## ❌ Erro 403

* Falta de permissão (policy não criada)

## ❌ Projeto não inicia

* Rodar `npm install` novamente

---

# 🧹 9. O QUE NÃO FAZER

Nunca subir ou compartilhar:

```
.env.local
node_modules/
.next/
```

---

# 📁 10. ESTRUTURA DO PROJETO

```
app/
components/
hooks/
lib/
public/
styles/
```

---

# 🛠️ 11. COMANDOS ÚTEIS

```bash
npm install        # instala dependências
npm run dev        # roda em desenvolvimento
npm run build      # build produção
npm start          # roda produção
```

---

# 👨‍💻 SUPORTE

Se algo não funcionar:

1. Verifique o `.env.local`
2. Verifique conexão com Supabase
3. Verifique se as tabelas existem
4. Verifique as policies

---

# ✅ PRONTO

Agora o sistema já pode ser usado internamente 🎉
