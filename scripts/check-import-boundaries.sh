#!/usr/bin/env bash
set -euo pipefail

default_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
root="${CHECK_IMPORT_BOUNDARY_ROOT:-$default_root}"
cd "$root"

if ! command -v rg >/dev/null 2>&1; then
  printf 'check-import-boundaries: ripgrep (rg) is required\n' >&2
  exit 1
fi

source_dirs=()
for dir in apps services pkg integrations; do
  [[ -d "$dir" ]] && source_dirs+=("$dir")
done

if [[ "${#source_dirs[@]}" -eq 0 ]]; then
  printf 'check-import-boundaries: ok (no source directories yet)\n'
  exit 0
fi

failures=0

while IFS= read -r file; do
  case "$file" in
    apps/*/*)
      app_name="${file#apps/}"
      app_name="${app_name%%/*}"

      if rg -n "from ['\"]\\.\\./\\.\\./apps/|import ['\"]\\.\\./\\.\\./apps/|import\\(['\"]\\.\\./\\.\\./apps/" "$file" >/tmp/import-boundary-match 2>/dev/null; then
        while IFS= read -r match; do
          printf 'import boundary violation: %s imports another app via relative path: %s\n' "$file" "$match" >&2
        done </tmp/import-boundary-match
        failures=$((failures + 1))
      fi

      if rg -n "from ['\"]\\.\\./\\.\\./services/|import ['\"]\\.\\./\\.\\./services/|import\\(['\"]\\.\\./\\.\\./services/" "$file" >/tmp/import-boundary-match 2>/dev/null; then
        while IFS= read -r match; do
          printf 'import boundary violation: %s imports a service via relative path: %s\n' "$file" "$match" >&2
        done </tmp/import-boundary-match
        failures=$((failures + 1))
      fi

      if [[ "$file" == apps/"$app_name"/* ]] && rg -n "from ['\"]@complete-coach/(apps|services)/|import ['\"]@complete-coach/(apps|services)/|import\\(['\"]@complete-coach/(apps|services)/" "$file" >/tmp/import-boundary-match 2>/dev/null; then
        while IFS= read -r match; do
          printf 'import boundary violation: %s imports app/service package directly: %s\n' "$file" "$match" >&2
        done </tmp/import-boundary-match
        failures=$((failures + 1))
      fi
      ;;
    services/*/*)
      if rg -n "from ['\"]\\.\\./\\.\\./apps/|import ['\"]\\.\\./\\.\\./apps/|import\\(['\"]\\.\\./\\.\\./apps/|from ['\"]@complete-coach/apps/|import ['\"]@complete-coach/apps/|import\\(['\"]@complete-coach/apps/" "$file" >/tmp/import-boundary-match 2>/dev/null; then
        while IFS= read -r match; do
          printf 'import boundary violation: %s imports an app: %s\n' "$file" "$match" >&2
        done </tmp/import-boundary-match
        failures=$((failures + 1))
      fi
      ;;
  esac
done < <(find "${source_dirs[@]}" -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) 2>/dev/null | sort)

rm -f /tmp/import-boundary-match

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi

printf 'check-import-boundaries: ok\n'
