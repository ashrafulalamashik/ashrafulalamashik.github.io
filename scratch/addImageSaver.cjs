const fs = require('fs');

const path = 'd:/Ashik Protflio/Portfolio/src/config/siteConfig.ts';
let content = fs.readFileSync(path, 'utf8');

const newProject = `
    {
      "title": "Image Saver Extension",
      "caseStudySlug": "image-saver",
      "category": "Chrome Extension",
      "liveUrl": "https://github.com/ashrafulalamashik/image-saver-extension",
      "description": "A seamless Chrome Extension that empowers users to save any web image in their preferred format (PNG, JPG, or WebP) directly from the right-click context menu using local on-the-fly conversion.",
      "tags": ["Chrome Extension", "JavaScript", "HTML5 Canvas", "Manifest V3"],
      "image": "/assets/screenshots/image-saver/mockup.png",
      "screenshots": [
        "/assets/screenshots/image-saver/mockup.png"
      ]
    },`;

const newCaseStudy = `
    {
      "slug": "image-saver",
      "image": "/assets/screenshots/image-saver/mockup.png",
      "category": "Chrome Extension",
      "title": "Image Saver Extension",
      "problem": "Web users frequently encounter next-gen image formats like .webp or .avif which aren't always supported by native desktop apps. Converting them requires downloading, opening a conversion tool, and exporting—a tedious and time-consuming process.",
      "solution": "Developed a Chrome extension integrating directly into the browser's context menu. It fetches the image and instantly converts it in the background to PNG, JPG, or WebP using local HTML5 Canvas APIs before triggering a seamless download.",
      "results": ["On-the-fly Local Conversion", "Intelligent SVG Handling", "Smart Filenaming"],
      "summary": "Image Saver is a lightweight, seamless Chrome Extension that empowers users to save any web image in their preferred format directly from the right-click context menu, performing on-the-fly format conversion locally within the browser.",
      "technologies": ["Google Chrome Extensions API (Manifest V3)", "Vanilla JavaScript (ES6+)", "Promises & Async/Await", "HTML5 <canvas>", "Blob & File APIs", "Service Workers & Offscreen Documents"],
      "overview": [
        "Image Saver is a lightweight, seamless Chrome Extension that empowers users to save any web image in their preferred format (PNG, JPG, or WebP) directly from the right-click context menu.",
        "It eliminates the need for third-party converter websites by performing on-the-fly image format conversion locally within the browser."
      ],
      "features": [
        {
          "title": "1-Click Context Menu",
          "description": "Effortlessly save images as PNG (lossless), JPG (smaller file), or WebP (modern format)."
        },
        {
          "title": "On-the-Fly Local Conversion",
          "description": "Uses HTML Canvas for instant format conversion without relying on any external servers (100% privacy-focused)."
        },
        {
          "title": "Smart Filenaming",
          "description": "Automatically extracts the original image name, sanitizes it (removes invalid characters but keeps Unicode intact), and applies the correct file extension."
        },
        {
          "title": "Intelligent SVG Handling",
          "description": "Automatically injects viewport dimensions into dimensionless SVGs to ensure crisp, high-quality rasterization into PNG/JPG."
        },
        {
          "title": "Error Handling & Debounce",
          "description": "Alerts users via Chrome's native Notification API if a conversion fails, and prevents duplicate downloads from rapid double-clicks."
        }
      ],
      "architecture": [
        {
          "title": "Service Workers & Offscreen Documents",
          "description": "Since Manifest V3 removes DOM access from Background Service Workers, I utilized the modern Offscreen Document API. The Service Worker receives the URL and spins up a hidden Offscreen Document which draws the image onto a virtual HTML5 canvas and exports it."
        },
        {
          "title": "Optimized Memory Pipeline",
          "description": "Handling extremely large 4K images crashed the extension when passing massive Base64 Data URLs between scripts. Optimized the pipeline by using URL.createObjectURL(blob) for cross-origin fetches, significantly reducing memory footprint."
        }
      ],
      "installationGuide": {
        "steps": [
          "Download the Code: Click on the green Code button on the repository and select Download ZIP. Extract the ZIP file.",
          "Open Extensions Page: Open Google Chrome and type chrome://extensions/ in the address bar.",
          "Enable Developer Mode: In the top-right corner, toggle the Developer mode switch to ON.",
          "Load the Extension: Click the Load unpacked button that appears in the top-left corner.",
          "Select the Folder: Choose the extracted folder containing the manifest.json file."
        ]
      }
    },`;

// Insert the project just after the "projects": [ array start
content = content.replace(
    /"projects": \[/,
    `"projects": [\n${newProject}`
);

// Insert the case study just after the "caseStudies": [ array start
content = content.replace(
    /"caseStudies": \[/,
    `"caseStudies": [\n${newCaseStudy}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Added Image Saver Project and Case Study successfully.");
