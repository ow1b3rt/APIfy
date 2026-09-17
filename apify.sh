#!/usr/bin/env bash

set -Eeuo pipefail

readonly SCRIPT_PATH="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)/$(basename -- "${BASH_SOURCE[0]}")"
readonly SCRIPT_DIR="$(dirname -- "$SCRIPT_PATH")"
readonly APIFY_REPOSITORY="${APIFY_REPOSITORY:-https://github.com/ow1b3rt/apify.git}"
readonly APIFY_REF="${APIFY_REF:-}"
readonly CORE_FEATURES=(auth media users)
readonly OPTIONAL_FEATURES=(
  authors blogs careers contact countries education events jobs layouts
  notices nrb partners successProfiles visitors
)

declare -A DEPENDENCIES=(
  [authors]=""
  [blogs]="authors"
  [careers]="jobs"
  [contact]=""
  [countries]=""
  [education]=""
  [events]=""
  [jobs]=""
  [layouts]=""
  [notices]=""
  [nrb]=""
  [partners]=""
  [successProfiles]="countries"
  [visitors]=""
)

PROJECT_ROOT=""
STATE_FILE=""
REMOTE_WORKTREE=""

info() { printf '\033[1;34m[APIfy]\033[0m %s\n' "$*"; }
success() { printf '\033[1;32m[APIfy]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[APIfy]\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31m[APIfy]\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'USAGE'
APIfy Git-backed modular backend scaffolder

Usage:
  ./apify-git.sh init <directory> [--features blogs,contact] [--install] [--git]
  ./apify.sh add <feature> [feature ...]
  ./apify.sh pull <feature> [feature ...]
  ./apify.sh remove <feature>
  ./apify.sh list
  ./apify.sh doctor

Environment overrides:
  APIFY_REPOSITORY=https://github.com/ow1b3rt/apify.git
  APIFY_REF=branch-or-tag

`education` installs students, classes, and registrations together.
USAGE
}

cleanup() {
  if [[ -n "$REMOTE_WORKTREE" && -d "$REMOTE_WORKTREE" ]]; then
    rm -rf -- "$REMOTE_WORKTREE"
  fi
}
trap cleanup EXIT

contains() {
  local needle="$1" item
  shift
  for item in "$@"; do
    [[ "$item" == "$needle" ]] && return 0
  done
  return 1
}

normalize_feature() {
  case "$1" in
    successprofiles|success-profiles|success_profiles) printf '%s' "successProfiles" ;;
    students|classes|registrations) printf '%s' "education" ;;
    *) printf '%s' "$1" ;;
  esac
}

validate_feature() {
  local feature
  feature="$(normalize_feature "$1")"
  contains "$feature" "${OPTIONAL_FEATURES[@]}" || {
    die "Unknown feature '$1'. Run './apify.sh list'."
  }
}

clone_arguments() {
  local destination="$1"
  CLONE_ARGUMENTS=(clone --depth 1)
  [[ -n "$APIFY_REF" ]] && CLONE_ARGUMENTS+=(--branch "$APIFY_REF")
  CLONE_ARGUMENTS+=("$APIFY_REPOSITORY" "$destination")
}

clone_repository() {
  local destination="$1"
  local -a CLONE_ARGUMENTS
  clone_arguments "$destination"
  git "${CLONE_ARGUMENTS[@]}"
}

ensure_remote_worktree() {
  [[ -n "$REMOTE_WORKTREE" ]] && return
  REMOTE_WORKTREE="$(mktemp -d)"
  local -a clone_args=(clone --depth 1 --filter=blob:none --sparse)
  [[ -n "$APIFY_REF" ]] && clone_args+=(--branch "$APIFY_REF")
  clone_args+=("$APIFY_REPOSITORY" "$REMOTE_WORKTREE/repository")
  git "${clone_args[@]}"
}

configure_project() {
  PROJECT_ROOT="$(cd -- "$1" && pwd -P)"
  STATE_FILE="$PROJECT_ROOT/.apify/installed-features"
  [[ -f "$PROJECT_ROOT/package.json" ]] || die "Not an APIfy project: $PROJECT_ROOT"
  mkdir -p "$PROJECT_ROOT/.apify"
  touch "$STATE_FILE"
}

is_installed() {
  grep -Fxq -- "$1" "$STATE_FILE" 2>/dev/null
}

mark_installed() {
  is_installed "$1" || printf '%s\n' "$1" >> "$STATE_FILE"
  sort -u -o "$STATE_FILE" "$STATE_FILE"
}

