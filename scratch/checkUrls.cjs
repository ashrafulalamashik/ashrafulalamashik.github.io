const fs = require('fs');
const content = fs.readFileSync('src/config/siteConfig.ts', 'utf8');
const match = content.match(/"caseStudies": \[([\s\S]+)\]/);
const arr = eval('[' + match[1].replace(/,\s*$/, '') + ']');
arr.forEach(s => console.log(s.slug, s.liveUrl, s.githubUrl));
