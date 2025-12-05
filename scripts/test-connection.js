/**
 * Script de test pour vérifier la connexion à l'API WordPress
 * Utile pour diagnostiquer les problèmes de connexion
 */

const PROD_WP_URL = 'https://fo-groupebouygues.com/wp-json/wp/v2';
const ACTUALITES_ENDPOINT = `${PROD_WP_URL}/actualites`;

async function testConnection() {
  console.log('🔍 Test de connexion à l\'API WordPress...\n');
  console.log(`📍 URL: ${ACTUALITES_ENDPOINT}\n`);

  try {
    // Test 1: Vérifier l'endpoint de base
    console.log('📡 Test 1: Endpoint de base WordPress');
    const baseResponse = await fetch(`${PROD_WP_URL.replace('/wp/v2', '')}/wp/v2`);
    if (baseResponse.ok) {
      const baseData = await baseResponse.json();
      console.log('✅ Connexion WordPress OK');
      console.log(`   Namespace: ${baseData.namespace}`);
    } else {
      console.log(`❌ Erreur ${baseResponse.status}: ${baseResponse.statusText}`);
    }

    // Test 2: Récupérer une actualité
    console.log('\n📡 Test 2: Récupération d\'une actualité');
    const testResponse = await fetch(`${ACTUALITES_ENDPOINT}?per_page=1&_embed`);
    
    if (testResponse.ok) {
      const actualites = await testResponse.json();
      if (Array.isArray(actualites) && actualites.length > 0) {
        const actualite = actualites[0];
        console.log('✅ Actualité récupérée avec succès');
        console.log(`   ID: ${actualite.id}`);
        console.log(`   Titre: ${actualite.title?.rendered || actualite.title}`);
        console.log(`   Date: ${actualite.date}`);
        console.log(`   Slug: ${actualite.slug}`);
        console.log(`   Champs ACF: ${actualite.acf ? Object.keys(actualite.acf).length : 0} champ(s)`);
        console.log(`   Image featured: ${actualite.featured_media ? 'Oui' : 'Non'}`);
      } else {
        console.log('⚠️ Aucune actualité trouvée');
      }
    } else {
      console.log(`❌ Erreur ${testResponse.status}: ${testResponse.statusText}`);
      const errorText = await testResponse.text();
      console.log(`   Détails: ${errorText.substring(0, 200)}`);
    }

    // Test 3: Compter le total d'actualités
    console.log('\n📡 Test 3: Nombre total d\'actualités');
    const countResponse = await fetch(`${ACTUALITES_ENDPOINT}?per_page=1`);
    if (countResponse.ok) {
      const total = countResponse.headers.get('x-wp-total');
      const totalPages = countResponse.headers.get('x-wp-totalpages');
      if (total) {
        console.log(`✅ Total d'actualités: ${total}`);
        console.log(`   Pages: ${totalPages}`);
      }
    }

    console.log('\n✅ Tests terminés!');
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error.message);
    if (error.message.includes('fetch')) {
      console.log('\n💡 Vérifiez que:');
      console.log('   - L\'URL est correcte');
      console.log('   - Vous avez une connexion internet');
      console.log('   - Le site WordPress est accessible');
    }
  }
}

testConnection();

