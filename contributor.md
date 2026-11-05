# Contributor Guide

Thank you for helping improve GPT to PDF. Contributions are welcome for bug
fixes, documentation, accessibility, performance, and new export features.

## Before you start

1. Read the [contributor development guide](./contributorsguide.md).
2. Search existing issues and pull requests before opening a new one.
3. For significant changes, open an issue first so the approach can be
   discussed before implementation.
4. Never include secrets, private conversations, generated credentials, or
   personal data in commits, issues, or pull requests.

## Repository layout

- `apps/web/` — public Next.js application and PDF conversion API.
- `packages/analytics/` — analytics parsing and test utilities.
- `packages/db/` — database and Prisma integration.
- `packages/shared/` — shared TypeScript utilities.
- `docs/` — project documentation and content assets.

## Contribution standards

- Keep changes focused and explain the user-facing impact.
- Preserve existing TypeScript, Next.js, and repository conventions.
- Add or update tests for behavior changes and bug fixes.
- Update documentation when setup, configuration, or public behavior changes.
- Do not add credentials or hard-code environment-specific values.
- Use clear commit messages and describe testing in every pull request.

## Pull request checklist

- [ ] The change is limited to the stated purpose.
- [ ] Tests or validation commands pass locally.
- [ ] New behavior has appropriate tests, where practical.
- [ ] Documentation and environment-variable references are up to date.
- [ ] No secrets, generated build output, or unrelated files are included.
- [ ] The pull request description explains the change and verification steps.

## License

By contributing, you agree that your contribution is provided under the
project's [MIT License](./LICENSE).
