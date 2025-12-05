# Astro WordPress Headless Starter Kit

Un starter kit moderne et performant pour créer des sites rapides avec Astro et WordPress en mode headless.

## ✨ Fonctionnalités

- 🚀 **Astro 5** - Framework ultra-rapide avec génération statique
- 📝 **WordPress Headless** - Utilise WordPress comme CMS via l'API REST
- 🎨 **Tailwind CSS** - Framework CSS utilitaire pour un design moderne
- 🖼️ **Optimisation d'images** - Gestion intelligente des images WordPress
- 🔍 **SEO optimisé** - Métadonnées Open Graph et Twitter Cards
- 📱 **Responsive** - Design adapté à tous les écrans
- ⚡ **Performances** - Score Lighthouse proche de 100

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Une instance WordPress avec l'API REST activée

### Installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/Starterkit-Astro-WP.git
   cd mon-blog-wp
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Éditez le fichier `.env` avec vos paramètres :
   ```env
   PUBLIC_WP_API_URL=http://starterkit-blog.local/wp-json/wp/v2
   PUBLIC_SITE_URL=http://starterkit-blog.local
   PUBLIC_SITE_NAME=Starterkit Blog
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   
   Le site sera accessible sur `http://localhost:4321`

## 📁 Structure du projet

```
/
├── public/                 # Fichiers statiques
│   └── site.webmanifest
├── src/
│   ├── components/        # Composants Astro réutilisables
│   │   ├── ArticleCard.astro
│   │   ├── FeaturedArticle.astro
│   │   ├── PostCard.astro
│   │   ├── SEO.astro
│   │   ├── WordPressImage.astro
│   │   └── layout/
│   │       ├── Footer.astro
│   │       ├── Header.astro
│   │       └── Layout.astro
│   ├── lib/               # Utilitaires et API
│   │   ├── constants.ts
│   │   └── wordpress.js   # Fonctions API WordPress
│   ├── pages/             # Routes du site (file-based routing)
│   │   ├── index.astro    # Page d'accueil
│   │   ├── about.astro    # Page à propos
│   │   ├── 404.astro      # Page d'erreur
│   │   └── blog/
│   │       ├── [slug].astro   # Page article dynamique
│   │       └── listing.astro  # Liste des articles
│   └── styles/
│       └── global.css     # Styles globaux
├── .env.example           # Variables d'environnement exemple
├── astro.config.mjs       # Configuration Astro
├── tailwind.config.mjs    # Configuration Tailwind
└── package.json
```

## ⚙️ Configuration WordPress requise

Votre installation WordPress doit avoir :

- **WordPress 5.0+**
- **API REST activée** (activée par défaut)
- **Permaliens configurés** (Réglages → Permaliens → Structure personnalisée)
- **Images à la une activées** sur les articles
- **CORS configuré** si WordPress et Astro sont sur des domaines différents

### Activer CORS (optionnel)

Si nécessaire, ajoutez dans le fichier `functions.php` de votre thème :

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
}, 15);
```

## 🛠️ Commandes disponibles

| Commande              | Action                                              |
| :-------------------- | :-------------------------------------------------- |
| `npm install`         | Installer les dépendances                           |
| `npm run dev`         | Lancer le serveur de développement sur `localhost:4321` |
| `npm run build`       | Générer le site statique dans `./dist/`             |
| `npm run preview`     | Prévisualiser le build en local                     |
| `npm run astro ...`   | Exécuter des commandes Astro CLI                    |

## 🎨 Personnalisation

### Modifier les couleurs Tailwind

Éditez `tailwind.config.mjs` :

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#votre-couleur',
      },
    },
  },
}
```

### Ajouter de nouvelles pages

Créez simplement un fichier `.astro` dans `src/pages/`. Le routing est automatique :
- `src/pages/contact.astro` → `/contact`
- `src/pages/services/web.astro` → `/services/web`

### Personnaliser le Header/Footer

Modifiez les fichiers dans `src/components/layout/`.

## 📚 API WordPress disponible

Le fichier `src/lib/wordpress.js` expose plusieurs fonctions :

- `getAllPosts(limit)` - Récupérer tous les articles
- `getFeaturedPosts(limit)` - Récupérer les articles mis en avant
- `getPostBySlug(slug)` - Récupérer un article par son slug
- `getCategories()` - Récupérer toutes les catégories
- `getPostsByCategory(categoryId, limit)` - Articles par catégorie
- `getTags()` - Récupérer tous les tags
- `getPages()` - Récupérer toutes les pages

## 🚢 Déploiement

### Netlify

1. Connectez votre dépôt GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Ajoutez vos variables d'environnement

### Vercel

1. Importez votre projet GitHub
2. Framework Preset: `Astro`
3. Ajoutez vos variables d'environnement
4. Déployez !

### Build statique

```bash
npm run build
```

Le site généré sera dans le dossier `dist/` et peut être hébergé sur n'importe quel serveur statique.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 🔗 Ressources utiles

- [Documentation Astro](https://docs.astro.build)
- [Documentation WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

---

Créé avec ❤️ par [Jeremy Medina](https://github.com/JeremNewic)
