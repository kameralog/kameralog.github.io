# Painting browser verification

Independent Chromium checks using Playwright 1.65.1. No Cloudflare account, browser-service key or paid runner is configured.

## Run

The setup push runs the default manifest once. Later use Actions > Painting browser verification > Run workflow. Select a JSON manifest inside `tools/painting-browser` and a limit from 1 to 50. The default is the ten candidate files for artist batch 159; candidate filenames may be missing or redirect. This is not an approved batch or a source of automatic artwork bindings.

A manifest has `schemaVersion: 1` and `items`. Each item has a unique `id` and either a Commons `file` starting with `File:` or explicit HTTPS `image` and optional `zoom`. Images are restricted to the Wikimedia and SMK hosts listed in `verify.mjs`. Adding another host requires a reviewed source change.

The checker reads canonical Commons metadata, declared license fields and full wikitext, then checks the selected image and zoom in Chromium. It records actual dimensions and rejects decoded derivatives larger than native dimensions. A TIFF whose larger API result is the original TIFF falls back to the tested preview instead of pretending the browser decoded TIFF. Failures and pending rows are preserved. A green result means only the selected technical checks passed.

## Outputs and permissions

The browser job has `contents: read`, no GITHUB_TOKEN/GH_TOKEN passed to the browser process and no credentials persisted by checkout. Reports and at most ten 1000x760 screenshots are uploaded as an artifact for seven days. Screenshots are not a declaration of visual review.

A separate job has `contents: write` and uses only an inline script to create/update **reports/painting-browser/latest.json** on `main`. It saves failed and not-run reports too; inspect `status`, `browserSmokePassed`, `counts`, `sourceCommit`, `selectionComplete` and `errors`. It never edits artists, works, editorial source packets or Pages settings. JSON is encoded as data, not executed. Report commits do not match this workflow's push paths.

The dependency version is exact; installation does not use lifecycle scripts or optional packages. There is no committed lockfile yet. Record the reported Playwright/browser versions when comparing runs. One browser is reused; checks run serially with timeouts and a bounded retry. The browser phase has an eight-minute processing budget, the job twenty minutes.

## Limits

Decoding is not author/version identification, legal review, composition review, site publication verification or a game-round test. All corresponding review flags remain false. Network errors, Wikimedia throttling or an API outage can still occur from GitHub. A missing setup report is an installation failure, not a passed test. Do not mark batch 159 ready merely because this workflow is installed.
