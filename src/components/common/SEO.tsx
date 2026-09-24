import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogImageWidth?: string;
  ogImageHeight?: string;
  ogImageAlt?: string;
  fbAppId?: string;
  fbAdmins?: string;
}

const SEO = ({ 
  title = 'myCompeta Shop - Buy & Sell Products Online',
  description = 'Discover amazing products at myCompeta Shop. Browse local sellers, find great deals, and shop securely with our trusted e-commerce platform.',
  keywords = 'online shopping, e-commerce, buy products, sell products, local marketplace, shop online, myCompeta, secure shopping, product deals, online marketplace, secure shopping',
  ogImage = 'https://shop.mycompeta.online/images/logo.png',
  ogUrl = 'https://shop.mycompeta.online/',
  ogType = 'website',
  ogImageWidth = '1200',
  ogImageHeight = '630',
  ogImageAlt = 'myCompeta Shop Logo',
  fbAppId = '',
  fbAdmins = ''
}: SEOProps) => {
  useEffect(() => {
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      let element: HTMLMetaElement | null = document.querySelector(
        property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      );
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'myCompeta');

    // Open Graph tags (Facebook & Social Media)
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:image:width', ogImageWidth, true);
    updateMetaTag('og:image:height', ogImageHeight, true);
    updateMetaTag('og:image:alt', ogImageAlt, true);
    updateMetaTag('og:url', ogUrl, true);
    updateMetaTag('og:site_name', 'myCompeta Shop', true);
    updateMetaTag('og:locale', 'en_US', true);

    // Facebook-specific tags
    if (fbAppId) {
      updateMetaTag('fb:app_id', fbAppId, true);
    }
    if (fbAdmins) {
      updateMetaTag('fb:admins', fbAdmins, true);
    }

    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:site', '@myCompetaShop');
    updateMetaTag('twitter:creator', '@myCompetaShop');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', ogUrl);

  }, [title, description, keywords, ogImage, ogUrl, ogType, ogImageWidth, ogImageHeight, ogImageAlt, fbAppId, fbAdmins]);

  return null;
};

export default SEO;