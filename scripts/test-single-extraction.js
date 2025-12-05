/**
 * Test d'extraction sur une seule page pour vérifier
 */

const ACTUALITE_URL = 'https://fo-groupebouygues.com/actualites/newsletter-novembre-2025/';
const TITLE = 'NEWSLETTER NOVEMBRE 2025';

async function testSingleExtraction() {
  try {
    console.log('🔍 Test d\'extraction sur une page...\n');
    
    const htmlResponse = await fetch(ACTUALITE_URL);
    const html = await htmlResponse.text();
    
    // Méthode améliorée: chercher après le titre
    const titleIndex = html.indexOf(TITLE);
    console.log(`📍 Titre trouvé à la position: ${titleIndex}`);
    
    if (titleIndex !== -1) {
      const afterTitle = html.substring(titleIndex);
      const elementorMainMatch = afterTitle.match(/<div[^>]*data-elementor-type="(?:wp-post|wp-page|single|loop)"[^>]*>([\s\S]*)/i);
      
      if (elementorMainMatch) {
        const startPos = titleIndex + afterTitle.indexOf(elementorMainMatch[0]) + elementorMainMatch[0].length;
        const endMarkers = [
          html.indexOf('</main>', startPos),
          html.indexOf('<footer', startPos),
        ].filter(pos => pos !== -1 && pos > startPos);
        
        if (endMarkers.length > 0) {
          const endPos = Math.min(...endMarkers);
          const extracted = html.substring(startPos, endPos);
          const textContent = extracted.replace(/<[^>]*>/g, '').trim();
          
          console.log(`\n✅ Contenu extrait:`);
          console.log(`   Longueur HTML: ${extracted.length} caractères`);
          console.log(`   Longueur texte: ${textContent.length} caractères`);
          console.log(`   Extrait texte (200 premiers):`);
          console.log(`   ${textContent.substring(0, 200)}...\n`);
        }
      }
    }
    
    // Test avec une autre page pour comparer
    console.log('\n🔍 Test sur une autre page pour comparer...\n');
    const otherUrl = 'https://fo-groupebouygues.com/actualites/actus-octoberose/';
    const otherTitle = '#Actus #OctobreRose';
    
    const otherHtmlResponse = await fetch(otherUrl);
    const otherHtml = await otherHtmlResponse.text();
    
    const otherTitleIndex = otherHtml.indexOf(otherTitle);
    if (otherTitleIndex !== -1) {
      const otherAfterTitle = otherHtml.substring(otherTitleIndex);
      const otherElementorMatch = otherAfterTitle.match(/<div[^>]*data-elementor-type="(?:wp-post|wp-page|single|loop)"[^>]*>([\s\S]*)/i);
      
      if (otherElementorMatch) {
        const otherStartPos = otherTitleIndex + otherAfterTitle.indexOf(otherElementorMatch[0]) + otherElementorMatch[0].length;
        const otherEndMarkers = [
          otherHtml.indexOf('</main>', otherStartPos),
          otherHtml.indexOf('<footer', otherStartPos),
        ].filter(pos => pos !== -1 && pos > otherStartPos);
        
        if (otherEndMarkers.length > 0) {
          const otherEndPos = Math.min(...otherEndMarkers);
          const otherExtracted = otherHtml.substring(otherStartPos, otherEndPos);
          const otherTextContent = otherExtracted.replace(/<[^>]*>/g, '').trim();
          
          console.log(`✅ Contenu extrait (page 2):`);
          console.log(`   Longueur HTML: ${otherExtracted.length} caractères`);
          console.log(`   Longueur texte: ${otherTextContent.length} caractères`);
          console.log(`   Extrait texte (200 premiers):`);
          console.log(`   ${otherTextContent.substring(0, 200)}...\n`);
          
          // Comparer
          if (extracted.length === otherExtracted.length) {
            console.log('⚠️ ATTENTION: Les deux pages ont la même longueur de contenu!');
          } else {
            console.log(`✅ Les contenus sont différents (différence: ${Math.abs(extracted.length - otherExtracted.length)} caractères)`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testSingleExtraction();

