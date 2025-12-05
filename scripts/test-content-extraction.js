/**
 * Script de test pour vérifier l'extraction du contenu depuis le HTML
 */

const ACTUALITE_URL = 'https://fo-groupebouygues.com/actualites/newsletter-novembre-2025/';

async function testExtraction() {
  try {
    console.log('🔍 Test d\'extraction du contenu depuis le HTML...\n');
    console.log(`📍 URL: ${ACTUALITE_URL}\n`);
    
    const htmlResponse = await fetch(ACTUALITE_URL);
    if (!htmlResponse.ok) {
      throw new Error(`Erreur ${htmlResponse.status}`);
    }
    
    const html = await htmlResponse.text();
    console.log(`📄 HTML récupéré: ${html.length} caractères\n`);
    
    // Tester différentes méthodes d'extraction
    console.log('🧪 Test des différentes méthodes d\'extraction:\n');
    
    // Méthode 1: Elementor
    const elementorMatch = html.match(/<div[^>]*data-elementor-type="[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (elementorMatch) {
      console.log(`1. Elementor (premier match):`);
      console.log(`   Longueur: ${elementorMatch[1].length} caractères`);
      console.log(`   Extrait: ${elementorMatch[1].substring(0, 150).replace(/\s+/g, ' ')}...\n`);
    }
    
    // Méthode 2: Tous les divs Elementor (chercher le plus long)
    const allElementorMatches = html.matchAll(/<div[^>]*data-elementor-type="[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
    let longestElementor = '';
    for (const match of allElementorMatches) {
      if (match[1].length > longestElementor.length) {
        longestElementor = match[1];
      }
    }
    if (longestElementor) {
      console.log(`2. Elementor (le plus long):`);
      console.log(`   Longueur: ${longestElementor.length} caractères`);
      console.log(`   Extrait: ${longestElementor.substring(0, 150).replace(/\s+/g, ' ')}...\n`);
    }
    
    // Méthode 3: Chercher le contenu principal (entre header et footer)
    const mainContentMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                            html.match(/<div[^>]*id="main"[^>]*>([\s\S]*?)<\/div>/i) ||
                            html.match(/<div[^>]*class="[^"]*main[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (mainContentMatch) {
      console.log(`3. Contenu principal (main):`);
      console.log(`   Longueur: ${mainContentMatch[1].length} caractères`);
      console.log(`   Extrait: ${mainContentMatch[1].substring(0, 150).replace(/\s+/g, ' ')}...\n`);
    }
    
    // Méthode 4: Chercher dans .entry-content
    const entryContentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (entryContentMatch) {
      console.log(`4. Entry content:`);
      console.log(`   Longueur: ${entryContentMatch[1].length} caractères`);
      console.log(`   Extrait: ${entryContentMatch[1].substring(0, 150).replace(/\s+/g, ' ')}...\n`);
    }
    
    // Méthode 5: Chercher le contenu Elementor avec une approche différente
    // Chercher la section Elementor qui contient le plus de texte
    const elementorSections = html.matchAll(/<section[^>]*data-elementor-type="[^"]*"[^>]*>([\s\S]*?)<\/section>/gi);
    let longestSection = '';
    for (const match of elementorSections) {
      const textContent = match[1].replace(/<[^>]*>/g, '').trim();
      if (textContent.length > longestSection.replace(/<[^>]*>/g, '').trim().length) {
        longestSection = match[1];
      }
    }
    if (longestSection) {
      console.log(`5. Section Elementor (avec le plus de texte):`);
      console.log(`   Longueur: ${longestSection.length} caractères`);
      const textOnly = longestSection.replace(/<[^>]*>/g, '').trim();
      console.log(`   Texte seul: ${textOnly.length} caractères`);
      console.log(`   Extrait texte: ${textOnly.substring(0, 200)}...\n`);
    }
    
    // Méthode 6: Chercher entre des balises spécifiques qui contiennent le contenu
    // Souvent le contenu est dans un div avec une classe spécifique au post
    const postContentMatch = html.match(/<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (postContentMatch) {
      console.log(`6. Post content:`);
      console.log(`   Longueur: ${postContentMatch[1].length} caractères`);
      console.log(`   Extrait: ${postContentMatch[1].substring(0, 150).replace(/\s+/g, ' ')}...\n`);
    }
    
    console.log('✅ Test terminé!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testExtraction();

