const fs = require('fs');
const content = fs.readFileSync('src/config/siteConfig.ts', 'utf8');
const caseStudiesIndex = content.indexOf('"caseStudies": [');
const caseStudiesSection = content.substring(caseStudiesIndex);
console.log(caseStudiesSection.match(/"liveUrl":/g));
