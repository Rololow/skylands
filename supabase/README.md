# Supabase setup (MVP)

## 1) Exécuter le schéma
1. Ouvre Supabase > SQL Editor
2. Colle puis exécute `supabase/001_init.sql`

## 2) Seed du catalogue initial
Exécute ensuite `supabase/002_seed_skylanders.sql` pour injecter une base de 20 Skylanders.

## 3) Seed des prix initiaux
Exécute ensuite `supabase/003_seed_prices.sql` pour injecter des prix EUR de départ.

## 4) Migration images (si projet déjà créé)
Exécute `supabase/004_add_skylander_image_columns.sql` pour ajouter les colonnes `figure_image_url` et `card_image_url`.

## 5) Import minimal (nom + prix + image)
Optionnel: exécute `supabase/005_apply_priceandimage_minimal.sql` pour appliquer des liens image + prix sur les 20 Skylanders seedés.

## 6) Import complet CSV (nom + prix + image)
Optionnel: exécute `supabase/006_apply_priceandimage_full.sql` pour importer tout `priceandimage.csv` (685 items, 681 prix).

## 7) Créer ton premier modérateur
Après création d'un utilisateur, passe son rôle:

```sql
update public.users
set role = 'moderator'
where id = 'USER_UUID';
```

## 8) Variables à garder
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret, serveur uniquement)

## 9) Étape suivante recommandée
Implémenter l'auth Next.js (Supabase Auth) puis brancher les requêtes CRUD sur `user_collection`.
