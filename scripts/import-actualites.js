import fs from 'fs';

// Votre NOUVEAU WordPress local
const LOCAL_WP_URL = 'http://test-content.local/wp-json/wp/v2';
const LOCAL_WP_BASE = 'http://test-content.local/wp-json';

// Credentials pour votre WordPress local
// IMPORTANT: Créez un "Application Password" dans WordPress (Utilisateurs > Votre profil)
const WP_USERNAME = 'root'; // À adapter selon votre config
const WP_PASSWORD = 'asYI 0CGm dxvZ EZkL x0Wg CbuE'; // Application password recommandé

const EXPORT_FILE = './exports/actualites.json';

const credentials = Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64');

// Détecter quel endpoint utiliser (actualites ou posts)
let POST_ENDPOINT = null;

async function detectEndpoint() {
  if (POST_ENDPOINT) return POST_ENDPOINT;
  
  console.log('🔍 Détection de l\'endpoint disponible...\n');
  
  // Essayer d'abord avec le CPT "actualites"
  try {
    const testResponse = await fetch(`${LOCAL_WP_URL}/actualites?per_page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });
    
    // Si on a une 404, le CPT n'existe pas
    if (testResponse.status === 404) {
      console.log('⚠️ CPT "actualites" non trouvé (404)');
    } else if (testResponse.ok) {
      // Vérifier que ce n'est pas une erreur JSON
      try {
        const data = await testResponse.json();
        // Si on reçoit un tableau (même vide), l'endpoint existe
        if (Array.isArray(data)) {
          POST_ENDPOINT = `${LOCAL_WP_URL}/actualites`;
          console.log('✅ Custom Post Type "actualites" détecté');
          return POST_ENDPOINT;
        }
      } catch (e) {
        // Pas un JSON valide, probablement une erreur
      }
    }
  } catch (error) {
    console.log(`⚠️ Erreur lors du test: ${error.message}`);
  }
  
  // Fallback sur posts standard
  POST_ENDPOINT = `${LOCAL_WP_URL}/posts`;
  console.log('📝 Utilisation de l\'endpoint "posts" standard\n');
  return POST_ENDPOINT;
}

/**
 * Importe une actualité dans le nouveau WordPress local
 */
async function importActualite(actualite, index, total) {
  try {
    // Détecter l'endpoint à utiliser
    const endpoint = await detectEndpoint();
    
    // Préparer les données pour le nouveau WordPress
    const postData = {
      title: actualite.title?.rendered || actualite.title || 'Sans titre',
      content: actualite.content?.rendered || actualite.content || '',
      excerpt: actualite.excerpt?.rendered || actualite.excerpt || '',
      status: 'publish',
      date: actualite.date || new Date().toISOString(),
      slug: actualite.slug,
    };

    // Créer le post dans le nouveau WordPress
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Erreur ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = `Erreur ${response.status}: ${errorJson.message || errorJson.code || 'Erreur inconnue'}`;
        
        // Messages d'erreur spécifiques
        if (response.status === 401) {
          errorMessage += '\n   💡 Vérifiez vos credentials (username/password)';
        } else if (response.status === 403) {
          errorMessage += '\n   💡 L\'utilisateur n\'a pas les permissions nécessaires';
        }
      } catch (e) {
        errorMessage += `: ${errorText.substring(0, 200)}`;
      }
      
      throw new Error(errorMessage);
    }

    const newPost = await response.json();
    console.log(`[${index + 1}/${total}] ✅ ${postData.title} (ID: ${newPost.id})`);

    // Importer les champs ACF si disponibles
    if (actualite.acf && Object.keys(actualite.acf).length > 0) {
      await importACFFields(newPost.id, actualite.acf);
    }

    // Importer l'image featured si disponible
    if (actualite.featured_media) {
      await importFeaturedImage(newPost.id, actualite.featured_media, actualite._embedded);
    }

    return newPost;
  } catch (error) {
    console.error(`[${index + 1}/${total}] ❌ Erreur: ${error.message}`);
    return null;
  }
}

/**
 * Importe l'image featured depuis l'ancien WordPress
 * Note: L'import d'images nécessite des dépendances supplémentaires
 * Pour l'instant, on note juste l'URL de l'image pour import manuel si nécessaire
 */
async function importFeaturedImage(postId, featuredMediaId, embedded) {
  try {
    // Si on a les données embedded, on peut récupérer l'URL
    if (embedded && embedded['wp:featuredmedia'] && embedded['wp:featuredmedia'][0]) {
      const media = embedded['wp:featuredmedia'][0];
      const imageUrl = media.source_url;
      
      // Pour l'instant, on note juste l'URL dans les métadonnées
      // L'import automatique d'images nécessiterait form-data ou une autre méthode
      // Vous pouvez importer les images manuellement ou utiliser un plugin WordPress
      
      console.log(`  📷 Image featured disponible: ${imageUrl}`);
      console.log(`  💡 Importez manuellement cette image dans WordPress et associez-la au post ${postId}`);
      
      return false; // Retourne false pour indiquer qu'on n'a pas importé automatiquement
    }
  } catch (error) {
    // Ignorer les erreurs d'import d'image
  }
  return false;
}

/**
 * Importe les champs ACF dans le nouveau WordPress
 */
async function importACFFields(postId, acfFields) {
  try {
    // Essayer avec le CPT actualites d'abord
    let response = await fetch(`${LOCAL_WP_BASE}/acf/v3/actualites/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({ fields: acfFields }),
    });
    
    if (response.ok) {
      return true;
    }
    
    // Fallback sur posts standard
    response = await fetch(`${LOCAL_WP_BASE}/acf/v3/posts/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({ fields: acfFields }),
    });
    
    if (response.ok) {
      return true;
    }
  } catch (error) {
    // Si ACF REST API ne fonctionne pas, les champs devront être remplis manuellement
    // ou via un plugin custom
  }
  return false;
}

/**
 * Vérifie l'authentification avant de commencer l'import
 */
async function verifyAuth() {
  try {
    // Récupérer les infos utilisateur
    const response = await fetch(`${LOCAL_WP_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur d'authentification ${response.status}: ${error}`);
    }

    const user = await response.json();
    
    // Récupérer les détails complets avec les rôles
    let userRoles = [];
    try {
      const userDetailResponse = await fetch(`${LOCAL_WP_URL}/users/${user.id}?context=edit`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });
      
      if (userDetailResponse.ok) {
        const userDetail = await userDetailResponse.json();
        userRoles = userDetail.roles || [];
      }
    } catch (e) {
      // Si on ne peut pas récupérer les détails, on continue avec le test de création
    }

    // Tester directement la création d'un post pour vérifier les permissions
    // C'est plus fiable que de vérifier les capabilities
    const testCreateResponse = await fetch(`${LOCAL_WP_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        title: 'Test de permission - import',
        content: 'Ceci est un test',
        status: 'draft',
      }),
    });

    if (!testCreateResponse.ok) {
      const error = await testCreateResponse.text();
      throw new Error(`Test de création échoué: ${testCreateResponse.status} - ${error}`);
    }

    // Supprimer le post de test
    const testPost = await testCreateResponse.json();
    await fetch(`${LOCAL_WP_URL}/posts/${testPost.id}?force=true`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    console.log(`✅ Authentifié en tant que: ${user.name || user.slug || 'Utilisateur'} (${userRoles.join(', ') || 'N/A'})`);
    console.log(`✅ Permissions de création confirmées`);
    return true;
  } catch (error) {
    console.error(`\n❌ Erreur d'authentification: ${error.message}`);
    console.log('\n💡 Solutions:');
    console.log('   1. Vérifiez que le username et password sont corrects dans scripts/import-actualites.js');
    console.log('   2. Créez un "Application Password" dans WordPress:');
    console.log('      - Allez dans Utilisateurs > Votre profil');
    console.log('      - Scrollez jusqu\'à "Application Passwords"');
    console.log('      - Créez un nouveau mot de passe');
    console.log('      - Utilisez ce mot de passe (pas votre mot de passe WordPress normal)');
    console.log('   3. Assurez-vous que l\'utilisateur a le rôle "Administrator"');
    console.log('   4. Testez avec: npm run test:auth\n');
    return false;
  }
}

/**
 * Importe toutes les actualités exportées
 */
async function importAll() {
  if (!fs.existsSync(EXPORT_FILE)) {
    console.error(`❌ Fichier ${EXPORT_FILE} introuvable`);
    console.log('💡 Lancez d\'abord: npm run export:actualites');
    return;
  }

  // Vérifier l'authentification avant de commencer
  console.log('🔐 Vérification de l\'authentification...\n');
  const authOk = await verifyAuth();
  if (!authOk) {
    return;
  }

  const actualites = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf-8'));
  console.log(`\n📦 Import de ${actualites.length} actualité(s) dans le nouveau WordPress local...\n`);
  
  // Détecter l'endpoint avant de commencer
  await detectEndpoint();
  console.log(`📍 Destination: ${POST_ENDPOINT}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < actualites.length; i++) {
    const result = await importActualite(actualites[i], i, actualites.length);
    
    if (result) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Pause entre chaque import pour ne pas surcharger
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n✅ Import terminé!`);
  console.log(`   ✅ Réussis: ${successCount}`);
  console.log(`   ❌ Erreurs: ${errorCount}`);
}

importAll().catch(console.error);