mark_removed() {
  local temporary
  temporary="$(mktemp "${STATE_FILE}.XXXXXX")"
  grep -Fxv -- "$1" "$STATE_FILE" > "$temporary" || true
  mv -- "$temporary" "$STATE_FILE"
}

copy_feature_directory() {
  local feature="$1"
  ensure_remote_worktree
  git -C "$REMOTE_WORKTREE/repository" sparse-checkout add "features/$feature"
  local source="$REMOTE_WORKTREE/repository/features/$feature"
  [[ -d "$source" ]] || die "Feature '$feature' is missing from $APIFY_REPOSITORY"
  mkdir -p "$PROJECT_ROOT/features/$feature"
  cp -a -- "$source/." "$PROJECT_ROOT/features/$feature/"
}

copy_feature_files() {
  local feature="$1" member
  if [[ "$feature" == "education" ]]; then
    for member in students classes registrations; do
      copy_feature_directory "$member"
    done
  else
    copy_feature_directory "$feature"
  fi
}

regenerate_schema_index() {
  node "$PROJECT_ROOT/scripts/generateSchemaIndex.js" >/dev/null
}

declare -A ADDING=()

add_feature() {
  local feature dependency
  feature="$(normalize_feature "$1")"
  validate_feature "$feature"

  if is_installed "$feature"; then
    info "$feature is already installed"
    return
  fi
  [[ "${ADDING[$feature]:-}" == "yes" ]] && return
  ADDING[$feature]="yes"

  for dependency in ${DEPENDENCIES[$feature]}; do
    add_feature "$dependency"
  done

  copy_feature_files "$feature"
  mark_installed "$feature"
  success "Added $feature"
}

installed_dependents() {
  local target="$1" feature dependency
  for feature in "${OPTIONAL_FEATURES[@]}"; do
    is_installed "$feature" || continue
    for dependency in ${DEPENDENCIES[$feature]}; do
      [[ "$dependency" == "$target" ]] && printf '%s\n' "$feature"
    done
  done
}

remove_feature_files() {
  case "$1" in
    education)
      rm -rf -- \
        "$PROJECT_ROOT/features/students" \
        "$PROJECT_ROOT/features/classes" \
        "$PROJECT_ROOT/features/registrations"
      ;;
    *) rm -rf -- "$PROJECT_ROOT/features/$1" ;;
  esac
}

remove_feature() {
  local feature dependents
  feature="$(normalize_feature "$1")"
  validate_feature "$feature"
  is_installed "$feature" || die "$feature is not installed"

  dependents="$(installed_dependents "$feature")"
  [[ -z "$dependents" ]] || {
    die "Cannot remove $feature; installed features depend on it: ${dependents//$'\n'/, }"
  }

  remove_feature_files "$feature"
  mark_removed "$feature"
  regenerate_schema_index
  success "Removed $feature"
}

list_features() {
  printf '\nRepository: %s\n' "$APIFY_REPOSITORY"
  [[ -n "$APIFY_REF" ]] && printf 'Ref: %s\n' "$APIFY_REF"
  printf '\nCore features:\n  ✓ %s\n' "${CORE_FEATURES[*]}"
  printf '\nOptional features:\n'

  local feature state dependency
  for feature in "${OPTIONAL_FEATURES[@]}"; do
    state=" "
    is_installed "$feature" && state="✓"
    dependency="${DEPENDENCIES[$feature]}"
    if [[ -n "$dependency" ]]; then
      printf '  %s %-18s requires: %s\n' "$state" "$feature" "$dependency"
    else
      printf '  %s %s\n' "$state" "$feature"
    fi
  done
  printf '\n'
}

doctor() {
  local failed=0 feature member
  [[ -f "$PROJECT_ROOT/features/index.js" ]] || { warn "features/index.js is missing"; failed=1; }
  [[ -f "$PROJECT_ROOT/scripts/generateSchemaIndex.js" ]] || { warn "schema generator is missing"; failed=1; }

  for feature in "${OPTIONAL_FEATURES[@]}"; do
    is_installed "$feature" || continue
    if [[ "$feature" == "education" ]]; then
      for member in students classes registrations; do
        [[ -d "$PROJECT_ROOT/features/$member" ]] || { warn "$member is missing"; failed=1; }
      done
    elif [[ ! -d "$PROJECT_ROOT/features/$feature" ]]; then
      warn "$feature is recorded as installed but its directory is missing"
      failed=1
    fi
  done

  regenerate_schema_index
  (( failed == 0 )) || die "Project consistency check failed"
  success "Project structure and schema index are consistent"
}

