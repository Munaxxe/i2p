# i2P · Idea to Prototype · Launch Website

A static, build-free launch site for **i2P**. Pure HTML5, CSS3 and vanilla JavaScript, and it runs straight from `index.html` and deploys to GitHub Pages with no configuration.

**Official launch:** 1 January 2027, 00:00:00 (Africa/Harare, UTC+2)

## Project structure

```
index.html            Page markup (Home · How It Works · Waiting List)
style.css             All styling (dark / light themes)
script.js             Interactivity + CONFIG section at the top
assets/img/           Technical drawings (SVG) used on the page
assets/*.png          Logos, favicons and the social share image (og-image.png)
sitemap.xml           For search engines
robots.txt            For search engines
assets/logo-*.png     Official logo (dark and light versions)
apps-script/Code.gs   Google Apps Script for the waiting list (not served by the site)
```

## The example used throughout

Every visual follows one plain-English idea:
*"I want my bedroom light to turn on when I enter the room, and I also want to control it using my phone."*
The drawings in `assets/img/` (idea, development, concept scene, components, circuit, code, phone app, device outside/inside) are hand-made SVGs, clearly labelled as illustrative. To change the example, edit the SVGs and the quote in `index.html` / `script.js` (`IDEA`).


## 1. Logo

Both versions of the official logo are included, with transparent backgrounds and the tagline removed so it can be shown larger:

- `assets/logo-dark.png` (white lettering) is shown in dark mode
- `assets/logo-light.png` (dark lettering) is shown in light mode

The site switches between them automatically with the theme.

## 2. Run locally

Open `index.html` in a browser. To test with a local server:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## 3. Waiting list setup (Google Sheets + Apps Script)

1. Create a new Google Sheet (e.g. "i2P Waiting List").
2. Choose **Extensions → Apps Script**.
3. Delete any starter code and paste the contents of `apps-script/Code.gs`. Save.
4. Click **Deploy → New deployment → Select type: Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Click **Deploy** and approve the permissions prompt (the script only needs access to this spreadsheet).
6. Copy the **Web app URL** (ends in `/exec`).
7. In `script.js`, paste it into the config block at the top:

   ```js
   const CONFIG = {
     APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
     ...
   };
   ```
8. Visit the URL in your browser: you should see `{"status":"ok", ...}`.
9. Submit a test registration on the site. A `Waitlist` tab is created automatically with columns Timestamp, Name, Email, Organisation, Interest, Source.

**Notes**
- No Google credentials or API keys are in the website. The Web app URL is public by design; it can only append validated rows.
- Duplicates are checked on the server (case-insensitive) and the script uses a lock so simultaneous submissions can't slip through.
- Whenever you change `Code.gs`, use **Deploy → Manage deployments → Edit → New version** so the live URL picks up the change.
- Until `APPS_SCRIPT_URL` is set, the form shows a setup message and does **not** claim to have saved anything.

## 4. Deploy to GitHub Pages

1. Create a repository and push these files to the root of the `main` branch.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
4. After a minute your site is live at `https://<username>.github.io/<repo>/`.

All asset paths are relative, so it works under a repository sub-path or a custom domain.

## 5. Things to customise before launch

- The Privacy Policy text (a template, so have it reviewed for your jurisdiction).

## How the countdown works

`CONFIG.LAUNCH_ISO` is `2027-01-01T00:00:00+02:00`. The explicit offset means every visitor sees the same moment regardless of their own time zone. The remaining time is recalculated from the system clock every second; when it reaches zero the countdown is replaced by **"i2P IS HERE!"** with a launch message.

## Theme

The header button cycles **System → Dark → Light**. The choice is saved in `localStorage` (`i2p-theme`).

## Dependencies (CDN)

- [Lucide](https://lucide.dev) icons (unpkg)
- DM Sans and Outfit fonts (Google Fonts). To change fonts, edit the Google Fonts link in `index.html` and the `--font` / `--display` variables at the top of `style.css`

If a CDN is unavailable the site still works; icons and custom fonts degrade gracefully.

## 6. SEO, sitemap and HTTPS

**Set your real address (do this once).** The meta tags, canonical link, structured data, `sitemap.xml` and `robots.txt` all use `https://munaxxe.github.io/i2p/` (change the repository name `i2p` if yours is different). If your repository or domain differs, replace it everywhere with your live address (keep the trailing slash):

```
sed -i 's#https://munaxxe.github.io/i2p/#https://munaxxe.github.io/yourrepo/#g' index.html sitemap.xml robots.txt
```

For a custom domain use, for example, `https://i2p.example.com/`. On Windows, use find and replace in your editor on those three files.

**After deploying**
1. Open your live `/sitemap.xml` and `/robots.txt` in a browser to confirm they load.
2. In [Google Search Console](https://search.google.com/search-console), add your site and submit `sitemap.xml`.
3. Test structured data at https://search.google.com/test/rich-results and the share preview with a link-preview tool.
4. Update `<lastmod>` in `sitemap.xml` when you make larger changes.

**Enforcing HTTPS**
- In your repository go to **Settings > Pages** and tick **Enforce HTTPS** (GitHub provides the certificate; for a custom domain it appears once the domain's DNS has been verified). This is the real server-side redirect.
- As a backup, `index.html` also redirects `http://` visits to `https://` in the browser and sends an `upgrade-insecure-requests` policy, so no content is loaded over plain HTTP.

**What is included**
- Title, description, canonical, robots, Open Graph and Twitter card tags in `index.html`
- Schema.org JSON-LD (Organization, WebSite, WebPage and SoftwareApplication)
- Favicons, Apple touch icon and a 1200 x 630 share image in `assets/`
