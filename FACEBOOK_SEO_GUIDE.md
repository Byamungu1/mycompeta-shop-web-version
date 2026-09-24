# Facebook SEO & Social Media Optimization Guide

## Facebook Open Graph Tags Added

### Enhanced Meta Tags in index.html:
- `og:image:width` and `og:image:height` - Ensures proper image dimensions
- `og:image:alt` - Accessibility and SEO
- `og:site_name` - Brand name for Facebook
- `og:locale` - Language setting
- `fb:app_id` - Facebook App ID (add your app ID)
- `fb:admins` - Facebook admin IDs (add your admin IDs)

### Dynamic SEO Component Updates:
- Added `ogType` parameter for different content types
- Added `ogImageWidth`, `ogImageHeight`, `ogImageAlt` for image optimization
- Added `fbAppId` and `fbAdmins` for Facebook-specific features
- Added Twitter site and creator handles
- Enhanced product page SEO with proper `og:type="product"`

### Structured Data Enhancements:
- Added `priceValidUntil` to product offers
- Added `itemCondition` to product offers
- Added `aggregateRating` support for products
- Enhanced organization data with social media links
- Added contact information and address

## Facebook Configuration Steps

### 1. Get Facebook App ID
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add your app ID to the `fb:app_id` meta tag in index.html

### 2. Add Facebook Admins
1. Get your Facebook user ID
2. Add it to the `fb:admins` meta tag in index.html

### 3. Update Social Media Links
Update the `sameAs` array in structured data with your actual social media URLs:
```typescript
"sameAs": [
  "https://www.facebook.com/YOUR_FACEBOOK_PAGE",
  "https://twitter.com/YOUR_TWITTER_HANDLE",
  "https://www.instagram.com/YOUR_INSTAGRAM_HANDLE"
]
```

### 4. Update Contact Information
Update the contact details in structured data:
```typescript
"contactPoint": {
  "contactType": "customer service",
  "email": "your-email@mycompeta.com",
  "telephone": "+254YOUR_NUMBER",
  "areaServed": "KE",
  "availableLanguage": "English"
}
```

## Facebook Sharing Best Practices

### Image Requirements:
- **Size**: 1200 x 630 pixels (1.91:1 aspect ratio)
- **Format**: PNG or JPG
- **File Size**: Under 8MB
- **Content**: High-quality, brand-aligned images

### Content Tips:
- Use compelling titles (max 100 characters)
- Write engaging descriptions (max 300 characters)
- Include your brand name in titles
- Use keywords naturally
- Add clear call-to-actions

### Testing Tools:
1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. **Object Browser**: https://developers.facebook.com/tools/object-browser/
3. **Open Graph Checker**: https://www.opengraph.xyz/

## Facebook Pixel Integration (Optional)

To add Facebook Pixel for tracking:

1. Create a Facebook Pixel in your Facebook Ads Manager
2. Add the Pixel code to index.html before the closing `</head>` tag:
```html
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" 
  src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->
```

## Product Page Facebook Optimization

Product pages now have enhanced Facebook sharing:
- `og:type="product"` for proper product categorization
- Dynamic product images
- Price and availability information
- Product-specific descriptions
- Seller information

## Next Steps

1. **Update Facebook IDs**: Add your actual Facebook App ID and Admin IDs
2. **Create Social Media Pages**: Set up Facebook, Twitter, Instagram pages
3. **Generate OG Images**: Create 1200x630px images for your brand
4. **Test Sharing**: Use Facebook Sharing Debugger to test your pages
5. **Monitor Performance**: Track engagement and shares in Facebook Insights

## Checklist

- [ ] Add Facebook App ID to index.html
- [ ] Add Facebook Admin IDs to index.html  
- [ ] Update social media URLs in structured data
- [ ] Update contact information in structured data
- [ ] Create 1200x630px OG images
- [ ] Test sharing with Facebook Sharing Debugger
- [ ] Add Facebook Pixel (optional)
- [ ] Monitor social media performance