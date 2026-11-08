# Hamza Ibrahim, Portfolio

A single-page personal portfolio built with plain HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies.

## Run it locally

Open `index.html` in a browser. That is all.

The only outside request is Google Fonts (Inter and Space Grotesk). If you are offline, the site falls back to system fonts and still works.

If you prefer a local server (closer to how it will behave online):

```bash
cd portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project structure

```
portfolio/
├── index.html              All content and page structure
├── css/
│   └── style.css           Design tokens, layout, components, light/dark themes
├── js/
│   └── script.js           Theme toggle, navigation, reveal, hero network canvas
├── assets/
│   ├── Hamza_Ibrahim_CV.pdf    Used by both "Download CV" buttons
│   ├── icons/
│   │   └── favicon.svg         Favicon and header logo mark
│   └── images/                 Put project screenshots here
└── README.md
```

## Add or replace your CV

The "Download CV" button points to `assets/Hamza_Ibrahim_CV.pdf`.

A PDF converted from your uploaded `.docx` is already there so the button works. Replace it with your own export from Word or Google Docs, keeping the same file name. If you want a different file name, update the `href` and `download` attributes on the "Download CV" link in the hero section of `index.html`.

Note: that PDF contains your phone number, and once the site is online anyone can download it. Export a version without the number if you would rather not share it publicly.

## Add project images

Each featured project currently shows a diagram built from details in your CV (the CNN architecture, the dry bean workflow, the churn project components). No screenshots were invented.

To use a real screenshot instead:

1. Save an optimized image in `assets/images/`. WebP or JPEG, about 1200 px wide, ideally under 200 KB.
2. In `index.html`, find the project's `<div class="project__media">` and replace its contents with:

```html
<img src="assets/images/your-file.webp"
     alt="Describe what the image shows"
     width="1200" height="675"
     loading="lazy" decoding="async">
```

3. Add this to `css/style.css` so the image fills the panel:

```css
.project__media img { width: 100%; height: auto; border-radius: var(--r-sm); }
```

## Add project links

Every project has a placeholder like this:

```html
<a class="proj-link is-pending" aria-disabled="true">Repository link coming soon</a>
```

To activate it, add the URL and remove the placeholder markers:

```html
<a class="proj-link" href="https://github.com/hamzaaaa-12/your-repo"
   target="_blank" rel="noopener noreferrer">View repository</a>
```

Search `index.html` for `TODO` to find all seven.

## Customize the content

- **Text:** everything is in `index.html`, section by section, each marked with a comment.
- **Skills:** edit the `<li>` tags inside each `.skill` card. To add a group, copy a card and give it a size class (`skill--2`, `skill--3`, or `skill--4`; each row of the grid adds up to 6).
- **Experience:** copy a `<li class="timeline__item">` block. The `is-current` class gives the lime marker to the role you are in now. Remove it when that role ends.
- **Add a project:** copy one of the `project--compact` cards into `.projects-more`.
- **Certifications:** copy a `<li class="cert">` block.
- **Contact details:** the email appears in three places in `index.html` (the large link, the "Send an email" button, and the footer icon) plus the `data-email` attribute on the copy button and the structured data in `<head>`.

## Customize the design

All colors, fonts, spacing, and radii are variables at the top of `css/style.css`.

- Accent colors: `--accent`, `--accent-fill`, `--violet`
- Lime (`--lime`) is deliberately limited to "current" signals: the status dot, your current role, and the lit output node in the hero.
- Light theme values are in `:root[data-theme="light"]`.
- Fonts: change `--font-display` and `--font-body`, and update the Google Fonts link in `<head>`.

## Features

- Smooth-scrolling navigation, sticky header, and active-section highlighting
- Mobile menu with Escape to close and focus kept inside while open
- Dark theme by default, light theme toggle (choice is remembered in the browser)
- Scroll reveal and drawn section dividers (CSS animations triggered by IntersectionObserver)
- Hero network canvas: pauses when off-screen or the tab is hidden, shows a still frame for visitors who prefer reduced motion
- Project cards with a pointer spotlight and diagrams that light up on hover or keyboard focus
- Back to top (floating button after scrolling, plus a button in the footer)
- Copy-email button with a confirmation message
- Footer year updates automatically

## Accessibility and performance

- Semantic landmarks, one `h1`, ordered headings, skip link, visible focus styles
- Text contrast checked against both themes
- `prefers-reduced-motion` is respected (animations are removed, the hero shows a static frame)
- Content stays visible if JavaScript is disabled
- No images are loaded by default, so the page is a few dozen KB plus fonts
- Add `loading="lazy"` to any image you add below the first screen

## Publish it

Any static host works: GitHub Pages, Netlify, or Cloudflare Pages. After you have a URL:

1. Add `<meta property="og:url">` and `<meta property="og:image">` to `<head>` (an image about 1200 × 630 px) so links preview well when shared.
2. Optionally add a `<link rel="canonical">` with your URL.
