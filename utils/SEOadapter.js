class SEOAdapter {
  constructor(data) {
    this.data = {
      title: data.title,
      desc: data.description,
      url: data.url,
      image: data.image,
      type: data.type || 'Article', // 'Article', 'Product', 'WebPage'
      published: data.date || new Date().toISOString()
    };
  }

  // 1. Генерация Open Graph (плоский список тегов)
  getOG() {
    const mapping = {
      'og:title': this.data.title,
      'og:description': this.data.desc,
      'og:url': this.data.url,
      'og:image': this.data.image,
      'og:type': this.data.type === 'Article' ? 'article' : 'website',
      'article:published_time': this.data.published
    };

    return Object.entries(mapping)
      .map(([prop, val]) => `<meta property="${prop}" content="${val}">`)
      .join('\n');
  }

  // 2. Генерация JSON-LD (вложенный объект)
  getJSONLD() {
    const schema = {
      "@context": "https://schema.org",
      "@type": this.data.type,
      "headline": this.data.title,
      "description": this.data.desc,
      "image": this.data.image,
      "datePublished": this.data.published,
      "author": { "@type": "Organization", "name": "Ваш Бренд" }
    };

    // // Внутри метода serializeToLinkedData()
    // const schema = {
    //   "@context": "https://schema.org",
    //   "@type": this.data.type, // например, 'TechArticle'
    //   "headline": this.data.title,
    //   // Вместо SEO-воды пишем сухие факты для ИИ
    //   "abstract": this.data.aiSummary, 
    //   "description": this.data.desc, // старый добрый дескрипшн для Google
    //   "keywords": this.data.tags.join(', ') // ИИ на них смотрит как на семантические облака
    // };

    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  }
}

// --- Использование в шаблоне ---
// const page = new SEOAdapter({
//   title: "Как собрать семантику",
//   description: "Пошаговый гайд по SEO-разметке",
//   url: "https://mysite.com",
//   image: "https://mysite.com",
//   type: "NewsArticle"
// });

