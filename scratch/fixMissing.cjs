const fs = require('fs');

const path = 'd:/Ashik Protflio/Portfolio/src/config/siteConfig.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /"title": "কীটনাশক দোকান ERP \(Pesticide Retail ERP\)",\s*"category": "Web Dev",\s*"liveUrl": "https:\/\/appletraders\.store\/",\s*"description": "([^"]+)",/,
    `"title": "কীটনাশক দোকান ERP (Pesticide Retail ERP)",
      "caseStudySlug": "pesticide-erp",
      "image": "/assets/screenshots/pesticide-erp/mockup.png",
      "category": "Web Dev",
      "liveUrl": "https://appletraders.store/",
      "description": "$1",`
);

content = content.replace(
    /"title": "CDS Membership Portal – Dynamic & Secure Application System",\s*"category": "Web Dev",\s*"liveUrl": "https:\/\/membership\.fuminds\.com\/",\s*"description": "([^"]+)",/,
    `"title": "CDS Membership Portal – Dynamic & Secure Application System",
      "caseStudySlug": "cds-membership-portal",
      "image": "/assets/screenshots/cds-membership-portal/mockup.png",
      "category": "Web Dev",
      "liveUrl": "https://membership.fuminds.com/",
      "description": "$1",`
);

content = content.replace(
    /"title": "Search Engine Optimization \(SEO\)",\s*"issuer": "SEO Expate Bangladesh Ltd.",/,
    `"title": "Search Engine Optimization (SEO)",
      "caseStudySlug": "local-retail-seo",
      "issuer": "SEO Expate Bangladesh Ltd.",`
);

content = content.replace(
    /"title": "Website Design & WordPress Customization",\s*"issuer": "Institute of Technical & IT",/,
    `"title": "Website Design & WordPress Customization",
      "caseStudySlug": "corporate-redesign",
      "issuer": "Institute of Technical & IT",`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated projects and certifications successfully.");
