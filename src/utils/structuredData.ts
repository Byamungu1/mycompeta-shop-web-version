export const generateProductStructuredData = (product: any) => {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map((img: any) => img.image) || [],
    "description": product.description || product.name,
    "brand": {
      "@type": "Brand",
      "name": product.seller?.shop_name || "myCompeta"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://shop.mycompeta.online/product/${product.id}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": product.seller?.shop_name || "myCompeta"
      },
      "priceValidUntil": "2025-12-31",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "category": product.category?.name || "",
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.review_count || 0
    } : undefined
  };
};

export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "myCompeta Shop",
    "url": "https://shop.mycompeta.online/",
    "logo": "https://shop.mycompeta.online/images/logo.png",
    "description": "Discover amazing products at myCompeta Shop. Browse local sellers, find great deals, and shop securely with our trusted e-commerce platform.",
    "sameAs": [
      "https://www.facebook.com/mycompetashop",
      "https://twitter.com/myCompetaShop",
      "https://www.instagram.com/mycompetashop"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@mycompeta.com",
      "telephone": "+254700000000",
      "areaServed": "KE",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kakuma",
      "addressCountry": "KE"
    }
  };
};

export const generateWebSiteStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "myCompeta Shop",
    "url": "c/",
    "description": "Buy and sell products online with myCompeta Shop - your trusted local marketplace",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://shop.mycompeta.online/buyer/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
};

export const injectStructuredData = (data: any) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};