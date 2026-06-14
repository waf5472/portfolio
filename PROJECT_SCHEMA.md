# Project schema doc (`/project.json`)

The portfolio's **Projects → Live web apps** section is data-driven. Each deployed
project serves a small JSON "schema doc" at **`/project.json`**, and the portfolio
fetches them at runtime (`projects.js`), rendering one card per project that
responds. Apps that aren't deployed simply 404 and are skipped — the portfolio
shows only what's actually live.

## Contract

`GET /project.json` returns:

| Field         | Required | Type       | Used for                                   |
|---------------|----------|------------|--------------------------------------------|
| `name`        | ✅       | string     | Card title                                 |
| `description` | ✅       | string     | Card body blurb                            |
| `link`        | ✅       | string URL | "Open app" button → live deployment        |
| `repo`        | optional | string URL | "Code" link → GitHub repo                  |
| `tags`        | optional | string[]   | Tech chips                                  |

Example:

```json
{
  "name": "Daily Drill",
  "description": "Pick your own study topics and get fresh, AI-generated quiz questions every day.",
  "link": "https://daily-quiz.<subdomain>.workers.dev",
  "repo": "https://github.com/waf5472/daily-quiz",
  "tags": ["React", "Cloudflare Worker", "Anthropic"]
}
```

## Requirements

1. **CORS** — the response must include `Access-Control-Allow-Origin: *` (the
   portfolio fetches cross-origin). Both Workers do this on the `/project.json` route.
2. **Source of truth** — keep `project.json` at the repo root and have the Worker
   import & serve it, so the served doc and the committed doc never drift.

## Adding a project to the portfolio

1. Add `project.json` at the project's repo root (fields above).
2. Serve it at `/project.json` with the CORS header from the deployment.
3. Add the deployment's **base origin** to `PROJECT_ENDPOINTS` in `projects.js`.

That's it — the card appears automatically. (Note: the *base origin* that serves
`/project.json` may differ from the user-facing `link`; e.g. Job Map serves its
schema from the `jobs-worker` API origin while `link` points at the map page.)
