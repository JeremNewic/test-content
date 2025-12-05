import fs from 'fs';

// Votre WordPress local
const LOCAL_WP_URL = 'http://test-content.local/wp-json/wp/v2';
const WP_USERNAME = 'root';
const WP_PASSWORD = 'asYI 0CGm dxvZ EZkL x0Wg CbuE'; // Application password

const credentials = Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64');
const EXPORT_FILE = './exports/actualites.json';

/**
 * Supprime tous les posts importés depuis le fichier d'export
 */
async function deleteImportedPosts() {
  if (!fs.existsSync(EXPORT_FILE)) {
    console.log('⚠️ Fichier d\'export introuvable. Suppression de tous les posts...\n');
    await deleteAllPosts();
    return;
  }

  const actualites = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf-8'));
  console.log(`🗑️  Suppression de ${actualites.length} post(s) importé(s)...\n`);

  let deletedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < actualites.length; i++) {
    const actualite = actualites[i];
    const title = actualite.title?.rendered || actualite.title || `ID ${actualite.id}`;
    
    try {
      // Chercher le post par slug
      const searchResponse = await fetch(`${LOCAL_WP_URL}/posts?slug=${actualite.slug}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (searchResponse.ok) {
        const posts = await searchResponse.json();
        
        if (posts.length > 0) {
          const postId = posts[0].id;
          
          // Supprimer le post
          const deleteResponse = await fetch(`${LOCAL_WP_URL}/posts/${postId}?force=true`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Basic ${credentials}`,
            },
          });

          if (deleteResponse.ok) {
            deletedCount++;
            console.log(`[${i + 1}/${actualites.length}] ✅ Supprimé: ${title}`);
          } else {
            errorCount++;
            console.log(`[${i + 1}/${actualites.length}] ❌ Erreur lors de la suppression: ${title}`);
          }
        } else {
          console.log(`[${i + 1}/${actualites.length}] ⚠️  Non trouvé: ${title}`);
        }
      }

      // Pause entre chaque suppression
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      errorCount++;
      console.error(`[${i + 1}/${actualites.length}] ❌ Erreur: ${error.message}`);
    }
  }

  console.log(`\n✅ Suppression terminée!`);
  console.log(`   ✅ Supprimés: ${deletedCount}`);
  console.log(`   ❌ Erreurs: ${errorCount}`);
  console.log(`   ⚠️  Non trouvés: ${actualites.length - deletedCount - errorCount}`);
}

/**
 * Supprime tous les posts (option plus radicale)
 */
async function deleteAllPosts() {
  try {
    console.log('📡 Récupération de tous les posts...\n');
    
    let offset = 0;
    const limit = 100;
    let hasMore = true;
    let totalDeleted = 0;

    while (hasMore) {
      const response = await fetch(`${LOCAL_WP_URL}/posts?per_page=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        break;
      }

      const posts = await response.json();
      
      if (posts.length === 0) {
        hasMore = false;
        break;
      }

      for (const post of posts) {
        try {
          const deleteResponse = await fetch(`${LOCAL_WP_URL}/posts/${post.id}?force=true`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Basic ${credentials}`,
            },
          });

          if (deleteResponse.ok) {
            totalDeleted++;
            console.log(`✅ Supprimé: ${post.title?.rendered || post.title || `ID ${post.id}`}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Erreur lors de la suppression de ${post.id}: ${error.message}`);
        }
      }

      offset += limit;
      hasMore = posts.length === limit;
    }

    console.log(`\n✅ ${totalDeleted} post(s) supprimé(s) au total`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Lancer la suppression
const args = process.argv.slice(2);
if (args.includes('--all')) {
  console.log('⚠️  ATTENTION: Suppression de TOUS les posts!\n');
  deleteAllPosts().catch(console.error);
} else {
  deleteImportedPosts().catch(console.error);
}

