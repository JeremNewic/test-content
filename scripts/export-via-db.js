/**
 * Script pour exporter depuis la base de données MySQL
 * Nécessite un accès à la base de données WordPress
 * 
 * Installation: npm install mysql2
 */

import mysql from 'mysql2/promise';
import fs from 'fs';

// Configuration de la base de données
// À adapter selon votre configuration
const DB_CONFIG = {
  host: 'localhost', // Ou l'IP du serveur
  user: 'root',
  password: 'votre-password',
  database: 'nom-de-la-base-wordpress',
  port: 3306
};

const EXPORT_DIR = './exports';
const ACTUALITES_FILE = `${EXPORT_DIR}/actualites-db.json`;

async function exportFromDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connexion à la base de données...\n');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connecté à la base de données\n');

    // Récupérer toutes les actualités avec leur contenu
    // On récupère aussi les meta Elementor au cas où le contenu y serait
    const [rows] = await connection.execute(`
      SELECT 
        p.ID as id,
        p.post_title as title,
        p.post_content as content,
        p.post_excerpt as excerpt,
        p.post_date as date,
        p.post_date_gmt as date_gmt,
        p.post_modified as modified,
        p.post_name as slug,
        p.post_status as status,
        p.post_type as type,
        pm_thumb.meta_value as featured_media,
        pm_elementor.meta_value as elementor_data
      FROM wp_posts p
      LEFT JOIN wp_postmeta pm_thumb ON (
        p.ID = pm_thumb.post_id 
        AND pm_thumb.meta_key = '_thumbnail_id'
      )
      LEFT JOIN wp_postmeta pm_elementor ON (
        p.ID = pm_elementor.post_id 
        AND pm_elementor.meta_key = '_elementor_data'
      )
      WHERE p.post_type = 'actualites'
      AND p.post_status = 'publish'
      ORDER BY p.post_date DESC
    `);

    console.log(`📦 ${rows.length} actualité(s) trouvée(s)\n`);

    // Formater les données comme l'API REST
    const actualites = rows.map(row => {
      // Si le contenu est vide mais qu'on a des données Elementor, on les note
      let content = row.content || '';
      if (!content && row.elementor_data) {
        try {
          const elementorData = JSON.parse(row.elementor_data);
          // Elementor stocke le contenu dans une structure JSON complexe
          // On note qu'il y a des données Elementor
          content = '[Elementor Content - nécessite traitement spécial]';
        } catch (e) {
          // Ignorer si ce n'est pas du JSON valide
        }
      }
      
      return {
        id: row.id,
        title: {
          rendered: row.title
        },
        content: {
          rendered: content,
          raw: content
        },
        excerpt: {
          rendered: row.excerpt || '',
          raw: row.excerpt || ''
        },
        date: row.date,
        date_gmt: row.date_gmt,
        modified: row.modified,
        slug: row.slug,
        status: row.status,
        type: row.type,
        featured_media: row.featured_media ? parseInt(row.featured_media) : 0,
        // Ajouter les données Elementor si présentes
        elementor_data: row.elementor_data || null
      };
    });

    // Créer le dossier d'export
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }

    // Sauvegarder
    fs.writeFileSync(ACTUALITES_FILE, JSON.stringify(actualites, null, 2));
    
    console.log(`✅ Export terminé!`);
    console.log(`📁 Fichier sauvegardé: ${ACTUALITES_FILE}`);
    console.log(`📊 ${actualites.length} actualité(s) exportée(s) avec contenu complet\n`);

    // Afficher un résumé
    const withContent = actualites.filter(a => {
      const content = a.content.rendered || '';
      return content && content.length > 0 && !content.includes('[Elementor Content');
    });
    const withElementor = actualites.filter(a => a.elementor_data);
    console.log(`📋 Résumé:`);
    console.log(`   - Total: ${actualites.length}`);
    console.log(`   - Avec contenu standard: ${withContent.length}`);
    console.log(`   - Avec données Elementor: ${withElementor.length}`);
    console.log(`   - Sans contenu: ${actualites.length - withContent.length - withElementor.length}`);
    
    if (withElementor.length > 0) {
      console.log(`\n⚠️  ${withElementor.length} actualité(s) utilisent Elementor`);
      console.log(`   Le contenu est dans les meta Elementor, pas dans post_content`);
      console.log(`   Il faudra peut-être utiliser l'extraction HTML pour ces pages`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Vérifiez:');
      console.log('   - Que MySQL est accessible');
      console.log('   - Les credentials dans le script');
      console.log('   - Que le nom de la base de données est correct');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Lancer l'export
exportFromDatabase().catch(console.error);

