const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/config/siteConfig.ts');
let configContent = fs.readFileSync(configPath, 'utf8');

const newCaseStudy = {
  "slug": "design-inspector",
  "image": "",
  "category": "Chrome Extension",
  "title": "Design Inspector \u2014 Glass Edition",
  "subtitle": "A premium Chrome extension that transforms any webpage into an inspectable design canvas with a glassmorphism UI.",
  "role": "Solo Developer & Designer",
  "status": "Completed & Production-Ready",
  "completionProgress": {
    "backend": 100,
    "frontend": 100
  },
  "techStack": {
    "frontend": ["JavaScript (Vanilla)", "HTML5", "CSS3 (Glassmorphism)"],
    "backend": ["Chrome Extension APIs", "Service Workers"],
    "infrastructure": ["Chrome Web Store", "Manifest V3"]
  },
  "summary": "Design Inspector \u2014 Glass Edition is a premium Chrome extension that reimagines web inspection as a design-first experience. It provides 6 integrated inspection modes (Element, Typography, Color, Assets, Accessibility, DOM) within a stunning glassmorphism Side Panel. Built with zero dependencies, it bridges the gap between design and development workflows by replacing raw DevTools data with curated design tokens.",
  "challenge": {
    "description": "Designers, frontend developers, and QA specialists frequently need to inspect visual properties of live websites. However, existing tools like Chrome DevTools treat this as a debugging task, presenting raw, complex data scattered across multiple panels, which creates friction when you just need to extract a color palette, check WCAG contrast, or audit typography.",
    "objectives": [
      "Create a designer-first UI using a premium glassmorphism aesthetic.",
      "Extract and curate design tokens (fonts, colors, spacing) in one click.",
      "Automate WCAG 2.1 accessibility audits instead of manual testing.",
      "Ensure robust cross-origin injection using Manifest V3 and isolated content scripts."
    ]
  },
  "architectureAndSecurity": {
    "title": "Technical Architecture & Implementation",
    "points": [
      {
        "title": "Three-Hop Messaging Architecture",
        "description": "Implemented robust communication between the Chrome Side Panel, background service worker, and isolated content scripts. Handled edge cases where content scripts fail to inject on restricted pages using a PING/PONG health check pattern."
      },
      {
        "title": "DOM-Walking Background Resolution",
        "description": "Naive background-color extraction often fails due to inherited transparent layers. Implemented a recursive DOM-walking algorithm to accurately resolve the effective background color for precise WCAG contrast ratio calculations."
      },
      {
        "title": "Performance-Conscious Extraction",
        "description": "To prevent UI jank on complex pages with thousands of elements, heavy DOM scans run off-panel in the content script thread. Asset and color scans limit output to top results, and the DOM tree visualizer caps at depth 6."
      },
      {
        "title": "Z-Index Overlay Conflict Resolution",
        "description": "Engineered the highlight overlay to appear above all page content (modals, sticky headers) using max z-index (2147483647) and pointer-events: none, ensuring it never intercepts actual user interactions with the page."
      }
    ]
  },
  "keyFeatures": [
    {
      "title": "Element Inspector & Token Extraction",
      "description": "Point-and-click extraction of 25+ computed CSS properties including typography tokens, color swatches, spacing (margin/padding), and advanced CSS like gradients and shadows."
    },
    {
      "title": "Full-Page Typography & Color Scanners",
      "description": "Automatically catalogs all font families, sizes, weights, text colors, background colors, and gradients used across the entire page, sorted by frequency."
    },
    {
      "title": "WCAG 2.1 Accessibility Audit",
      "description": "One-click compliance scan checking for 7 rule categories including missing alt text, unlabelled inputs, skipped heading levels, and contrast ratio failures."
    },
    {
      "title": "Interactive DOM Tree & CSS Variables",
      "description": "Visual, collapsible DOM tree and a bottom drawer that surfaces and previews CSS custom properties used by the inspected element."
    }
  ],
  "outcomes": [
    "Developed 2,200+ lines of zero-dependency vanilla JS/CSS.",
    "Authored a production-grade 50+ token glassmorphism CSS design system (938 lines).",
    "Successfully architected a Manifest V3 compliant extension with proper service worker lifecycles.",
    "Transformed a scattered debugging task into a cohesive, design-first token extraction workflow."
  ]
};

const jsonString = JSON.stringify(newCaseStudy, null, 6);
// The indentation is 6 spaces because the caseStudies array is indented with 4, so items are 6 (or 4). 
// Let's format it slightly to match the TS file indentation (usually 4 spaces for array items).
const formattedJsonString = jsonString.split('\n').map((line, index) => index === 0 ? `    ${line}` : `  ${line}`).join('\n') + ',';

if (configContent.includes('"slug": "design-inspector"')) {
    console.log("Case study already exists!");
    process.exit(0);
}

const insertionPoint = '  "caseStudies": [';
if (!configContent.includes(insertionPoint)) {
    console.error("Could not find 'caseStudies' array!");
    process.exit(1);
}

configContent = configContent.replace(
    insertionPoint,
    `${insertionPoint}\n${formattedJsonString}`
);

fs.writeFileSync(configPath, configContent, 'utf8');
console.log("Successfully added the case study!");
