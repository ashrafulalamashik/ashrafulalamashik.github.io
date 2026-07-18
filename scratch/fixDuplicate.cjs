const fs = require('fs');

const path = 'd:/Ashik Protflio/Portfolio/src/config/siteConfig.ts';
let content = fs.readFileSync(path, 'utf8');

// Fix future-shop duplicate screenshots
const duplicateScreenshotsRegex = /("image": "\/assets\/screenshots\/future-shop\/mockup.png",\s*)"screenshots": \[\s*"\/assets\/screenshots\/future-shop\/mockup.png"\s*\],\s*"screenshots": \[/;

if (content.match(duplicateScreenshotsRegex)) {
    content = content.replace(duplicateScreenshotsRegex, `$1"screenshots": [\n        "/assets/screenshots/future-shop/mockup.png",`);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Fixed future-shop duplicate screenshots.");
} else {
    console.log("Could not find the duplicate screenshots pattern in future-shop.");
}
