# Contributor Development Guide

> **Handle the footer with care.** Footer content and layout are shared across
> the website and generated PDF output, so changes should be reviewed and
> tested carefully.

This guide covers the standard workflow for contributing to GPT to PDF.

## Requirements

- Node.js `>=22.12.0`
- npm `10.8.2` or a compatible npm version
- A Chromium-compatible environment for PDF generation

## Set up locally

```bash
git clone https://github.com/PrafulCodes/GPT-to-PDF.git
cd GPT-to-PDF
npm install
```

Create a local `.env` file when needed. The web app can run without secret
keys for its core public-link conversion flow. See the [README environment
variables](./README.md#environment-variables) section before configuring
optional services.

## Run the application

Start the development workspace with:

```bash
npm run dev
```

The public web app is available at `http://localhost:3000`.

## Validate changes

Run the smallest relevant checks while developing:

```bash
npm run --workspace=web test
npm run --workspace=web build
npm run lint
npm run build
```

Not every change requires every command. Pull requests should include the
commands that were run and their results. Changes involving PDF rendering,
parsing, API routes, or rate limiting should include focused tests where
possible.

## Branches and commits

1. Create a focused branch from the default branch.
2. Make small, logically grouped commits.
3. Rebase or update your branch before requesting review if the target branch
   has moved.
4. Use an imperative commit subject, such as `Fix shared-link parsing`.

## Pull requests

Include:

- What changed and why.
- Which files or packages are affected.
- How the change was tested.
- Screenshots or sample output for UI or PDF-rendering changes.
- Any environment variables, migrations, or deployment notes required.

Keep pull requests focused. Separate unrelated refactors, formatting changes,
and feature work into separate pull requests.

## Issues and security

For bugs, include reproduction steps, expected behavior, actual behavior, and
relevant logs with secrets removed. Do not disclose security vulnerabilities
in a public issue; contact the maintainer privately with enough detail to
reproduce and assess the issue.
