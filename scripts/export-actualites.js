import fs from 'fs';

// URL de l'ancien WordPress (celui qui va disparaître)
const PROD_WP_URL = 'https://fo-groupebouygues.com/wp-json/wp/v2';
const ACTUALITES_ENDPOINT = `${PROD_WP_URL}/actualites`;

// Dossier pour stocker les exports
const EXPORT_DIR = './exports';
const ACTUALITES_FILE = `${EXPORT_DIR}/actualites.json`;

// Créer le dossier d'export s'il n'existe pas
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * Exporte les actualités depuis l'ancien WordPress
 * Mode lecture seule - ne modifie rien sur l'ancien site
 */
async function exportActualites(limit = 20, offset = 0) {
  try {
    // Ajouter _fields pour récupérer tous les champs, notamment le contenu
    const url = `${ACTUALITES_ENDPOINT}?per_page=${limit}&offset=${offset}&_embed&context=view`;
    
    console.log(`📡 Récupération depuis: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const actualites = await response.json();

    if (!Array.isArray(actualites)) {
      console.log('⚠️ L\'API n\'a pas retourné un tableau');
      return { count: 0, hasMore: false };
    }

    if (actualites.length === 0) {
      return { count: 0, hasMore: false };
    }

    // Sauvegarder dans un fichier JSON local
    let allActualites = [];
    if (fs.existsSync(ACTUALITES_FILE)) {
      allActualites = JSON.parse(fs.readFileSync(ACTUALITES_FILE, 'utf-8'));
    }
    
    // Ajouter seulement les nouvelles (éviter les doublons par ID)
    const existingIds = new Set(allActualites.map(a => a.id));
    const newActualites = actualites.filter(a => !existingIds.has(a.id));
    
    // Pour chaque nouvelle actualité, récupérer le contenu depuis la page HTML
    console.log(`📥 Récupération du contenu complet pour ${newActualites.length} actualité(s)...`);
    for (let i = 0; i < newActualites.length; i++) {
      const actualite = newActualites[i];
      try {
        // Essayer d'abord l'API REST individuelle
        const detailResponse = await fetch(`${ACTUALITES_ENDPOINT}/${actualite.id}?_embed`);
        if (detailResponse.ok) {
          const detail = await detailResponse.json();
          newActualites[i] = { ...actualite, ...detail };
        }
        
        // Si le contenu n'est toujours pas présent, essayer de le récupérer depuis la page HTML
        if (!newActualites[i].content?.rendered && !newActualites[i].content) {
          if (actualite.link) {
            try {
              const htmlResponse = await fetch(actualite.link);
              if (htmlResponse.ok) {
                const html = await htmlResponse.text();
                
                // Extraire le contenu depuis le HTML
                // Stratégie: extraire tout le contenu entre le titre et le footer, puis nettoyer
                let contentHtml = null;
                
                const articleTitle = actualite.title?.rendered || actualite.title || '';
                const titleIndex = html.indexOf(articleTitle);
                
                if (titleIndex !== -1) {
                  // Trouver le footer pour délimiter la fin
                  const footerIndex = html.indexOf('<footer', titleIndex);
                  const mainEndIndex = html.indexOf('</main>', titleIndex);
                  
                  const endIndex = footerIndex !== -1 ? footerIndex : (mainEndIndex !== -1 ? mainEndIndex : html.length);
                  
                  // Extraire tout le contenu entre le titre et le footer
                  // Commencer un peu après le titre pour éviter d'inclure le titre lui-même
                  const startPos = titleIndex + articleTitle.length + 500; // 500 caractères après le titre
                  const rawContent = html.substring(startPos, endIndex);
                  
                  // Nettoyer: enlever les scripts, styles, et éléments communs
                  let cleanedContent = rawContent
                    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
                    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
                  
                  // Extraire toutes les sections Elementor du contenu nettoyé
                  const elementorSections = [];
                  const sectionRegex = /<section[^>]*data-elementor-type="[^"]*"[^>]*>([\s\S]*?)<\/section>/gi;
                  let match;
                  
                  while ((match = sectionRegex.exec(cleanedContent)) !== null) {
                    const sectionContent = match[1];
                    const textOnly = sectionContent.replace(/<[^>]*>/g, '').trim();
                    
                    // Filtrer: garder seulement les sections avec du texte significatif
                    // et qui ne sont pas des éléments communs (menu, header, etc.)
                    if (textOnly.length > 100 &&
                        !textOnly.toLowerCase().includes('menu') &&
                        !textOnly.toLowerCase().includes('navigation') &&
                        !textOnly.toLowerCase().includes('header') &&
                        !textOnly.toLowerCase().includes('footer')) {
                      elementorSections.push(sectionContent);
                    }
                  }
                  
                  // Si on a des sections Elementor, les combiner
                  if (elementorSections.length > 0) {
                    contentHtml = elementorSections.join('\n');
                  } else {
                    // Sinon, prendre le contenu brut mais limité (pour éviter les headers/footers)
                    // Prendre seulement la partie du milieu qui contient généralement le contenu
                    const textContent = cleanedContent.replace(/<[^>]*>/g, '').trim();
                    if (textContent.length > 500) {
                      // Prendre une portion significative du contenu (éviter le début qui peut contenir des headers)
                      const contentStart = Math.floor(cleanedContent.length * 0.1); // Commencer à 10% du contenu
                      const contentEnd = Math.floor(cleanedContent.length * 0.9); // Finir à 90%
                      contentHtml = cleanedContent.substring(contentStart, contentEnd);
                    }
                  }
                }
                
                // 3. Chercher dans .entry-content ou .post-content (fallback)
                if (!contentHtml || contentHtml.length < 500) {
                  const entryContentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
                  if (entryContentMatch && entryContentMatch[1].length > 500) {
                    contentHtml = entryContentMatch[1];
                  }
                }
                
                // 4. Chercher dans article (fallback)
                if (!contentHtml || contentHtml.length < 500) {
                  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
                  if (articleMatch && articleMatch[1].length > 500) {
                    contentHtml = articleMatch[1];
                  }
                }
                
                if (contentHtml && contentHtml.length > 100) {
                  // Nettoyer le HTML (optionnel - on peut garder le HTML brut)
                  newActualites[i].content = {
                    rendered: contentHtml,
                    raw: contentHtml
                  };
                  console.log(`  ✅ Contenu récupéré depuis HTML (${contentHtml.length} caractères) pour: ${actualite.title?.rendered || actualite.title}`);
                } else {
                  console.log(`  ⚠️ Contenu HTML trop court ou introuvable pour: ${actualite.title?.rendered || actualite.title}`);
                }
              }
            } catch (htmlError) {
              console.log(`  ⚠️ Impossible de récupérer le HTML pour l'actualité ${actualite.id}: ${htmlError.message}`);
            }
          }
        }
        
        // Petite pause pour ne pas surcharger
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`⚠️ Erreur pour l'actualité ${actualite.id}: ${error.message}`);
      }
    }
    
    allActualites = [...allActualites, ...newActualites];
    fs.writeFileSync(ACTUALITES_FILE, JSON.stringify(allActualites, null, 2));
    
    console.log(`✅ ${newActualites.length} nouvelle(s) actualité(s) exportée(s) avec contenu`);
    console.log(`📊 Total dans le fichier: ${allActualites.length}`);
    
    return { 
      count: actualites.length, 
      hasMore: actualites.length === limit
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error.message);
    return { count: 0, hasMore: false };
  }
}

