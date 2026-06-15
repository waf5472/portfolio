#!/usr/bin/env bash
#
# Full-fidelity local preview of the portfolio + its live web-app cards.
#
# Starts each app's Cloudflare Worker (each serves /project.json with CORS) and
# the portfolio static site on automatically-chosen free ports, waits until the
# schema endpoints are reachable, then opens the site. The chosen Worker ports
# are written to dev-endpoints.json (gitignored), which projects.js reads in
# local mode — so the "Live web apps" cards render exactly as in production.
#
# Usage:  ./preview.sh        (from anywhere; Ctrl-C stops everything)
#
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"          # ~/Workspaces/projects
PORTFOLIO="$SCRIPT_DIR"
DAILY="$ROOT/daily-quiz"
JOBS="$ROOT/jobs-map"
DEV_ENDPOINTS_FILE="$PORTFOLIO/dev-endpoints.json"

pids=()

cleanup() {
  echo
  echo "Shutting down preview…"
  for pid in "${pids[@]:-}"; do
    [ -n "${pid:-}" ] || continue
    pkill -P "$pid" 2>/dev/null   # wrangler spawns children; sweep them first
    kill "$pid" 2>/dev/null
  done
  rm -f "$DAILY/.dev.vars"        # ephemeral secret, generated below
  rm -f "$DEV_ENDPOINTS_FILE"     # local-only endpoint hints
  echo "Done."
}
trap cleanup EXIT INT TERM

die() { echo "✗ $*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }
port_busy() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null && { exec 3>&- 3<&-; return 0; } || return 1; }
# first free port at or after $1
free_port() { local p="$1"; while port_busy "$p"; do p=$((p + 1)); done; printf '%s' "$p"; }

have npx     || die "npx not found (need Node.js)"
have python3 || die "python3 not found"
[ -d "$PORTFOLIO" ]   || die "portfolio dir missing: $PORTFOLIO"
[ -d "$DAILY" ]       || die "daily-quiz dir missing: $DAILY"
[ -d "$JOBS/worker" ] || die "jobs-map worker dir missing: $JOBS/worker"

# Claim dedicated free ports at launch (preferred values, bumped if taken).
PORT_DAILY=$(free_port 8787)
PORT_JOBS=$(free_port $((PORT_DAILY + 1)))
PORT_PORTFOLIO=$(free_port 8088)

# Tell the frontend which Worker ports we actually got (same-origin, gitignored).
printf '["http://localhost:%s","http://localhost:%s"]\n' "$PORT_DAILY" "$PORT_JOBS" > "$DEV_ENDPOINTS_FILE"

echo "════════════════════════════════════════════════════════════════"
echo " Portfolio full-fidelity preview"
echo "════════════════════════════════════════════════════════════════"

# --- daily-quiz: pull the Anthropic key from Doppler so the live app (LLM)
#     works too; /project.json works regardless. .dev.vars is removed on exit.
if have doppler; then
  if echo "ANTHROPIC_API_KEY=$(doppler secrets get ANTHROPIC_API_KEY --plain 2>/dev/null)" > "$DAILY/.dev.vars" \
     && grep -q '=..' "$DAILY/.dev.vars"; then
    echo "▶ daily-quiz: ANTHROPIC_API_KEY loaded from Doppler (ephemeral .dev.vars)"
  else
    rm -f "$DAILY/.dev.vars"
    echo "!  daily-quiz: couldn't load key from Doppler — app loads, but quiz generation will fail"
  fi
else
  echo "!  doppler not found — daily-quiz app loads, but quiz generation will fail"
fi

echo "▶ daily-quiz worker  → http://localhost:$PORT_DAILY   (app + /project.json)"
( cd "$DAILY" && exec npx wrangler dev --port "$PORT_DAILY" ) >/tmp/preview-daily.log 2>&1 &
pids+=($!)

echo "▶ jobs-worker        → http://localhost:$PORT_JOBS    (/project.json + jobs API)"
( cd "$JOBS/worker" && exec npx wrangler dev --port "$PORT_JOBS" ) >/tmp/preview-jobs.log 2>&1 &
pids+=($!)

echo "▶ portfolio (static) → http://localhost:$PORT_PORTFOLIO"
( cd "$PORTFOLIO" && exec python3 -m http.server "$PORT_PORTFOLIO" ) >/tmp/preview-portfolio.log 2>&1 &
pids+=($!)

# --- wait for the schema endpoints (workers take a few seconds to boot) ---
echo -n "Waiting for Workers to boot (logs: /tmp/preview-*.log)"
ready=1
for url in "http://localhost:$PORT_DAILY/project.json" "http://localhost:$PORT_JOBS/project.json"; do
  ok=0
  for _ in $(seq 1 90); do
    if curl -fsS "$url" >/dev/null 2>&1; then ok=1; break; fi
    sleep 1; echo -n "."
  done
  [ "$ok" -eq 1 ] || { echo; echo "✗ timed out waiting for $url (check its log)"; ready=0; }
done
echo

URL="http://localhost:$PORT_PORTFOLIO"
echo "════════════════════════════════════════════════════════════════"
if [ "$ready" -eq 1 ]; then
  echo " ✅ Open the portfolio:  $URL"
else
  echo " ⚠  Portfolio is up at $URL, but a Worker didn't boot — some cards"
  echo "    may be missing. See /tmp/preview-*.log."
fi
echo
echo "    daily-quiz app:  http://localhost:$PORT_DAILY"
echo "    jobs-worker API: http://localhost:$PORT_JOBS/jobs.json"
echo
echo "    Ctrl-C to stop everything."
echo "════════════════════════════════════════════════════════════════"

have xdg-open && xdg-open "$URL" >/dev/null 2>&1 &

wait
