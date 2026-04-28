#!/usr/bin/env bash
set -euo pipefail

mode="${1:-check}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

fail() {
  printf 'verify-repo:%s failed: %s\n' "$mode" "$1" >&2
  exit 1
}

require_file() {
  local path="$1"
  [[ -f "$path" ]] || fail "missing required file: $path"
}

require_dir_with_files() {
  local path="$1"
  [[ -d "$path" ]] || fail "missing required directory: $path"
  find "$path" -type f | grep -q . || fail "directory has no files: $path"
}

verify_docs() {
  require_file docs/README.md
  require_file docs/product/product-spec.md
  require_file docs/specs/ui-stub-first-deliverable.md
  require_file docs/roadmap/implementation-roadmap.md
  require_file docs/roadmap/implementation-ticket-map.md
  require_file docs/checklists/production-readiness-checklist.md
  require_file docs/technical/repo-activation.md
  require_dir_with_files docs/templates
  require_dir_with_files .agents/profiles
  require_dir_with_files .agents/skills
  require_dir_with_files .codex/rules
}

verify_phase_gates() {
  local phases gates prompts
  phases="$(grep -c '^## M[0-9]' docs/roadmap/implementation-roadmap.md)"
  gates="$(grep -c '^Mandatory Review Gate:' docs/roadmap/implementation-roadmap.md)"
  prompts="$(grep -c '"Analyse the phase code and compare to phase specs and determine if there are any gaps. If you find any gaps, close them by implementing the relevant functionality. Each phase cannot proceed or be called complete until there are no gaps between specs and code that was actually delivered and is tested to be working. This is a mandatory requirement."' docs/roadmap/implementation-roadmap.md)"

  [[ "$phases" -eq 13 ]] || fail "expected 13 roadmap phases, found $phases"
  [[ "$gates" -eq "$phases" ]] || fail "expected one review gate per phase; phases=$phases gates=$gates"
  [[ "$prompts" -eq "$phases" ]] || fail "expected exact review prompt once per phase; phases=$phases prompts=$prompts"
}

verify_shell() {
  bash -n scripts/*.sh
  bash -n .githooks/pre-commit
}

verify_workspace() {
  require_file package.json
  require_file pnpm-workspace.yaml
  require_file Makefile
  node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" >/dev/null
}

run_web_if_present() {
  local script_name="$1"
  if [[ "${SKIP_WEB_VERIFY:-}" == "1" ]]; then
    return 0
  fi

  if [[ -f apps/web/package.json ]]; then
    pnpm --dir apps/web "$script_name"
  fi
}

case "$mode" in
  lint)
    verify_workspace
    verify_docs
    verify_phase_gates
    verify_shell
    ./scripts/check-import-boundaries.sh >/dev/null
    bash scripts/check-file-size.sh >/dev/null
    run_web_if_present lint
    ;;
  typecheck)
    verify_workspace
    run_web_if_present typecheck
    ;;
  test)
    verify_docs
    verify_phase_gates
    ./scripts/check-import-boundaries.sh >/dev/null
    run_web_if_present test
    ;;
  coverage)
    verify_docs
    verify_phase_gates
    run_web_if_present coverage
    ;;
  build)
    verify_workspace
    verify_docs
    find docs -type f -name '*.md' -size 0 | grep -q . && fail "empty markdown docs found"
    run_web_if_present build
    ;;
  check)
    "$0" lint
    "$0" typecheck
    "$0" test
    "$0" coverage
    "$0" build
    ;;
  *)
    fail "unknown mode: $mode"
    ;;
esac

printf 'verify-repo:%s ok\n' "$mode"
