# Options pour récupérer le contenu complet

Le Custom Post Type "actualites" n'expose pas le champ `content` via l'API REST. Voici plusieurs alternatives :

## Option 1 : Export via WP-CLI (Recommandé si disponible)

Si vous avez accès SSH au serveur WordPress :

```bash
# Exporter toutes les actualités en JSON avec le contenu
wp post list --post_type=actualites --format=json --fields=ID,post_title,post_content,post_excerpt,post_date,post_name > actualites-export.json
```

## Option 2 : Export via plugin WordPress

Installez un plugin d'export comme **WP All Export** ou **Export All URLs** qui peut exporter :
- Tous les champs (y compris le contenu)
- En format JSON/CSV/XML
- Avec les champs ACF

## Option 3 : Export direct depuis la base de données

Si vous avez accès à la base de données MySQL :

```sql
SELECT 
    p.ID,
    p.post_title,
    p.post_content,
    p.post_excerpt,
    p.post_date,
    p.post_name as slug
FROM wp_posts p
WHERE p.post_type = 'actualites'
AND p.post_status = 'publish'
ORDER BY p.post_date DESC;
```

Puis convertir le résultat en JSON.

## Option 4 : Utiliser l'API XML-RPC

WordPress a aussi une API XML-RPC qui peut exposer plus de données :

```javascript
// Nécessite un plugin ou configuration spécifique
```

## Option 5 : Scraper le HTML (dernier recours)

Si aucune autre option n'est disponible, on peut extraire le contenu depuis le HTML des pages, mais c'est moins fiable.

## Recommandation

**La meilleure solution** serait d'utiliser **WP-CLI** ou un **plugin d'export WordPress** qui peut exporter tous les champs en une fois.

