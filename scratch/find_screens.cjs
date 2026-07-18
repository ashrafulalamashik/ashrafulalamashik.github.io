const fs = require('fs');
const content = fs.readFileSync('src/config/siteConfig.ts', 'utf8');
const regex = /"\/assets\/screenshots\/([^\/]+)\/([^\"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
    if (['jonoshongog-portal', 'esports-tournament-platform', 'comilla10', 'esports-platform'].includes(match[1])) {
        console.log(match[0]);
    }
}