/**
 * Export progressif par lots
 */
async function exportAllProgressively() {
  console.log('🚀 Début de l\'export depuis l\'ancien WordPress...\n');
  console.log(`📍 Source: ${ACTUALITES_ENDPOINT}`);
  console.log('📡 Mode lecture seule - aucune modification sur l\'ancien site\n');
  
  const limit = 20; // Par lots de 20
  let offset = 0;
  let hasMore = true;
  let totalExported = 0;
  
  while (hasMore) {
    const result = await exportActualites(limit, offset);
    
    if (result.count === 0) {
      hasMore = false;
    } else {
      totalExported += result.count;
      offset += limit;
      
      // Pause pour ne pas surcharger l'ancien serveur
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Si on a récupéré moins que le limit, on a tout récupéré
      if (result.count < limit) {
        hasMore = false;
      }
    }
  }
  
  console.log(`\n✅ Export terminé! ${totalExported} actualité(s) exportée(s) au total`);
  console.log(`📁 Fichier sauvegardé: ${ACTUALITES_FILE}`);
  
  // Afficher un résumé
  if (fs.existsSync(ACTUALITES_FILE)) {
    const allActualites = JSON.parse(fs.readFileSync(ACTUALITES_FILE, 'utf-8'));
    console.log(`\n📋 Résumé:`);
    console.log(`   - Total d'actualités exportées: ${allActualites.length}`);
    if (allActualites.length > 0) {
      const dates = allActualites.map(a => a.date).sort();
      console.log(`   - Plus ancienne: ${dates[dates.length - 1]}`);
      console.log(`   - Plus récente: ${dates[0]}`);
    }
  }
}

// Lancer l'export
exportAllProgressively().catch(console.error);

