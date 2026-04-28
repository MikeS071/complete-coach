#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'repo activation test failed: %s\n' "$1" >&2
  exit 1
}

require_file() {
  local path="$1"
  [[ -f "$path" ]] || fail "missing required file: $path"
}

require_executable() {
  local path="$1"
  [[ -x "$path" ]] || fail "required executable is missing or not executable: $path"
}

require_package_script() {
  local script_name="$1"
  node -e "
    const pkg = require('./package.json');
    if (!pkg.scripts || !pkg.scripts['${script_name}']) {
      process.exit(1);
    }
  " || fail "missing package.json script: ${script_name}"
}

require_file package.json
require_file pnpm-workspace.yaml
require_file Makefile
require_file .gitignore
require_file docs/technical/repo-activation.md
require_executable scripts/check-import-boundaries.sh
require_executable scripts/verify-repo.sh

for script_name in bootstrap lint typecheck test coverage build check; do
  require_package_script "$script_name"
done

if grep -q 'go test ./\.\.\.' .githooks/pre-commit; then
  fail "pre-commit still assumes a Go module exists"
fi

if grep -q 'pnpm --dir apps/web' .githooks/pre-commit; then
  fail "pre-commit still assumes apps/web exists"
fi

bash -n scripts/*.sh
./scripts/check-import-boundaries.sh

tmp_boundary_root="$(mktemp -d)"
trap 'rm -rf "$tmp_boundary_root"' EXIT
mkdir -p "$tmp_boundary_root/apps/web" "$tmp_boundary_root/apps/admin"
printf "import '../../apps/admin/private';\n" > "$tmp_boundary_root/apps/web/page.ts"
printf "export const privateValue = true;\n" > "$tmp_boundary_root/apps/admin/private.ts"

if CHECK_IMPORT_BOUNDARY_ROOT="$tmp_boundary_root" ./scripts/check-import-boundaries.sh >/tmp/import-boundary-negative-test 2>&1; then
  fail "import-boundary checker did not fail on an app-to-app relative import"
fi

SKIP_WEB_VERIFY=1 ./scripts/verify-repo.sh lint
SKIP_WEB_VERIFY=1 ./scripts/verify-repo.sh typecheck
SKIP_WEB_VERIFY=1 ./scripts/verify-repo.sh test
SKIP_WEB_VERIFY=1 ./scripts/verify-repo.sh coverage
SKIP_WEB_VERIFY=1 ./scripts/verify-repo.sh build

printf 'repo activation test: ok\n'
