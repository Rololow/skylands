# Supabase setup (MVP)

## 1) Exécuter le schéma
1. Ouvre Supabase > SQL Editor
2. Colle puis exécute `supabase/001_init.sql`

## 2) Seed du catalogue initial
Exécute ensuite `supabase/002_seed_skylanders.sql` pour injecter une base de 20 Skylanders.

## 3) Seed des prix initiaux
Exécute ensuite `supabase/003_seed_prices.sql` pour injecter des prix EUR de départ.

## 4) Créer ton premier modérateur
Après création d'un utilisateur, passe son rôle:

```sql
update public.users
set role = 'moderator'
where id = 'USER_UUID';
```

## 5) Variables à garder
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret, serveur uniquement)

## 6) Étape suivante recommandée
Implémenter l'auth Next.js (Supabase Auth) puis brancher les requêtes CRUD sur `user_collection`.
