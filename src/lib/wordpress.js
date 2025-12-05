const WORDPRESS_API_URL = import.meta.env.PUBLIC_WP_API_URL || 'http://test-content.local/wp-json/wp/v2';

export async function getAllPosts(limit = 6) {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?per_page=${limit}&_embed`
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();

    // Vérifier si posts est un tableau
    if (!Array.isArray(posts)) {
      return [];
    }

    return posts.map(post => {
      return {
        id: post.id,
        title: post.title?.rendered || post.title || 'Sans titre',
        slug: post.slug || 'article',
        excerpt: post.excerpt?.rendered || post.excerpt || '',
        date: post.date || '',
        featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
        imageWidth: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.width || 800,
        imageHeight: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.height || 600,
        readingTime: calculateReadingTime(post.content?.rendered || post.excerpt?.rendered || ''),
      };
    });
  } catch (error) {
    return [];
  }
}

function calculateReadingTime(content) {
  if (!content) return '1 min';
  
  const wordsPerMinute = 200;
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.ceil(words / wordsPerMinute) || 1;
  return `${minutes} min`;
}

export async function getPostBySlug(slug) {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?slug=${slug}&_embed`
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    const post = posts[0]; // L'API retourne un tableau même pour un seul article

    if (!post) {
      return null;
    }

    return {
      id: post.id,
      title: post.title?.rendered || 'Sans titre',
      slug: post.slug || 'article',
      excerpt: post.excerpt?.rendered || '',
      date: new Date(post.date).toLocaleDateString('fr-FR'),
      featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
      content: post.content?.rendered || '',
    };
  } catch (error) {
    return null;
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/categories?per_page=100`);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return [];
  }
}

export async function getPostsByCategory(categoryId, limit = 10) {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?categories=${categoryId}&per_page=${limit}&_embed`
    );
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    const posts = await response.json();
    
    if (!Array.isArray(posts)) {
      return [];
    }
    
    return posts.map(post => ({
      id: post.id,
      title: post.title?.rendered || 'Sans titre',
      slug: post.slug || 'article',
      excerpt: post.excerpt?.rendered || '',
      date: post.date || '',
      featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
      imageWidth: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.width || 800,
      imageHeight: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.height || 600,
      readingTime: calculateReadingTime(post.content?.rendered || ''),
    }));
  } catch (error) {
    return [];
  }
}

export async function getTags() {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/tags?per_page=100`);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return [];
  }
}

export async function getPages() {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/pages?per_page=100`);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    return [];
  }
}

/**
 * Récupère toutes les actualités depuis WordPress
 * Supporte plusieurs méthodes selon la configuration WordPress :
 * 1. Custom Post Type "actualites" (prioritaire)
 * 2. Plugin ACF to REST API (endpoint /acf/v3/posts)
 * 3. Posts standards avec ACF
 */
