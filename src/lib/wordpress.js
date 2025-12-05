const WORDPRESS_API_URL = import.meta.env.PUBLIC_WP_API_URL || 'https://astrostarterkit.42web.io/wordpress/wp-json/wp/v2';

export async function getAllPosts(limit = 6) {
  try {
    console.log('Tentative de récupération depuis:', `${WORDPRESS_API_URL}/posts?per_page=${limit}&_embed`);
    
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?per_page=${limit}&_embed`
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();

    // Vérifier si posts est un tableau
    if (!Array.isArray(posts)) {
      console.error('L\'API n\'a pas retourné un tableau:', posts);
      return [];
    }

    return posts.map(post => {
      console.log('Slug:', post.slug); // Déplace le log ici, où post est défini
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
    console.error('Erreur lors de la récupération des posts:', error);
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
    console.error('Erreur lors de la récupération du post:', error);
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
    console.error('Erreur lors de la récupération des catégories:', error);
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
    console.error('Erreur lors de la récupération des posts par catégorie:', error);
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
    console.error('Erreur lors de la récupération des tags:', error);
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
    console.error('Erreur lors de la récupération des pages:', error);
    return [];
  }
}