/**
 * Script pour vérifier tous les champs ACF disponibles
 * et trouver où se trouve le contenu
 */

const PROD_WP_URL = 'https://fo-groupebouygues.com/wp-json/wp/v2';
const ACTUALITES_ENDPOINT = `${PROD_WP_URL}/actualites`;

async function checkACFFields() {
  try {
    console.log('🔍 Recherche des champs ACF et du contenu...\n');
    
    // Récupérer une actualité
    const response = await fetch(`${ACTUALITES_ENDPOINT}?per_page=1&_embed`);
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }
    
    const actualites = await response.json();
    if (actualites.length === 0) {
      console.log('Aucune actualité trouvée');
      return;
    }
    
    const actualite = actualites[0];
    console.log(`📰 Actualité testée: ${actualite.title?.rendered || actualite.title}\n`);
    console.log(`ID: ${actualite.id}`);
    console.log(`Slug: ${actualite.slug}\n`);
    
    // Afficher tous les champs disponibles
    console.log('📋 Tous les champs disponibles:');
    Object.keys(actualite).forEach(key => {
      const value = actualite[key];
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        console.log(`  - ${key}: [objet avec ${Object.keys(value).length} propriétés]`);
      } else if (Array.isArray(value)) {
        console.log(`  - ${key}: [tableau de ${value.length} éléments]`);
      } else {
        const strValue = String(value);
        console.log(`  - ${key}: ${strValue.substring(0, 100)}${strValue.length > 100 ? '...' : ''}`);
      }
    });
    
    // Vérifier les champs ACF
    console.log('\n🔎 Analyse des champs ACF:');
    if (actualite.acf && Object.keys(actualite.acf).length > 0) {
      console.log('✅ Champs ACF trouvés:');
      Object.keys(actualite.acf).forEach(key => {
        const value = actualite.acf[key];
        console.log(`  - ${key}: ${typeof value}`);
        if (typeof value === 'string' && value.length > 0) {
          console.log(`    Contenu: ${value.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('⚠️ Aucun champ ACF trouvé dans la réponse API');
      console.log('💡 Les champs ACF peuvent nécessiter le plugin "ACF to REST API"');
    }
    
    // Vérifier le contenu standard
    console.log('\n📝 Contenu standard:');
    console.log(`  - content.rendered: ${actualite.content?.rendered ? '✅ Présent' : '❌ Absent'}`);
    console.log(`  - content.raw: ${actualite.content?.raw ? '✅ Présent' : '❌ Absent'}`);
    
    // Vérifier les meta fields
    console.log('\n🔑 Meta fields (via _embedded):');
    if (actualite._embedded) {
      Object.keys(actualite._embedded).forEach(key => {
        console.log(`  - ${key}: ${Array.isArray(actualite._embedded[key]) ? `[${actualite._embedded[key].length} éléments]` : 'présent'}`);
      });
    }
    
    // Vérifier le HTML de la page pour trouver le contenu
    console.log('\n🌐 Vérification du HTML de la page...');
    if (actualite.link) {
      try {
        const htmlResponse = await fetch(actualite.link);
        const html = await htmlResponse.text();
        
        // Chercher différents sélecteurs possibles pour le contenu
        const contentSelectors = [
          /<article[^>]*>([\s\S]*?)<\/article>/i,
          /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
          /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
          /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        ];
        
        for (const selector of contentSelectors) {
          const match = html.match(selector);
          if (match && match[1] && match[1].length > 100) {
            console.log(`✅ Contenu trouvé dans le HTML (${match[1].length} caractères)`);
            console.log(`   Extrait: ${match[1].substring(0, 200).replace(/<[^>]*>/g, '')}...`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Impossible de récupérer le HTML: ${error.message}`);
      }
    }
    
    console.log('\n✅ Analyse terminée!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkACFFields();

