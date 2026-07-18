const fs = require('fs');
const content = fs.readFileSync('src/config/siteConfig.ts', 'utf8');
const match = content.match(/"title": "QR Screen Scanner"[\s\S]*?\}/);
if (match) console.log(match[0]);
