/**
 * Analyse la structure HTML pour trouver où est le contenu unique
 */

const ACTUALITE_URL = 'https://fo-groupebouygues.com/actualites/newsletter-novembre-2025/';
const TITLE = 'NEWSLETTER NOVEMBRE 2025';

async function analyzeStructure() {
  try {
    console.log('🔍 Analyse de la structure HTML...\n');
    
    const htmlResponse = await fetch(ACTUALITE_URL);
    const html = await htmlResponse.text();
    
    const titleIndex = html.indexOf(TITLE);
    console.log(`📍 Titre trouvé à la position: ${titleIndex}\n`);
    
    if (titleIndex !== -1) {
      // Analyser 5000 caractères après le titre
      const snippet = html.substring(titleIndex, Math.min(html.length, titleIndex + 5000));
      
      // Chercher tous les divs Elementor
      const elementorDivs = snippet.match(/<div[^>]*data-elementor[^>]*>/gi);
      console.log(`📦 Divs Elementor trouvés: ${elementorDivs ? elementorDivs.length : 0}`);
      
      if (elementorDivs) {
        elementorDivs.forEach((div, i) => {
          console.log(`\nDiv ${i+1}:`);
          console.log(`  ${div.substring(0, 200)}`);
        });
      }
      
      // Chercher les sections Elementor
      const elementorSections = snippet.match(/<section[^>]*data-elementor[^>]*>/gi);
      console.log(`\n📦 Sections Elementor trouvées: ${elementorSections ? elementorSections.length : 0}`);
      
      if (elementorSections) {
        elementorSections.forEach((section, i) => {
          console.log(`\nSection ${i+1}:`);
          console.log(`  ${section.substring(0, 200)}`);
        });
      }
      
      // Chercher le conteneur principal
      const mainMatches = [
        snippet.match(/<main[^>]*>/i),
        snippet.match(/<div[^>]*id="main"[^>]*>/i),
        snippet.match(/<div[^>]*class="[^"]*main[^"]*"[^>]*>/i),
      ].filter(m => m !== null);
      
      console.log(`\n📦 Conteneurs main trouvés: ${mainMatches.length}`);
      
      // Essayer d'extraire le contenu entre le titre et le footer
      const footerIndex = html.indexOf('<footer', titleIndex);
      if (footerIndex !== -1) {
        const contentBetween = html.substring(titleIndex + 500, footerIndex);
        const textContent = contentBetween.replace(/<[^>]*>/g, '').trim();
        console.log(`\n📝 Contenu entre titre et footer:`);
        console.log(`   Longueur HTML: ${contentBetween.length} caractères`);
        console.log(`   Longueur texte: ${textContent.length} caractères`);
        console.log(`   Extrait (300 premiers caractères):`);
        console.log(`   ${textContent.substring(0, 300)}...`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

analyzeStructure();

