// Live web-app cards for the Projects section.
//
// Each deployment serves a schema doc at /project.json:
//   { name, description, link, repo?, tags? }   (see PROJECT_SCHEMA.md)
//
// We probe every endpoint below; each one that responds becomes a card.
// Apps that aren't deployed (or aren't ready) 404 and are silently skipped,
// so the portfolio shows only what is actually live. To add a project,
// serve /project.json from its deployment and add its base URL here — no
// other edits to the portfolio are needed.

const PROJECT_ENDPOINTS = [
  // Base origin that serves /project.json. Fill in after each app deploys, e.g.:
  // "https://daily-quiz.<your-subdomain>.workers.dev",
  // "https://jobs-worker.<your-subdomain>.workers.dev",
];

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
  const url = base.replace(/\/$/, "") + "/project.json";
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !data.name || !data.link) {
    throw new Error(`${url}: missing required name/link`);
  }
  return data;
}

async function loadProjects() {
  if (!grid || !wrap || !PROJECT_ENDPOINTS.length) return;

  const results = await Promise.allSettled(PROJECT_ENDPOINTS.map(fetchSchema));
  const found = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  if (!found.length) return; // nothing live — leave the section hidden

  found.forEach((p) => grid.appendChild(card(p)));
  wrap.hidden = false;
}

loadProjects();
