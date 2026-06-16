// Live web-app cards for the Projects section.
//
// Each deployment serves a schema doc at /project.json:
//   { name, description, link, repo?, tags? }   (see PROJECT_SCHEMA.md)
//
// We probe every endpoint below; each one that responds becomes a card.
// Apps that aren't deployed (or aren't ready) 404 and are silently skipped,
// so the portfolio shows only what is actually live. To add a project,
// serve /project.json from its deployment and add its base URL here.

// Production: base origins that serve /project.json. Fill in after each app
// deploys, e.g. "https://daily-quiz.<your-subdomain>.workers.dev".
const PROD_ENDPOINTS = [
  "https://daily-quiz.wesley-fletcher.com",
  "https://jobs-map.wesley-fletcher.com",
];

// Local full-fidelity preview (started by preview.sh): probe the Workers
// running on localhost. Only used when the page itself is served from localhost.
// The launcher claims free ports and writes the actual ones to dev-endpoints.json;
// these are just the fallback if that file isn't present.
const DEV_ENDPOINTS = [
  "http://localhost:8787", // daily-quiz worker
  "http://localhost:8788", // jobs-worker
];

const DEV = ["localhost", "127.0.0.1"].includes(location.hostname);

// In local mode, prefer the ports preview.sh actually chose (dev-endpoints.json,
// same-origin & gitignored); fall back to the defaults above.
async function resolveEndpoints() {
  if (!DEV) return PROD_ENDPOINTS;
  try {
    const r = await fetch("dev-endpoints.json", { cache: "no-store" });
    if (r.ok) {
      const list = await r.json();
      if (Array.isArray(list) && list.length) return list;
    }
  } catch {
    /* no launcher file — use defaults */
  }
  return DEV_ENDPOINTS;
}

const grid = document.getElementById("live-projects-grid");
const wrap = document.getElementById("live-projects");

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function card({ name, description, link, repo, tags }) {
  const el = document.createElement("article");
  el.className = "project-card project-card--live";

  const tagList =
    Array.isArray(tags) && tags.length
      ? `<ul class="project-tags" aria-label="Tech">${tags
          .map((t) => `<li>${escapeHtml(t)}</li>`)
          .join("")}</ul>`
      : "";

  const codeLink = repo
    ? `<a class="project-link project-link--muted" href="${encodeURI(repo)}"
          target="_blank" rel="noopener">Code &#8599;</a>`
    : "";

  el.innerHTML = `
    <div class="project-meta"><h3>${escapeHtml(name)}</h3></div>
    <p>${escapeHtml(description)}</p>
    ${tagList}
    <div class="project-links">
      <a class="project-link" href="${encodeURI(link)}"
         target="_blank" rel="noopener">Open app &#8599;</a>
      ${codeLink}
    </div>`;
  return el;
}

async function fetchSchema(base) {
  const origin = base.replace(/\/$/, "");
  const res = await fetch(origin + "/project.json", { mode: "cors" });
  if (!res.ok) throw new Error(`${origin}: HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !data.name || !data.link) {
    throw new Error(`${origin}: missing required name/link`);
  }
  // In local preview the production `link` is a placeholder — point "Open app"
  // at the live local origin instead so click-through works.
  return DEV ? { ...data, link: origin } : data;
}

async function loadProjects() {
  if (!grid || !wrap) return;

  const endpoints = await resolveEndpoints();
  if (!endpoints.length) return;

  const results = await Promise.allSettled(endpoints.map(fetchSchema));
  const found = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  if (!found.length) return; // nothing live — leave the section hidden

  found.forEach((p) => grid.appendChild(card(p)));
  wrap.hidden = false;
}

loadProjects();
