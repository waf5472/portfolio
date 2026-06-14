# Portfolio Website

A clean, dark-minimal personal portfolio built with plain HTML, CSS, and JavaScript. No frameworks, no build step — open `index.html` in a browser and it just works.

## Files

| File | Purpose |
|------|---------|
| `index.html` | All page content & structure |
| `style.css`  | Dark-minimal styles, responsive layout |
| `script.js`  | Scroll animations, mobile nav, active links |

## Sections

- **Hero** — Name, tagline, social links
- **About** — Bio and photo
- **Projects** — Card grid with links
- **Skills** — Tech groups
- **Experience** — Timeline
- **Contact** — Email CTA

## Customising

Search for `[Your Name]`, `[City, State]`, `you@example.com`, etc. and replace with your real info. The full list of placeholders:

- `[Your Name]` / `[YN]` — your name and logo initials
- `[City, State]` — location
- `you@example.com` — your email (two places)
- `https://github.com/` — GitHub URL
- `https://linkedin.com/` — LinkedIn URL
- `https://twitter.com/` — Twitter/X URL
- Project names, descriptions, and tech tags
- Experience entries (company, dates, description)
- Skills lists

## Deploying

### GitHub Pages (free)
1. Push this folder to a GitHub repo
2. Go to **Settings → Pages → Deploy from branch → main / root**
3. Your site is live at `https://yourusername.github.io/repo-name/`

### Netlify (free, drag & drop)
1. Go to [netlify.com](https://netlify.com) and log in
2. Drag the `portfolio/` folder onto the dashboard
3. Done — instant live URL

### Custom domain
Add a `CNAME` file containing `yourdomain.com` to the folder, then point your domain's DNS to GitHub/Netlify.