export async function getAllActualites(limit = 100) {
  try {
    const baseUrl = WORDPRESS_API_URL.replace('/wp/v2', '');
    
    // Méthode 1 : Essayer avec le CPT "actualites" (prioritaire)
    let endpoint = `${baseUrl}/wp/v2/actualites?per_page=${limit}&_embed`;
    let response = await fetch(endpoint);
    
    // Méthode 2 : Essayer l'endpoint ACF to REST API
    if (!response.ok) {
      endpoint = `${baseUrl}/acf/v3/posts?per_page=${limit}&_embed`;
      response = await fetch(endpoint);
    }
    
    // Méthode 3 : Essayer les posts standards avec ACF
    if (!response.ok) {
      endpoint = `${WORDPRESS_API_URL}/posts?per_page=${limit}&_embed&acf_format=standard`;
      response = await fetch(endpoint);
    }
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText} sur ${endpoint}`);
    }
    
    const actualites = await response.json();
    
    if (!Array.isArray(actualites)) {
      return [];
    }
    
    return actualites.map(actualite => {
      // Les champs ACF peuvent être dans différentes structures selon le plugin/config
      const acfFields = actualite.acf || actualite.acf_fields || {};
      
      return {
        id: actualite.id,
        title: actualite.title?.rendered || actualite.title || acfFields.titre || 'Sans titre',
        slug: actualite.slug || 'actualite',
        excerpt: actualite.excerpt?.rendered || actualite.excerpt || acfFields.resume || '',
        date: actualite.date || acfFields.date || '',
        content: actualite.content?.rendered || actualite.content || acfFields.contenu || '',
        featuredImage: actualite._embedded?.['wp:featuredmedia']?.[0]?.source_url 
                    || acfFields.image?.url 
                    || acfFields.image_url 
                    || '',
        imageWidth: actualite._embedded?.['wp:featuredmedia']?.[0]?.media_details?.width 
                   || acfFields.image?.width 
                   || 800,
        imageHeight: actualite._embedded?.['wp:featuredmedia']?.[0]?.media_details?.height 
                    || acfFields.image?.height 
                    || 600,
        // Récupérer tous les champs ACF supplémentaires
        acf: acfFields,
        // Métadonnées standard
        categories: actualite.categories || [],
        tags: actualite.tags || [],
        author: actualite._embedded?.author?.[0]?.name || '',
        readingTime: calculateReadingTime(actualite.content?.rendered || acfFields.contenu || ''),
      };
    });
  } catch (error) {
    return [];
  }
}

/**
 * Récupère une actualité par son slug
 */
export async function getActualiteBySlug(slug) {
  try {
    const baseUrl = WORDPRESS_API_URL.replace('/wp/v2', '');
    
    // Essayer d'abord avec le CPT "actualites"
    let response = await fetch(
      `${baseUrl}/wp/v2/actualites?slug=${slug}&_embed`
    );
    
    if (!response.ok) {
      response = await fetch(
        `${baseUrl}/acf/v3/posts?slug=${slug}&_embed`
      );
    }
    
    if (!response.ok) {
      response = await fetch(
        `${WORDPRESS_API_URL}/posts?slug=${slug}&_embed&acf_format=standard`
      );
    }
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    
    const actualites = await response.json();
    const actualite = actualites[0];
    
    if (!actualite) {
      return null;
    }
    
    const acfFields = actualite.acf || actualite.acf_fields || {};
    
    return {
      id: actualite.id,
      title: actualite.title?.rendered || actualite.title || acfFields.titre || 'Sans titre',
      slug: actualite.slug || 'actualite',
      excerpt: actualite.excerpt?.rendered || actualite.excerpt || acfFields.resume || '',
      date: new Date(actualite.date || acfFields.date).toLocaleDateString('fr-FR'),
      content: actualite.content?.rendered || actualite.content || acfFields.contenu || '',
      featuredImage: actualite._embedded?.['wp:featuredmedia']?.[0]?.source_url 
                  || acfFields.image?.url 
                  || acfFields.image_url 
                  || '',
      acf: acfFields,
      categories: actualite.categories || [],
      tags: actualite.tags || [],
      author: actualite._embedded?.author?.[0]?.name || '',
    };
  } catch (error) {
    return null;
  }
}

/**
 * Fonction de debug pour explorer la structure des données ACF
 * Utile pour comprendre comment les champs sont organisés dans votre WordPress
 */
export async function debugACFStructure(limit = 1) {
  try {
    const baseUrl = WORDPRESS_API_URL.replace('/wp/v2', '');
    
    // Tester différents endpoints
    const endpoints = [
      { name: 'ACF to REST API (posts)', url: `${baseUrl}/acf/v3/posts?per_page=${limit}` },
      { name: 'Custom Post Type actualites', url: `${baseUrl}/wp/v2/actualites?per_page=${limit}&_embed` },
      { name: 'Posts standards avec ACF', url: `${WORDPRESS_API_URL}/posts?per_page=${limit}&_embed` },
      { name: 'Test connexion WordPress', url: `${baseUrl}/wp/v2` },
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        // Continue avec le prochain endpoint
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}