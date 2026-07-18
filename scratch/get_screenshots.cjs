const fs = require('fs');
const content = fs.readFileSync('d:/Ashik Protflio/Portfolio/src/config/siteConfig.ts', 'utf8');
const slugs = ['future-shop', 'jonoshongog-portal', 'esports-tournament-platform', 'pesticide-erp', 'cds-membership-portal'];
for (const slug of slugs) {
    const idx = content.indexOf(`"caseStudySlug": "${slug}"`);
    if (idx !== -1) {
        const substr = content.substring(idx, idx + 800);
        const match = substr.match(/"screenshots": \[([\s\S]*?)\]/);
        if (match) {
            console.log(`SLUG: ${slug}\n${match[1].trim()}`);
        }
    }
}
