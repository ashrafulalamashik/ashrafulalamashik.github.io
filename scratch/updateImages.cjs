const fs = require('fs');

const path = 'd:/Ashik Protflio/Portfolio/src/config/siteConfig.ts';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    {
        pattern: /"image": "\/assets\/screenshots\/future-shop\/mockup.png"/g,
        replacement: '"image": "/assets/screenshots/future-shop/Homepage.png"'
    },
    {
        pattern: /"image": "\/assets\/screenshots\/pesticide-erp\/mockup.png"/g,
        replacement: '"image": "/assets/screenshots/pesticide-erp/dashboard.png"'
    },
    {
        pattern: /"image": "\/assets\/screenshots\/cds-membership-portal\/mockup.png"/g,
        replacement: '"image": "/assets/screenshots/cds-membership/Homepage.png"'
    }
];

replacements.forEach(rep => {
    content = content.replace(rep.pattern, rep.replacement);
});

fs.writeFileSync(path, content, 'utf8');
console.log("Updated featured images to use original screenshots.");
