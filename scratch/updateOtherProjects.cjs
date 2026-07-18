const fs = require('fs');

const path = 'd:/Ashik Protflio/Portfolio/src/config/siteConfig.ts';
let content = fs.readFileSync(path, 'utf8');

const mapping = [
    {
        title: "Future Shop — Multi-Vendor E-Commerce Marketplace",
        slug: "future-shop"
    },
    {
        title: "জনসংযোগ ২৪/৭ — MP Civic Engagement Portal",
        slug: "jonoshongog-portal"
    },
    {
        title: "Search Engine Optimization (SEO)",
        slug: "local-retail-seo"
    },
    {
        title: "Website Design & WordPress Customization",
        slug: "corporate-redesign"
    },
    {
        title: "Esports Tournament Platform",
        slug: "esports-tournament-platform"
    },
    {
        title: "কীটনাশক দোকান ERP (Pesticide Retail ERP)",
        slug: "pesticide-erp"
    },
    {
        title: "CDS Membership Portal – Dynamic & Secure Application System",
        slug: "cds-membership-portal"
    }
];

mapping.forEach(item => {
    // 1. Update Project
    // Look for the title and the next few properties to insert the new properties
    const titleMatch = new RegExp(`("title": "${item.title.replace(/([&()])/, '\\\\$1')}",\\s*"category": "[^"]+",\\s*("liveUrl": "[^"]+",\\s*)?"description": "[^"]+",\\s*"tags": \\[[^\\]]+\\])`);
    
    if (content.match(titleMatch)) {
        content = content.replace(titleMatch, `$1,\n      "caseStudySlug": "${item.slug}",\n      "image": "/assets/screenshots/${item.slug}/mockup.png",\n      "screenshots": [\n        "/assets/screenshots/${item.slug}/mockup.png"\n      ]`);
    } else {
        console.log("Could not match project:", item.title);
    }
    
    // 2. Update Case Study
    // The case study will have "slug": "item.slug" and no image or an empty image.
    // Let's replace: "slug": "slug",\n      "image": "",  OR just insert it if missing.
    // The current format is:
    // "slug": "future-shop",
    // "image": "",
    const csRegex = new RegExp(`("slug": "${item.slug}",\\s*)"image": ""`);
    if (content.match(csRegex)) {
        content = content.replace(csRegex, `$1"image": "/assets/screenshots/${item.slug}/mockup.png"`);
    } else {
        // If image property doesn't exist at all
        const csRegexNoImage = new RegExp(`("slug": "${item.slug}",)`);
        if (content.match(csRegexNoImage)) {
            content = content.replace(csRegexNoImage, `$1\n      "image": "/assets/screenshots/${item.slug}/mockup.png",`);
        } else {
            console.log("Could not match case study slug:", item.slug);
        }
    }
});

fs.writeFileSync(path, content, 'utf8');
console.log("Updated siteConfig.ts successfully.");
