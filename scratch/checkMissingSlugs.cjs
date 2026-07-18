const fs = require('fs');
const content = fs.readFileSync('src/config/siteConfig.ts', 'utf8');
const slugs = [
'image-saver', 'qr-screen-scanner', 'design-inspector', 'future-shop',
'jonoshongog-portal', 'local-retail-seo', 'corporate-redesign',
'esports-tournament-platform', 'pesticide-erp', 'cds-membership-portal'
];
slugs.forEach(slug => {
    if (!content.includes('"caseStudySlug": "' + slug + '"')) {
        console.log('MISSING caseStudySlug for: ' + slug);
    }
});
