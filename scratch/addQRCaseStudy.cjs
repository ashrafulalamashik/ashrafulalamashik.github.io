const fs = require('fs');

const path = 'd:/Ashik Protflio/Portfolio/src/config/siteConfig.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the Project to include image, screenshots, and caseStudySlug
content = content.replace(
    /"title": "QR Screen Scanner",\s*"category": "Chrome Extension",\s*"liveUrl": "https:\/\/github.com\/ashrafulalamashik\/qr-screen-scanner",\s*"description": "A Chrome extension to scan QR codes directly from your browser screen without using a mobile device.",\s*"tags": \["Chrome Extension", "JavaScript", "HTML5"\],\s*"screenshots": \[\]/,
    `"title": "QR Screen Scanner",
      "caseStudySlug": "qr-screen-scanner",
      "category": "Chrome Extension",
      "liveUrl": "https://github.com/ashrafulalamashik/qr-screen-scanner",
      "description": "A Chrome extension to scan QR codes directly from your browser screen without using a mobile device.",
      "tags": ["Chrome Extension", "JavaScript", "HTML5"],
      "image": "/assets/screenshots/qr-screen-scanner/mockup.png",
      "screenshots": [
        "/assets/screenshots/qr-screen-scanner/mockup.png"
      ]`
);

// 2. Add the Case Study to the caseStudies array
const newCaseStudy = `
    {
      "slug": "qr-screen-scanner",
      "image": "/assets/screenshots/qr-screen-scanner/mockup.png",
      "category": "Chrome Extension",
      "title": "QR Screen Scanner — Portfolio Case Study",
      "problem": "Users often need to scan a QR code visible on their desktop monitor, but doing so typically requires pulling out a smartphone, which disrupts workflow and decreases productivity.",
      "solution": "Developed a sleek, highly efficient browser extension allowing users to instantly select and scan any QR code area on their screen using client-side decoding with jsQR.",
      "results": ["Instant Drag-and-Select Scanning", "100% Client-Side Privacy", "Smart URL & Text Detection"],
      "summary": "QR Screen Scanner is a modern, glassmorphic Chrome extension that allows users to instantly scan any QR code visible on their screen. It operates entirely client-side using jsQR, ensuring maximum privacy and speed without requiring a mobile device.",
      "technologies": ["HTML5", "CSS3", "Vanilla JavaScript (ES6+)", "Chrome Extension API (Manifest V3)", "jsQR"],
      "overview": [
        "A sleek, highly efficient browser extension that allows users to instantly scan any QR code visible on their screen.",
        "Instead of pulling out a smartphone to scan a desktop monitor, users can simply click the extension, drag to select the QR code area, and instantly get the decoded result.",
        "It is designed with a modern, glassmorphic UI and operates entirely client-side, ensuring maximum privacy and speed."
      ],
      "features": [
        {
          "title": "Drag-and-Select Scanning",
          "description": "An intuitive screen-dimming overlay that lets users precisely crop the QR code area."
        },
        {
          "title": "Instant Client-Side Decoding",
          "description": "Uses jsQR to decode the image data directly in the browser, meaning no data is ever sent to external servers."
        },
        {
          "title": "Smart Results Panel",
          "description": "Automatically detects if the scanned result is a URL or plain text, providing quick-action buttons: Open link, Copy text, and Try again."
        },
        {
          "title": "Performance Optimized",
          "description": "Uses captureVisibleTab for instant screenshotting without requiring heavy permissions."
        },
        {
          "title": "Premium UI/UX",
          "description": "Features a beautiful dark-mode interface with smooth transitions, animated spinners, and error handling states."
        }
      ],
      "futureImprovements": [
        {
          "title": "QR Code Generation",
          "description": "Allow users to type text or paste a URL to generate a QR code instantly."
        },
        {
          "title": "History Log",
          "description": "Save the last 10 scanned QR codes locally for easy access later."
        },
        {
          "title": "Multi-Browser Support",
          "description": "Adapt the manifest for Firefox and Edge Web Stores."
        },
        {
          "title": "Barcode Support",
          "description": "Expand the decoding capabilities to support standard barcodes (EAN, UPC)."
        }
      ],
      "installationGuide": {
        "steps": [
          "Download the qr-scanner-extension.zip file.",
          "Unzip/Extract the file to a folder on your computer (e.g., on your Desktop or Documents).",
          "Open your Google Chrome browser.",
          "Go to Extensions > Manage Extensions (or type chrome://extensions/ in address bar).",
          "Turn on the Developer mode toggle switch in the top-right corner.",
          "Click the Load unpacked button.",
          "Select the extracted folder containing the manifest.json file.",
          "Click the Pin icon next to the extension in the toolbar to use it anytime."
        ]
      }
    },`;

// Find where caseStudies array starts and insert the new case study
content = content.replace(
    /"caseStudies": \[/,
    `"caseStudies": [\n${newCaseStudy}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Added QR Screen Scanner Case Study to siteConfig.ts successfully.");
