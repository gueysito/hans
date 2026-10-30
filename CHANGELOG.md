# Changelog

## 2026-10-30

- Move the development/container baseline to patched Node 22.23.4 and update Next.js 15, React 19, Zod and vulnerable transitive dependencies.
- Use npm 11.12.1 with frozen Docker installs, blocked dependency lifecycle scripts and a seven-day release-age gate. Replace the container's curl healthcheck with built-in Node HTTP fetching and exclude local credentials/build artifacts from the Docker context.
- Record the offline scope and owner-deferred application build restoration, standards adoption and public-release security review. No deployment or authentication changes are included.
