import fs from 'fs';

const filePath = 'd:/Ashik Protflio/Portfolio/src/config/siteConfig.ts';
let config = fs.readFileSync(filePath, 'utf8');

const replacement = `
        "slug": "design-inspector",
        "image": "",
        "category": "Chrome Extension",
        "title": "Design Inspector — Glass Edition",
        "problem": "Designers and developers lack a unified, visually appealing tool to inspect web design properties directly on the page without dealing with raw DevTools data.",
        "solution": "Built a Manifest V3 Chrome extension with a stunning glassmorphism Side Panel to instantly extract typography, colors, and audit accessibility.",
        "results": ["2,200+ Lines of Vanilla JS/CSS", "50+ Token Design System", "Manifest V3 Compliant"],
`;

config = config.replace(
    /\"slug\": \"design-inspector\",\s*\"image\": \"\",\s*\"category\": \"Chrome Extension\",\s*\"title\": \"Design Inspector — Glass Edition\",/,
    replacement
);

fs.writeFileSync(filePath, config, 'utf8');
console.log("Updated siteConfig.ts successfully.");
