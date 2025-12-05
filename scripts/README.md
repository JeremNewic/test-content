# Scripts d'export/import WordPress

## 📋 Vue d'ensemble

Ces scripts permettent de récupérer les actualités depuis l'ancien WordPress de production et de les importer dans votre nouveau WordPress local.

## 🚀 Utilisation

### 1. Exporter les actualités depuis la production

```bash
npm run export:actualites
```

Ce script :
- Récupère toutes les actualités depuis `https://fo-groupebouygues.com/wp-json/wp/v2/actualites`
- Les sauvegarde dans `./exports/actualites.json`
- Mode lecture seule - ne modifie rien sur l'ancien site
- Export progressif par lots de 20 pour ne pas surcharger le serveur

### 2. Importer dans votre WordPress local

**Avant de lancer l'import :**

1. Configurez vos credentials dans `scripts/import-actualites.js` :
   ```javascript
   const WP_USERNAME = 'admin'; // Votre username WordPress local
   const WP_PASSWORD = 'votre-password'; // Application password
   ```

2. Créez un "Application Password" dans WordPress :
   - Allez dans **Utilisateurs → Votre profil**
   - Scrollez jusqu'à "Application Passwords"
   - Créez un nouveau mot de passe et copiez-le

3. Assurez-vous que le Custom Post Type "actualites" existe dans votre WordPress local

4. Lancez l'import :
   ```bash
   npm run import:actualites
   ```

## 📁 Structure des fichiers

- `./exports/actualites.json` : Fichier contenant toutes les actualités exportées
- Les scripts créent automatiquement le dossier `exports` si nécessaire

## ⚙️ Configuration

### Modifier l'URL de production

Éditez `scripts/export-actualites.js` :
```javascript
const PROD_WP_URL = 'https://fo-groupebouygues.com/wp-json/wp/v2';
```

### Modifier l'URL du WordPress local

Éditez `scripts/import-actualites.js` :
```javascript
const LOCAL_WP_URL = 'http://test-content.local/wp-json/wp/v2';
```

## 🔍 Vérification

Après l'export, vous pouvez vérifier le fichier JSON :
```bash
# Voir le nombre d'actualités exportées
node -e "const data = require('./exports/actualites.json'); console.log(data.length)"
```

## 📝 Notes

- Les scripts évitent les doublons en vérifiant les IDs
- Les images featured sont automatiquement importées si disponibles
- Les champs ACF sont importés si le plugin ACF to REST API est installé
- Une pause de 1 seconde est ajoutée entre chaque requête pour ne pas surcharger les serveurs

