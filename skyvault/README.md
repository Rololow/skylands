# SkyVault (Next.js + Supabase)

## Setup local

1. Installer les dépendances:

```bash
npm install
```

2. Créer `.env.local` en copiant le contenu de `.env.example`.

3. Renseigner les variables Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Lancer le serveur:

```bash
npm run dev
```

Ouvre `http://localhost:3000`.

## Auth incluse

- `GET /login` -> connexion email/password
- `GET /signup` -> inscription email/password
- `POST signInWithGoogle` -> connexion OAuth Google
- `GET /auth/callback` -> callback OAuth Supabase
- `POST logout` depuis la home
- `GET /collection` -> checklist utilisateur liée à `user_collection` + valeur estimée (dernier prix connu)
- `GET /moderator` -> dashboard modération (role `moderator` ou `admin`)

## Setup Google OAuth (Supabase)

1. Google Cloud Console -> crée des identifiants OAuth 2.0 (Web application).
2. Ajoute les Authorized redirect URIs Supabase:
	- `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. Dans Supabase -> Authentication -> Sign In / Providers -> Google:
	- active Google
	- colle Client ID + Client Secret Google
4. Dans Supabase -> Authentication -> URL Configuration:
	- `Site URL`: ton URL Vercel
	- `Redirect URLs`: ton URL Vercel + `http://localhost:3000`

## Fichiers clés

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/auth/actions.ts`
- `middleware.ts`
