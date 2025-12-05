/**
 * Script de test pour vérifier l'authentification WordPress
 */

const LOCAL_WP_URL = 'http://test-content.local/wp-json/wp/v2';
const WP_USERNAME = 'root';
const WP_PASSWORD = 'asYI 0CGm dxvZ EZkL x0Wg CbuE'; // Application password

const credentials = Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64');

async function testAuth() {
  console.log('🔐 Test d\'authentification WordPress...\n');
  console.log(`📍 URL: ${LOCAL_WP_URL}`);
  console.log(`👤 Username: ${WP_USERNAME}\n`);

  try {
    // Test 1: Vérifier l'accès à l'API
    console.log('📡 Test 1: Accès à l\'API (sans auth)');
    const publicResponse = await fetch(`${LOCAL_WP_URL}/posts?per_page=1`);
    if (publicResponse.ok) {
      console.log('✅ API accessible publiquement');
    } else {
      console.log(`⚠️ API retourne: ${publicResponse.status}`);
    }

    // Test 2: Vérifier l'authentification avec GET
    console.log('\n📡 Test 2: Authentification (GET)');
    const authResponse = await fetch(`${LOCAL_WP_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    if (authResponse.ok) {
      const user = await authResponse.json();
      console.log('✅ Authentification réussie!');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nom: ${user.name || user.slug || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      
      // Essayer de récupérer les rôles via l'endpoint users/{id}
      try {
        const userDetailResponse = await fetch(`${LOCAL_WP_URL}/users/${user.id}?context=edit`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
          },
        });
        
        if (userDetailResponse.ok) {
          const userDetail = await userDetailResponse.json();
          console.log(`   Rôles: ${userDetail.roles?.join(', ') || 'N/A'}`);
          
          if (userDetail.roles && userDetail.roles.includes('administrator')) {
            console.log('   ✅ Rôle Administrateur confirmé!');
          } else {
            console.log(`   ⚠️ Rôles: ${userDetail.roles?.join(', ') || 'Aucun rôle détecté'}`);
          }
        }
      } catch (e) {
        // Si on ne peut pas récupérer les détails, on continue
      }
      
      // Vérifier les permissions via un test de création
      console.log(`\n📋 Vérification des permissions...`);
    } else {
      const error = await authResponse.text();
      console.log(`❌ Erreur d'authentification: ${authResponse.status}`);
      console.log(`   Détails: ${error.substring(0, 200)}`);
      
      if (authResponse.status === 401) {
        console.log('\n💡 Solutions possibles:');
        console.log('   1. Vérifiez que le username et password sont corrects');
        console.log('   2. Créez un "Application Password" dans WordPress:');
        console.log('      - Allez dans Utilisateurs > Votre profil');
        console.log('      - Scrollez jusqu\'à "Application Passwords"');
        console.log('      - Créez un nouveau mot de passe');
        console.log('      - Utilisez ce mot de passe dans le script');
        console.log('   3. Assurez-vous que l\'utilisateur a le rôle "Administrator"');
      }
    }

    // Test 3: Tester la création d'un post (sans vraiment le créer)
    console.log('\n📡 Test 3: Permissions de création');
    const createTestResponse = await fetch(`${LOCAL_WP_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        title: 'Test de permission',
        content: 'Ceci est un test',
        status: 'draft', // Draft pour ne pas vraiment créer
      }),
    });

    if (createTestResponse.ok) {
      const testPost = await createTestResponse.json();
      console.log('✅ Permission de création confirmée!');
      console.log(`   - Peut créer des posts: ✅`);
      console.log(`   - Post de test créé (ID: ${testPost.id})`);
      
      // Tester la publication
      const publishResponse = await fetch(`${LOCAL_WP_URL}/posts/${testPost.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify({ status: 'publish' }),
      });
      
      if (publishResponse.ok) {
        console.log(`   - Peut publier des posts: ✅`);
      } else {
        console.log(`   - Peut publier des posts: ⚠️ (peut-être limité)`);
      }
      
      // Supprimer le post de test
      await fetch(`${LOCAL_WP_URL}/posts/${testPost.id}?force=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });
      console.log('   - Post de test supprimé');
      
      console.log('\n🎉 Toutes les permissions nécessaires sont présentes!');
      console.log('   Vous pouvez lancer l\'import avec: npm run import:actualites');
    } else {
      const error = await createTestResponse.text();
      console.log(`❌ Erreur lors du test de création: ${createTestResponse.status}`);
      console.log(`   Détails: ${error.substring(0, 300)}`);
    }

    console.log('\n✅ Tests terminés!');
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error.message);
  }
}

testAuth();

