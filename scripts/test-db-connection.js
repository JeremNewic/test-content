/**
 * Script de test pour vérifier la connexion à la base de données
 */

import mysql from 'mysql2/promise';

// Configuration de la base de données
const DB_CONFIG = {
  host: 'localhost', // À adapter
  user: 'root', // À adapter
  password: 'votre-password', // À adapter
  database: 'nom-de-la-base-wordpress', // À adapter
  port: 3306
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔌 Test de connexion à la base de données...\n');
    console.log(`📍 Host: ${DB_CONFIG.host}`);
    console.log(`👤 User: ${DB_CONFIG.user}`);
    console.log(`📊 Database: ${DB_CONFIG.database}\n`);
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connexion réussie!\n');
    
    // Tester une requête simple
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM wp_posts WHERE post_type = "actualites"');
    console.log(`📦 Actualités trouvées: ${rows[0].total}\n`);
    
    // Tester une requête pour voir le contenu
    const [sampleRows] = await connection.execute(`
      SELECT ID, post_title, LENGTH(post_content) as content_length, 
             (SELECT meta_value FROM wp_postmeta WHERE post_id = wp_posts.ID AND meta_key = '_elementor_data' LIMIT 1) as has_elementor
      FROM wp_posts 
      WHERE post_type = 'actualites' 
      AND post_status = 'publish'
      LIMIT 3
    `);
    
    console.log('📋 Échantillon de 3 actualités:');
    sampleRows.forEach((row, i) => {
      console.log(`\n${i + 1}. ${row.post_title}`);
      console.log(`   - ID: ${row.ID}`);
      console.log(`   - Longueur post_content: ${row.content_length} caractères`);
      console.log(`   - Données Elementor: ${row.has_elementor ? '✅ Présentes' : '❌ Absentes'}`);
    });
    
    console.log('\n✅ Test terminé avec succès!');
    console.log('💡 Vous pouvez maintenant lancer: npm run export:db');
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solutions:');
      console.log('   1. Vérifiez que MySQL est accessible depuis votre machine');
      console.log('   2. Si le serveur est distant, vous devrez peut-être:');
      console.log('      - Créer un tunnel SSH');
      console.log('      - Autoriser votre IP dans les paramètres MySQL');
      console.log('      - Utiliser un outil comme phpMyAdmin pour exporter');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Erreur d\'authentification:');
      console.log('   - Vérifiez le username et password');
      console.log('   - Vérifiez que l\'utilisateur a les permissions nécessaires');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Base de données introuvable:');
      console.log('   - Vérifiez le nom de la base de données');
      console.log('   - Le préfixe peut être différent (wp_, wp2_, etc.)');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();

