#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'web scaffold test failed: %s\n' "$1" >&2
  exit 1
}

require_file() {
  local path="$1"
  [[ -f "$path" ]] || fail "missing required file: $path"
}

require_package_script() {
  local package_path="$1"
  local script_name="$2"
  node -e "
    const pkg = require('./${package_path}');
    if (!pkg.scripts || !pkg.scripts['${script_name}']) {
      process.exit(1);
    }
  " || fail "missing ${package_path} script: ${script_name}"
}

require_file apps/web/package.json
require_file apps/web/next.config.mjs
require_file apps/web/tsconfig.json
require_file apps/web/postcss.config.mjs
require_file apps/web/eslint.config.mjs
require_file apps/web/playwright.config.ts
require_file apps/web/vitest.config.ts
require_file apps/web/vitest.setup.ts
require_file apps/web/app/layout.tsx
require_file apps/web/app/page.tsx
require_file apps/web/app/globals.css
require_file apps/web/styles/complete-coach-theme.css
require_file apps/web/lib/utils.ts
require_file apps/web/tests/home-page.test.tsx
require_file apps/web/README.md
require_file apps/web/components.json

for script_name in dev lint typecheck test coverage build e2e check; do
  require_package_script apps/web/package.json "$script_name"
done

pnpm --dir apps/web lint
pnpm --dir apps/web typecheck
pnpm --dir apps/web test
pnpm --dir apps/web coverage
pnpm --dir apps/web build
pnpm --dir apps/web e2e

printf 'web scaffold test: ok\n'
