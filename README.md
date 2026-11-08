# i2P: Idea to Prototype

**i2P** is an AI-powered engineering platform that helps people turn an engineering idea into a realistic prototype: a 3D visualisation, circuit design, component list and starter code.

This repository contains the **pre-launch website** for i2P. It introduces the product, shows how it works through an interactive walkthrough, counts down to launch and collects sign-ups for a waiting list.

> **Official launch:** 1 January 2027

---

## Features

### Website
- **Interactive hero** with Idea, Concept and Prototype views and an animated headline
- **How It Works walkthrough** in five clickable stages, with technical drawings that can be enlarged
- **One plain-English example** followed from idea to finished device
- **Live launch countdown** to 1 January 2027, 00:00 (Africa/Harare, UTC+2), calculated in the browser
- **Waiting list form** with validation, loading and success/error messages and duplicate-email protection
- **Dark, light and system themes**, remembered between visits
- **Fully responsive**, with a mobile menu, eased scrolling and a back-to-top button
- **SEO ready**: meta tags, Open Graph and Twitter cards, schema.org structured data, `sitemap.xml` and `robots.txt`
- **HTTPS enforced** with a redirect and an upgrade-insecure-requests policy

### What i2P is designed to do
- AI project interpretation from plain-English descriptions
- Engineering design: inputs, processes and outputs
- Realistic 3D visualisation and installation environment preview
- Circuit design and component identification
- Bill of materials
- Starter code generation
- Engineering documentation

> The drawings on the site are illustrative samples prepared for the page. They are not live AI output.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 (custom properties, no framework) |
| Behaviour | Vanilla JavaScript, no build step |
| Icons | [Lucide](https://lucide.dev) via CDN |
| Fonts | DM Sans and Outfit via Google Fonts |
| Waiting list storage | Google Sheets with Google Apps Script |
| Hosting | GitHub Pages (static) |

There is no backend server, database, package manager or build process.

---

## Project structure

```
.
├── index.html            Page markup, meta tags and structured data
├── style.css             Styles and themes
├── script.js             Interactivity and configuration (CONFIG at the top)
├── sitemap.xml           Sitemap for search engines
├── robots.txt            Crawler rules
├── SETUP.md              Detailed setup and deployment guide
├── apps-script/
│   └── Code.gs           Google Apps Script for the waiting list
└── assets/
    ├── img/              Technical drawings (SVG)
    └── *.png             Logos, favicons and social share image
```

---

## Getting started

No installation is needed. Clone the repository and open `index.html` in a browser.

```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>
```

To run it through a local server:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

---

## Configuration

Settings are in the `CONFIG` block at the top of `script.js`:

| Setting | Purpose |
| --- | --- |
| `APPS_SCRIPT_URL` | Web App URL of the deployed Google Apps Script that stores waiting-list sign-ups |
| `LAUNCH_ISO` | Launch date and time, with an explicit time zone offset |
| `RESPECT_REDUCED_MOTION` | Whether to switch off animations for visitors who request reduced motion |

Until `APPS_SCRIPT_URL` is set, the form tells visitors that sign-ups are not being saved yet rather than pretending they were.

The site address used in the meta tags, sitemap and robots file is a placeholder that must be replaced with your own. See [SETUP.md](SETUP.md).

---

## Deployment

The site is static and works on GitHub Pages without any configuration.

1. Push the files to the root of the `main` branch.
2. Open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
4. Tick **Enforce HTTPS**.

For the waiting list backend, SEO checklist and permissions details, follow [SETUP.md](SETUP.md).

---

## Privacy and security

- No credentials, API keys or secrets are stored in the website code.
- The waiting-list script is limited to a single spreadsheet and validates every submission on the server, including duplicate checks.
- The site stores only the visitor's theme preference in their browser. It uses no tracking cookies.

---

## Browser support

Current versions of Chrome, Edge, Firefox and Safari, on desktop and mobile.

---

## License

Copyright (c) 2026 i2P. All rights reserved.