generate_secrets() {
  cp -- "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
  if command -v openssl >/dev/null 2>&1; then
    sed -i \
      -e "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" \
      -e "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$(openssl rand -hex 32)|" \
      -e "s|^COOKIE_SECRET=.*|COOKIE_SECRET=$(openssl rand -hex 32)|" \
      "$PROJECT_ROOT/.env"
  else
    warn "openssl not found; replace placeholder secrets in .env"
  fi
}

set_package_name() {
  local package_name
  package_name="$(basename "$PROJECT_ROOT" | tr '[:upper:] _' '[:lower:]--' | tr -cd 'a-z0-9._-')"
  [[ -n "$package_name" ]] || package_name="appify-backend"

  node - "$PROJECT_ROOT/package.json" "$package_name" <<'NODE'
const fs = require("node:fs");
const [file, name] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
manifest.name = name;
manifest.version = "0.1.0";
fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
NODE
}

parse_features() {
  local raw="${1//,/ }"
  printf '%s\n' $raw
}

prune_optional_features() {
  local feature
  for feature in authors blogs careers classes contact countries events jobs layouts \
    notices nrb partners registrations students successProfiles visitors; do
    rm -rf -- "$PROJECT_ROOT/features/$feature"
  done
  rm -rf -- "$PROJECT_ROOT/tests" "$PROJECT_ROOT/drizzle"
}

init_project() {
  [[ $# -ge 1 ]] || die "init requires a target directory"
  command -v git >/dev/null 2>&1 || die "git is required"
  command -v node >/dev/null 2>&1 || die "Node.js is required"

  local target="$1"
  shift
  local selected="" install_dependencies="no" initialize_git="no"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --features) [[ $# -ge 2 ]] || die "--features requires a value"; selected="$2"; shift 2 ;;
      --install) install_dependencies="yes"; shift ;;
      --git) initialize_git="yes"; shift ;;
      *) die "Unknown init option: $1" ;;
    esac
  done

  [[ ! -e "$target" ]] || {
    [[ -d "$target" && -z "$(find "$target" -mindepth 1 -maxdepth 1 -print -quit)" ]] || {
      die "Target must not exist or must be empty: $target"
    }
  }

  clone_repository "$target"
  target="$(cd -- "$target" && pwd -P)"
  rm -rf -- "$target/.git"
  cp -- "$SCRIPT_PATH" "$target/apify.sh"
  chmod +x "$target/apify.sh"

  configure_project "$target"
  printf '%s\n' "${CORE_FEATURES[@]}" > "$STATE_FILE"
  prune_optional_features
  set_package_name
  generate_secrets
  mkdir -p "$PROJECT_ROOT/public/uploads" "$PROJECT_ROOT/frontlayouts"

  if [[ -z "$selected" && -t 0 ]]; then
    list_features
    read -r -p "Features (comma-separated, 'all', or Enter for none): " selected
  fi
  [[ "$selected" != "all" ]] || selected="${OPTIONAL_FEATURES[*]}"

  local feature
  while IFS= read -r feature; do
    [[ -n "$feature" ]] && add_feature "$feature"
  done < <(parse_features "$selected")
  regenerate_schema_index

  if [[ "$install_dependencies" == "yes" ]]; then
    command -v pnpm >/dev/null 2>&1 || die "pnpm is required for --install"
    (cd "$PROJECT_ROOT" && pnpm install)
  fi

  [[ "$initialize_git" != "yes" ]] || git -C "$PROJECT_ROOT" init --quiet
  success "Backend initialized at $PROJECT_ROOT"
}

project_command() {
  local command="$1"
  shift
  configure_project "$SCRIPT_DIR"

  case "$command" in
    add|pull)
      [[ $# -gt 0 ]] || die "$command requires at least one feature"
      local argument feature
      for argument in "$@"; do
        while IFS= read -r feature; do
          [[ -n "$feature" ]] && add_feature "$feature"
        done < <(parse_features "$argument")
      done
      regenerate_schema_index
      ;;
    remove) [[ $# -eq 1 ]] || die "remove requires one feature"; remove_feature "$1" ;;
    list) list_features ;;
    doctor) doctor ;;
    *) die "Unknown command: $command" ;;
  esac
}

main() {
  [[ $# -gt 0 ]] || { usage; exit 0; }
  case "$1" in
    init) shift; init_project "$@" ;;
    add|pull|remove|list|doctor) local command="$1"; shift; project_command "$command" "$@" ;;
    feature)
      shift
      [[ $# -gt 0 ]] || die "feature requires add, pull, remove, or list"
      local command="$1"
      shift
      project_command "$command" "$@"
      ;;
    help|-h|--help) usage ;;
    *) usage; die "Unknown command: $1" ;;
  esac
}

main "$@"
