const fs = require('fs');

const path = 'd:/Ashik Protflio/Portfolio/src/config/siteConfig.ts';
let content = fs.readFileSync(path, 'utf8');

// Update Design Inspector Project image
content = content.replace(
    /"title": "Design Inspector — Glass Edition",\s*"caseStudySlug": "design-inspector",\s*"category": "Chrome Extension",\s*"liveUrl": "https:\/\/github.com\/ashrafulalamashik\/design-css-inspector",\s*"description": "Chrome Extension to inspect CSS designs, colors, typography, and spacing on any web page. Easily copy CSS properties and analyze web designs.",\s*"tags": \["Chrome Extension", "JavaScript", "CSS", "HTML5"\],\s*"screenshots": \[\]/,
    `"title": "Design Inspector — Glass Edition",
      "caseStudySlug": "design-inspector",
      "category": "Chrome Extension",
      "liveUrl": "https://github.com/ashrafulalamashik/design-css-inspector",
      "description": "Chrome Extension to inspect CSS designs, colors, typography, and spacing on any web page. Easily copy CSS properties and analyze web designs.",
      "tags": ["Chrome Extension", "JavaScript", "CSS", "HTML5"],
      "image": "/assets/screenshots/design-inspector/mockup.png",
      "screenshots": [
        "/assets/screenshots/design-inspector/mockup.png"
      ]`
);

// Update Design Inspector Case Study image
content = content.replace(
    /"slug": "design-inspector",\s*"image": "",/,
    `"slug": "design-inspector",
        "image": "/assets/screenshots/design-inspector/mockup.png",`
);

// Match other Case Studies to Projects
// We know Case Studies: cds-membership, seo-proposal
// Let's see if we have projects for them and add caseStudySlug

content = content.replace(
    /"title": "CDS Membership & Certificate System",\s*"category": "Full Stack Web App",/g,
    `"title": "CDS Membership & Certificate System",
      "caseStudySlug": "cds-membership",
      "category": "Full Stack Web App",`
);

content = content.replace(
    /"title": "SEO Proposal Website",\s*"category": "Frontend Development",/g,
    `"title": "SEO Proposal Website",
      "caseStudySlug": "seo-proposal",
      "category": "Frontend Development",`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated siteConfig.ts successfully.");
