const fs = require('fs');
const content = fs.readFileSync('src/config/siteConfig.ts', 'utf8');
const regex = /"slug": "([^"]+)"[\s\S]*?"image": "([^"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log(match[1] + ' -> ' + match[2]);
}
