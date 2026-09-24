# Google Search Console Setup & Indexing Guide

## Step 1: Set Up Google Search Console

### 1.1 Create Account
1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Sign in with your Google account
3. Click "Add a property" (top left)
4. Choose "URL prefix" option
5. Enter your domain: `https://shop.mycompeta.online/`
6. Click "Continue"

### 1.2 Verify Domain Ownership

#### Option A: HTML File Upload (Recommended)
1. In Search Console, choose "HTML file" verification method
2. Download the verification HTML file
3. Add it to your project's public directory
4. Update nginx.conf to serve the verification file

**Steps to implement:**
```bash
# Create verification file in your project
# (You'll get the exact filename from Google)
```

**Add to nginx.conf:**
```nginx
location = /google[verification-code].html {
    try_files $uri /google[verification-code].html;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

#### Option B: DNS Verification (Alternative)
1. Choose "DNS record" verification method
2. Add the TXT record to your domain's DNS settings
3. Wait for DNS propagation (can take up to 48 hours)
4. Click "Verify" in Search Console

#### Option C: Google Analytics (If you have GA)
1. If you already have Google Analytics set up
2. Choose "Google Analytics" verification method
3. Click "Verify"

## Step 2: Submit Your Sitemap

### 2.1 Add Sitemap to Search Console
1. In Search Console, select your property
2. Go to "Sitemaps" in the left sidebar
3. Enter your sitemap URL: `sitemap.xml`
4. Click "Submit"

### 2.2 Verify Sitemap Status
1. Wait a few hours for processing
2. Check the "Sitemaps" section for status
3. Look for "Success" status with number of discovered URLs
4. Fix any errors if they appear

## Step 3: Request Indexing

### 3.1 Inspect URL
1. In Search Console, go to "URL Inspection"
2. Enter your homepage: `https://shop.mycompeta.online/`
3. Press Enter
4. Click "Request Indexing"

### 3.2 Index Important Pages
Repeat URL inspection and indexing for:
- Homepage: `https://shop.mycompeta.online/`
- Buyer page: `https://shop.mycompeta.online/buyer`
- Seller page: `https://shop.mycompeta.online/seller`
- A few key product pages

### 3.3 Monitor Indexing Status
1. Check "Coverage" report in Search Console
2. Look for "Valid" pages
3. Address any errors or warnings
4. Monitor indexing progress over days/weeks

## Step 4: Monitor Performance

### 4.1 Key Reports to Check
- **Coverage**: See which pages are indexed
- **Performance**: Track clicks, impressions, CTR
- **Mobile Usability**: Check mobile-friendliness
- **Core Web Vitals**: Monitor page experience metrics

### 4.2 Set Up Alerts
1. Go to "Settings" in Search Console
2. Enable email notifications for:
   - Coverage issues
   - Security issues
   - Manual actions

## Step 5: Common Issues & Solutions

### Issue: "Page not found" errors
**Solution**: Check your nginx.conf routing and ensure all URLs in sitemap.xml are accessible

### Issue: "Submitted URL has crawl issue"
**Solution**: Check server logs, ensure your site is accessible and not blocking crawlers

### Issue: "Indexed, not submitted in sitemap"
**Solution**: This is normal - Google discovered pages through links. Consider adding them to sitemap

### Issue: Slow indexing
**Solution**: Indexing can take days to weeks. Ensure:
- High-quality content
- Good page speed
- Mobile-friendly design
- Proper internal linking

## Step 6: Ongoing Optimization

### Weekly Tasks
- Check Performance report
- Monitor new indexing issues
- Review search analytics

### Monthly Tasks
- Update sitemap if you add major sections
- Review and fix coverage issues
- Analyze search queries for content opportunities

### Quarterly Tasks
- Review overall SEO performance
- Update meta tags based on performance
- Plan content strategy based on search data

## Quick Checklist

- [ ] Create Google Search Console account
- [ ] Add property: https://shop.mycompeta.online/
- [ ] Verify domain ownership
- [ ] Submit sitemap: sitemap.xml
- [ ] Request indexing for homepage
- [ ] Request indexing for key pages
- [ ] Check Coverage report
- [ ] Monitor Performance report
- [ ] Set up email alerts
- [ ] Fix any immediate issues

## Expected Timeline

- **Day 1**: Setup and verification
- **Day 2-3**: Sitemap processing
- **Day 3-7**: Initial indexing of homepage
- **Week 2-4**: Broader indexing of site
- **Month 1-3**: Significant search traffic growth

## Pro Tips

1. **Be Patient**: SEO results take time - don't expect immediate ranking
2. **Quality Over Quantity**: Focus on creating great user experiences
3. **Mobile First**: Ensure your site works perfectly on mobile
4. **Page Speed**: Fast-loading pages rank better
5. **Regular Updates**: Keep content fresh and regularly updated

## Troubleshooting

If you encounter issues:

1. **Check robots.txt**: Ensure it's not blocking important pages
2. **Verify Sitemap**: Ensure sitemap.xml is accessible
3. **Check Server Logs**: Look for crawl errors
4. **Test with Tools**: Use Google's Rich Results Test
5. **Mobile-Friendly Test**: Ensure mobile optimization

## Additional Resources

- [Google Search Console Help](https://support.google.com/webmasters/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)