#!/usr/bin/env bash
# Usage: run-lighthouse.sh <label> <preset: mobile|desktop> <url> [<url> ...]
# Runs one Lighthouse pass per URL (one page load each, run sequentially) and saves JSON + HTML.
set -u
LABEL="$1"; PRESET="$2"; shift 2
HERE="$(cd "$(dirname "$0")" && pwd)"
OUTDIR="$HERE/lighthouse/$LABEL-$PRESET"
mkdir -p "$OUTDIR"
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
for URL in "$@"; do
  SLUG="$(echo "$URL" | sed -E 's#https?://##; s#[^A-Za-z0-9]+#_#g; s#_$##')"
  echo "[$(date +%H:%M:%S)] $LABEL $PRESET $URL"
  EXTRA=""
  [ "$PRESET" = "desktop" ] && EXTRA="--preset=desktop"
  npx --yes lighthouse "$URL" $EXTRA \
    --chrome-path="$CHROME" \
    --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output=html --output-path="$OUTDIR/$SLUG" --quiet 2>&1 | tail -2
done
echo "[$(date +%H:%M:%S)] done $LABEL $PRESET"
