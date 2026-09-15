#!/usr/bin/env bash

# Oilbar production bootstrap for Debian 12 x64
# ------------------------------------------------------------
# What this script prepares:
# - Debian 12 x86_64 validation
# - system packages, Nginx, PostgreSQL, Node.js 22
# - local PostgreSQL database/user
# - Oilbar production environment file
# - Prisma generate/migrate/status checks
# - Next.js production build
# - systemd services for storefront and payment API
# - Nginx reverse proxy for storefront and api domains
# - optional Let's Encrypt SSL
# - firewall rules
# - daily PostgreSQL/uploads backup timer
# - final health checks
#
# Recommended server:
# - Debian 12 x64
# - 4 vCPU / 8 GB RAM / 100 GB NVMe
# - root SSH access
#
# Server usage:
#   1) Clone/pull the project into /opt/oilbar
#   2) Upload the real env file:
#      scp .env root@YOUR_SERVER:/opt/oilbar/.env
#   3) Run without interactive prompts:
#      cd /opt/oilbar
#      sudo bash scripts/debian12-oilbar-startup.sh
#
# Database behavior:
# - By default, the script rewrites DATABASE_URL inside the received .env to
#   a local PostgreSQL database on this VPS, after creating a backup copy.
# - If you intentionally want to keep an external DATABASE_URL, run with:
#   PRESERVE_DATABASE_URL=1 sudo -E bash scripts/debian12-oilbar-startup.sh

set -Eeuo pipefail

APP_NAME="${APP_NAME:-oilbar}"
APP_USER="${APP_USER:-oilbar}"
APP_GROUP="${APP_GROUP:-oilbar}"
APP_DIR="${APP_DIR:-$(pwd)}"
if [[ -n "${ENV_FILE:-}" ]]; then
  ENV_FILE="$ENV_FILE"
elif [[ -f "$APP_DIR/.env" ]]; then
  ENV_FILE="$APP_DIR/.env"
elif [[ -f "$APP_DIR/.env.production" ]]; then
  ENV_FILE="$APP_DIR/.env.production"
else
  ENV_FILE="$APP_DIR/.env"
fi
ENV_TEMPLATE="${ENV_TEMPLATE:-$APP_DIR/.env.production.example}"
DOTENV_FILE="$APP_DIR/.env"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/oilbar}"
WEB_PORT="${WEB_PORT:-3000}"
PAYMENT_PORT="${PAYMENT_PORT:-3001}"
NODE_MAJOR="${NODE_MAJOR:-22}"
DB_NAME="${DB_NAME:-oilbar}"
DB_USER="${DB_USER:-oilbar}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
APP_DOMAIN="${APP_DOMAIN:-www.oilbar.ir}"
ROOT_DOMAIN="${ROOT_DOMAIN:-oilbar.ir}"
API_DOMAIN="${API_DOMAIN:-api.oilbar.ir}"
INSTALL_LETSENCRYPT="${INSTALL_LETSENCRYPT:-0}"
SKIP_TESTS="${SKIP_TESTS:-0}"
FORCE_ENV="${FORCE_ENV:-0}"
PRESERVE_DATABASE_URL="${PRESERVE_DATABASE_URL:-0}"
IMPORT_SOURCE_DATABASE="${IMPORT_SOURCE_DATABASE:-1}"
DATABASE_IS_LOCAL="0"
ENV_BACKUP_CREATED="0"
SOURCE_DATABASE_URL=""
POSTGRES_SERVER_MAJOR="${POSTGRES_SERVER_MAJOR:-15}"
POSTGRES_DUMP_MAJOR="${POSTGRES_DUMP_MAJOR:-17}"
PSQL_BIN="${PSQL_BIN:-psql}"
PG_DUMP_BIN="${PG_DUMP_BIN:-pg_dump}"
PG_RESTORE_BIN="${PG_RESTORE_BIN:-pg_restore}"

RED=$'\033[31m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
BLUE=$'\033[34m'
RESET=$'\033[0m'

log() {
  echo "${BLUE}==>${RESET} $*"
}

ok() {
  echo "${GREEN}OK:${RESET} $*"
}

warn() {
  echo "${YELLOW}WARN:${RESET} $*"
}

fail() {
  echo "${RED}ERROR:${RESET} $*" >&2
  exit 1
}

on_error() {
  local exit_code=$?
  echo
  echo "${RED}Deployment stopped at line ${BASH_LINENO[0]} with exit code $exit_code.${RESET}" >&2
  echo "Useful checks:" >&2
  echo "  journalctl -u oilbar-web -n 100 --no-pager" >&2
  echo "  journalctl -u oilbar-payment -n 100 --no-pager" >&2
  echo "  nginx -t" >&2
  echo "  systemctl status oilbar-web oilbar-payment nginx postgresql --no-pager" >&2
  exit "$exit_code"
}
trap on_error ERR

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    fail "Run as root: sudo bash scripts/debian12-oilbar-startup.sh"
  fi
}

validate_os() {
  log "Validating operating system"
  [[ -r /etc/os-release ]] || fail "/etc/os-release not found"
  # shellcheck disable=SC1091
  . /etc/os-release
  [[ "${ID:-}" == "debian" ]] || fail "This script is for Debian. Detected: ${ID:-unknown}"
  [[ "${VERSION_ID:-}" == "12" ]] || fail "This script is for Debian 12. Detected: ${VERSION_ID:-unknown}"
  local arch
  arch="$(uname -m)"
  [[ "$arch" == "x86_64" ]] || fail "This script is for x86_64. Detected: $arch"
  ok "Debian 12 x64 detected"
}

validate_project() {
  log "Validating project directory"
  [[ -d "$APP_DIR" ]] || fail "APP_DIR not found: $APP_DIR"
  [[ -f "$APP_DIR/package.json" ]] || fail "package.json not found in $APP_DIR"
  [[ -f "$APP_DIR/package-lock.json" ]] || fail "package-lock.json not found in $APP_DIR"
  [[ -f "$APP_DIR/prisma/schema.prisma" ]] || fail "prisma/schema.prisma not found"
  [[ -f "$APP_DIR/next.config.ts" ]] || fail "next.config.ts not found"
  [[ -f "$APP_DIR/payment-service/src/server.ts" ]] || fail "payment-service/src/server.ts not found"
  ok "Oilbar project files are present"
}

is_placeholder_value() {
  local value="$1"
  [[ -z "$value" ]] && return 0
  [[ "$value" == "change-me" ]] && return 0
  [[ "$value" == change-me-* ]] && return 0
  [[ "$value" == "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" ]] && return 0
  [[ "$value" == *"USER:PASSWORD"* ]] && return 0
  return 1
}

load_env_template_defaults() {
  if [[ ! -f "$ENV_TEMPLATE" ]]; then
    return 0
  fi
  log "Loading safe defaults from $ENV_TEMPLATE"
  local line key value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" || "$line" == \#* || "$line" != *=* ]] && continue
    key="${line%%=*}"
    value="${line#*=}"
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    value="${value%$'\r'}"
    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi
    if [[ -z "${!key:-}" ]]; then
      printf -v "$key" '%s' "$value"
    fi
  done < "$ENV_TEMPLATE"
}

generate_secret() {
  openssl rand -hex 32
}

shell_quote() {
  local value="$1"
  printf "'%s'" "${value//\'/\'\\\'\'}"
}

unique_words() {
  local item
  local result=()
  for item in "$@"; do
    [[ -z "$item" ]] && continue
    if [[ " ${result[*]} " != *" $item "* ]]; then
      result+=("$item")
    fi
  done
  printf '%s' "${result[*]}"
}

install_base_packages() {
  log "Installing base packages"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https \
    build-essential \
    git \
    python3 \
    openssl \
    nginx \
    "postgresql-$POSTGRES_SERVER_MAJOR" \
    "postgresql-contrib-$POSTGRES_SERVER_MAJOR" \
    ufw \
    jq \
    unzip \
    rsync \
    logrotate
  ok "Base packages installed"
}

select_postgres_tools() {
  local preferred_major="$POSTGRES_DUMP_MAJOR"
  local major
  for major in "$preferred_major" 18 17 16 "$POSTGRES_SERVER_MAJOR" 15; do
    if [[ -x "/usr/lib/postgresql/$major/bin/pg_dump" && -x "/usr/lib/postgresql/$major/bin/pg_restore" ]]; then
      PG_DUMP_BIN="/usr/lib/postgresql/$major/bin/pg_dump"
      PG_RESTORE_BIN="/usr/lib/postgresql/$major/bin/pg_restore"
      break
    fi
  done
  for major in "$POSTGRES_SERVER_MAJOR" "$preferred_major" 18 17 16 15; do
    if [[ -x "/usr/lib/postgresql/$major/bin/psql" ]]; then
      PSQL_BIN="/usr/lib/postgresql/$major/bin/psql"
      break
    fi
  done

  [[ -x "$PG_DUMP_BIN" || -n "$(command -v "$PG_DUMP_BIN" 2>/dev/null)" ]] || fail "pg_dump was not found"
  [[ -x "$PG_RESTORE_BIN" || -n "$(command -v "$PG_RESTORE_BIN" 2>/dev/null)" ]] || fail "pg_restore was not found"
  [[ -x "$PSQL_BIN" || -n "$(command -v "$PSQL_BIN" 2>/dev/null)" ]] || fail "psql was not found"
  ok "PostgreSQL tools: $("$PSQL_BIN" --version), $("$PG_DUMP_BIN" --version), $("$PG_RESTORE_BIN" --version)"
}

install_node() {
  log "Installing/validating Node.js"
  local current_major=""
  if command -v node >/dev/null 2>&1; then
    current_major="$(node -p "process.versions.node.split('.')[0]" || true)"
  fi

  if [[ "$current_major" =~ ^[0-9]+$ ]] && (( current_major >= NODE_MAJOR )); then
    ok "Node.js $(node -v) is already installed"
  else
    warn "Installing Node.js $NODE_MAJOR from NodeSource"
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    apt-get install -y nodejs
  fi

  command -v node >/dev/null 2>&1 || fail "node was not installed"
  command -v npm >/dev/null 2>&1 || fail "npm was not installed"

  local version_ok
  version_ok="$(node -e "const [M,m]=process.versions.node.split('.').map(Number); process.exit(M>18 || (M===18 && m>=18) ? 0 : 1)" && echo yes || echo no)"
  [[ "$version_ok" == "yes" ]] || fail "Next.js 15 needs Node >= 18.18. Current: $(node -v)"
  ok "Node $(node -v), npm $(npm -v)"
}

create_app_user() {
  log "Preparing Linux user"
  if ! getent group "$APP_GROUP" >/dev/null 2>&1; then
    groupadd --system "$APP_GROUP"
  fi
  if ! id "$APP_USER" >/dev/null 2>&1; then
    useradd --system --create-home --home-dir "/home/$APP_USER" --shell /bin/bash --gid "$APP_GROUP" "$APP_USER"
  fi
  usermod -aG "$APP_GROUP" "$APP_USER" >/dev/null 2>&1 || true
  if [[ "$APP_DIR" != /opt/* ]]; then
    warn "APP_DIR is $APP_DIR. Recommended production path is /opt/oilbar."
  fi
  mkdir -p "$APP_DIR/public/uploads" "$BACKUP_DIR"
  chown -R "$APP_USER:$APP_GROUP" "$APP_DIR"
  chown -R "$APP_USER:$APP_GROUP" "$BACKUP_DIR"
  ok "User $APP_USER is ready"
}

setup_swap_if_needed() {
  log "Checking memory/swap"
  local mem_mb swap_mb
  mem_mb="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)"
  swap_mb="$(awk '/SwapTotal/ {print int($2/1024)}' /proc/meminfo)"
  if (( mem_mb < 7800 && swap_mb < 1024 )); then
    warn "RAM is ${mem_mb}MB and swap is ${swap_mb}MB. Creating 2GB swapfile."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  ok "Memory: ${mem_mb}MB, Swap: $(awk '/SwapTotal/ {print int($2/1024)}' /proc/meminfo)MB"
}

setup_postgres() {
  log "Setting up PostgreSQL"
  if [[ "$DATABASE_IS_LOCAL" != "1" ]]; then
    warn "Skipping local PostgreSQL setup because DATABASE_URL does not point to localhost."
    return 0
  fi
  [[ "$DB_USER" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]] || fail "DB_USER must be a safe PostgreSQL identifier"
  [[ "$DB_NAME" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]] || fail "DB_NAME must be a safe PostgreSQL identifier"
  systemctl enable --now postgresql
  local db_password_file="/root/.oilbar-db-password"
  if [[ -z "${DB_PASSWORD:-}" ]]; then
    if [[ -f "$db_password_file" ]]; then
      DB_PASSWORD="$(<"$db_password_file")"
    else
      DB_PASSWORD="$(openssl rand -base64 36 | tr -d '\n')"
      umask 077
      printf '%s' "$DB_PASSWORD" > "$db_password_file"
      umask 022
    fi
  fi
  [[ "$DB_PASSWORD" != *"'"* ]] || fail "DB_PASSWORD must not contain a single quote. Leave it empty and the script will generate a safe one."

  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO
\$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '${DB_USER}', '${DB_PASSWORD}');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH LOGIN PASSWORD %L', '${DB_USER}', '${DB_PASSWORD}');
  END IF;
END
\$\$;
SQL

  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
    sudo -u postgres createdb --owner="$DB_USER" "$DB_NAME"
  fi

  sudo -u postgres psql -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL

  ok "PostgreSQL database $DB_NAME and user $DB_USER are ready"
}

database_url() {
  local encoded_password
  encoded_password="$(python3 - <<PY
from urllib.parse import quote
print(quote("""${DB_PASSWORD}""", safe=""))
PY
)"
  printf 'postgresql://%s:%s@%s:%s/%s?schema=public' "$DB_USER" "$encoded_password" "$DB_HOST" "$DB_PORT" "$DB_NAME"
}

backup_env_once() {
  if [[ "$ENV_BACKUP_CREATED" == "1" ]]; then
    return 0
  fi
  local backup_path
  backup_path="$ENV_FILE.backup-$(date +%Y%m%d-%H%M%S)"
  cp "$ENV_FILE" "$backup_path"
  chmod 600 "$backup_path"
  ENV_BACKUP_CREATED="1"
  warn "A backup of the received env file was saved at $backup_path"
}

source_env_file() {
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
}

upsert_env_value() {
  local key="$1"
  local value="$2"
  backup_env_once
  python3 - "$ENV_FILE" "$key" "$value" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]

def quote(v: str) -> str:
    return "'" + v.replace("'", "'\\''") + "'"

line = f"{key}={quote(value)}"
lines = path.read_text().splitlines()
out = []
found = False
for existing in lines:
    stripped = existing.strip()
    if stripped.startswith(f"{key}=") or stripped.startswith(f"export {key}="):
        out.append(line)
        found = True
    else:
        out.append(existing)
if not found:
    if out and out[-1].strip():
        out.append("")
    out.append(line)
path.write_text("\n".join(out) + "\n")
PY
  export "$key=$value"
}

url_host() {
  local value="$1"
  python3 - "$value" <<'PY'
from urllib.parse import urlparse
import sys
value = sys.argv[1]
if not value:
    print("")
    raise SystemExit
parsed = urlparse(value if "://" in value else f"https://{value}")
print(parsed.hostname or "")
PY
}

postgres_tool_url() {
  local value="$1"
  python3 - "$value" <<'PY'
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
import sys

value = sys.argv[1]
parsed = urlparse(value)
query = [(k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=True) if k.lower() != "schema"]
print(urlunparse(parsed._replace(query=urlencode(query))))
PY
}

latest_backup_database_url() {
  python3 - "$ENV_FILE" <<'PY'
from pathlib import Path
from urllib.parse import urlparse
import sys

env = Path(sys.argv[1])
backups = sorted(env.parent.glob(env.name + ".backup-*"), key=lambda p: p.stat().st_mtime, reverse=True)
for path in backups:
    try:
        for raw in path.read_text().splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            if key.strip().replace("export ", "") != "DATABASE_URL":
                continue
            value = value.strip().strip('"').strip("'")
            host = urlparse(value).hostname or ""
            if host not in {"", "127.0.0.1", "localhost", "::1"}:
                print(value)
                raise SystemExit
    except Exception:
        continue
PY
}

derive_domains_from_env() {
  local app_host api_host
  app_host="$(url_host "${NEXT_PUBLIC_APP_URL:-${NEXTAUTH_URL:-}}")"
  api_host="$(url_host "${PAYMENT_API_BASE_URL:-${NEXT_PUBLIC_PAYMENT_API_BASE_URL:-}}")"
  if [[ -n "$app_host" ]]; then
    APP_DOMAIN="$app_host"
    ROOT_DOMAIN="${ROOT_DOMAIN:-${app_host#www.}}"
  fi
  if [[ -n "$api_host" ]]; then
    API_DOMAIN="$api_host"
  fi
}

ensure_generated_secret() {
  local key="$1"
  local current="${!key:-}"
  if is_placeholder_value "$current"; then
    upsert_env_value "$key" "$(generate_secret)"
  fi
}

parse_database_url_into_vars() {
  local parsed
  parsed="$(python3 - "${DATABASE_URL:-}" <<'PY'
from urllib.parse import urlparse, unquote
import sys

url = sys.argv[1]
if not url:
    raise SystemExit(1)
parsed = urlparse(url)
host = parsed.hostname or ""
port = str(parsed.port or 5432)
user = unquote(parsed.username or "")
password = unquote(parsed.password or "")
name = (parsed.path or "/").lstrip("/").split("/", 1)[0]
is_local = "1" if host in {"127.0.0.1", "localhost", "::1"} else "0"
print("\t".join([user, password, host, port, name, is_local]))
PY
)"
  IFS=$'\t' read -r DB_USER DB_PASSWORD DB_HOST DB_PORT DB_NAME DATABASE_IS_LOCAL <<< "$parsed"
  export DB_USER DB_PASSWORD DB_HOST DB_PORT DB_NAME DATABASE_IS_LOCAL
}

normalize_received_env_file() {
  log "Preparing production environment from received .env"
  if [[ ! -f "$ENV_FILE" ]]; then
    fail "Env file not found: $ENV_FILE. Upload it first, for example: scp .env root@SERVER:$APP_DIR/.env"
  fi

  chmod 600 "$ENV_FILE"
  source_env_file
  load_env_template_defaults
  derive_domains_from_env
  SOURCE_DATABASE_URL="${DATABASE_URL:-}"
  if [[ -n "$SOURCE_DATABASE_URL" ]]; then
    local initial_source_host
    initial_source_host="$(url_host "$SOURCE_DATABASE_URL")"
    if [[ "$initial_source_host" == "127.0.0.1" || "$initial_source_host" == "localhost" || "$initial_source_host" == "::1" ]]; then
      local backup_source_url
      backup_source_url="$(latest_backup_database_url || true)"
      if [[ -n "$backup_source_url" ]]; then
        SOURCE_DATABASE_URL="$backup_source_url"
      fi
    fi
  fi

  ensure_generated_secret "NEXTAUTH_SECRET"
  ensure_generated_secret "PAYMENT_SERVICE_SECRET"
  if [[ -z "${CRON_SECRET:-}" ]]; then
    upsert_env_value "CRON_SECRET" "$(generate_secret)"
  fi

  if [[ -z "${NEXTAUTH_URL:-}" ]]; then
    upsert_env_value "NEXTAUTH_URL" "https://$APP_DOMAIN"
  fi
  if [[ -z "${NEXT_PUBLIC_APP_URL:-}" ]]; then
    upsert_env_value "NEXT_PUBLIC_APP_URL" "https://$APP_DOMAIN"
  fi
  if [[ -z "${FRONTEND_BASE_URL:-}" ]]; then
    upsert_env_value "FRONTEND_BASE_URL" "https://$APP_DOMAIN"
  fi
  if [[ -z "${PAYMENT_API_BASE_URL:-}" ]]; then
    upsert_env_value "PAYMENT_API_BASE_URL" "https://$API_DOMAIN"
  fi
  if [[ -z "${NEXT_PUBLIC_PAYMENT_API_BASE_URL:-}" ]]; then
    upsert_env_value "NEXT_PUBLIC_PAYMENT_API_BASE_URL" "https://$API_DOMAIN"
  fi
  if [[ -z "${ZARINPAL_CALLBACK_URL:-}" ]]; then
    upsert_env_value "ZARINPAL_CALLBACK_URL" "https://$API_DOMAIN/api/payments/zarinpal/callback"
  fi
  if [[ -z "${NODE_ENV:-}" ]]; then
    upsert_env_value "NODE_ENV" "production"
  fi
  if [[ -z "${PORT:-}" ]]; then
    upsert_env_value "PORT" "$PAYMENT_PORT"
  fi

  if [[ "$PRESERVE_DATABASE_URL" != "1" ]]; then
    if [[ -z "${DB_PASSWORD:-}" ]]; then
      local db_password_file="/root/.oilbar-db-password"
      if [[ -f "$db_password_file" ]]; then
        DB_PASSWORD="$(<"$db_password_file")"
      else
        DB_PASSWORD="$(openssl rand -base64 36 | tr -d '\n')"
        umask 077
        printf '%s' "$DB_PASSWORD" > "$db_password_file"
        umask 022
      fi
    fi
    [[ "$DB_PASSWORD" != *"'"* ]] || fail "Generated DB password is invalid; remove /root/.oilbar-db-password and retry."
    upsert_env_value "DATABASE_URL" "$(database_url)"
  elif [[ -z "${DATABASE_URL:-}" ]]; then
    fail "DATABASE_URL is missing in $ENV_FILE"
  fi

  source_env_file
  parse_database_url_into_vars

  if [[ "$DATABASE_IS_LOCAL" != "1" ]]; then
    warn "DATABASE_URL is not local. Set PRESERVE_DATABASE_URL=0 or remove it from .env if you want this VPS to host PostgreSQL."
  fi
  if is_placeholder_value "${ZARINPAL_MERCHANT_ID:-}"; then
    warn "ZARINPAL_MERCHANT_ID is missing or placeholder. Payments will not work until you edit $ENV_FILE."
  fi
  if [[ "${SMS_ENABLED:-true}" == "true" ]] && is_placeholder_value "${SMSIR_API_KEY:-}"; then
    warn "SMS is enabled but SMSIR_API_KEY is missing or placeholder. OTP/SMS will not work until you edit $ENV_FILE."
  fi

  chown root:"$APP_GROUP" "$ENV_FILE"
  chmod 640 "$ENV_FILE"
  if [[ "$ENV_FILE" != "$DOTENV_FILE" ]]; then
    ln -sfn "$(basename "$ENV_FILE")" "$DOTENV_FILE"
    chown -h "$APP_USER:$APP_GROUP" "$DOTENV_FILE" || true
  fi

  ok "Using environment file: $ENV_FILE"
}

migrate_source_database_if_needed() {
  if [[ "$IMPORT_SOURCE_DATABASE" != "1" ]]; then
    warn "Skipping source database import because IMPORT_SOURCE_DATABASE=$IMPORT_SOURCE_DATABASE"
    return 0
  fi
  if [[ "$PRESERVE_DATABASE_URL" == "1" ]]; then
    warn "Skipping source database import because DATABASE_URL was preserved."
    return 0
  fi
  if [[ -z "$SOURCE_DATABASE_URL" ]]; then
    warn "Skipping source database import because no source DATABASE_URL was found in received .env."
    return 0
  fi
  local source_host target_host
  source_host="$(url_host "$SOURCE_DATABASE_URL")"
  target_host="$(url_host "$DATABASE_URL")"
  if [[ "$source_host" == "$target_host" || "$source_host" == "127.0.0.1" || "$source_host" == "localhost" ]]; then
    warn "Skipping source database import because source DATABASE_URL is already local."
    return 0
  fi

  log "Checking whether local database is empty before importing source data"
  local table_count
  local target_pg_url
  target_pg_url="$(postgres_tool_url "$DATABASE_URL")"
  select_postgres_tools
  table_count="$("$PSQL_BIN" "$target_pg_url" -tAc "SELECT count(*) FROM pg_tables WHERE schemaname = 'public';" | tr -d '[:space:]')"
  if [[ "${table_count:-0}" != "0" ]]; then
    warn "Local database already has $table_count public tables; skipping source import to avoid overwriting data."
    return 0
  fi

  log "Importing existing production database into local PostgreSQL"
  local dump_file
  local source_pg_url
  source_pg_url="$(postgres_tool_url "$SOURCE_DATABASE_URL")"
  dump_file="/root/oilbar-source-$(date +%Y%m%d-%H%M%S).dump"
  umask 077
  if ! "$PG_DUMP_BIN" --format=custom --no-owner --no-privileges --file="$dump_file" "$source_pg_url"; then
    rm -f "$dump_file"
    fail "Could not dump source database. If the source Postgres is newer than pg_dump, install a matching postgresql-client version and rerun."
  fi
  local restore_log
  restore_log="$(mktemp)"
  if ! "$PG_RESTORE_BIN" --no-owner --no-privileges --dbname="$target_pg_url" "$dump_file" 2>"$restore_log"; then
    if grep -q 'unrecognized configuration parameter "transaction_timeout"' "$restore_log" \
      && grep -q 'warning: errors ignored on restore: 1' "$restore_log"; then
      warn "PostgreSQL ignored one source-only setting (transaction_timeout); data restore continued."
    else
      sed -n '1,120p' "$restore_log" >&2
      rm -f "$restore_log"
      fail "Could not restore source database dump: $dump_file"
    fi
  fi
  rm -f "$restore_log"
  rm -f "$dump_file"
  umask 022
  ok "Source database was imported into local PostgreSQL"
}

run_as_app() {
  sudo -u "$APP_USER" -H bash -lc "cd $(printf '%q' "$APP_DIR") && set -a && source $(printf '%q' "$ENV_FILE") && set +a && $*"
}

install_dependencies_and_build() {
  log "Installing project dependencies"
  run_as_app "npm ci --include=dev"

  log "Generating Prisma client"
  run_as_app "npx prisma generate"

  log "Validating database connectivity"
  run_as_app "node - <<'NODE'
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1 AS ok\`
  .then(() => console.log('database-ok'))
  .finally(() => prisma.\$disconnect())
  .catch((error) => { console.error(error); process.exit(1); });
NODE"

  log "Running database migrations"
  run_as_app "npx prisma migrate deploy"
  run_as_app "npx prisma migrate status"

  log "Running lint"
  run_as_app "npm run lint"

  if [[ "$SKIP_TESTS" == "1" ]]; then
    warn "Skipping tests because SKIP_TESTS=1"
  else
    log "Running tests"
    run_as_app "npm test"
  fi

  log "Building Next.js production bundle"
  run_as_app "npx next build"
  ok "Project build completed"
}

write_systemd_units() {
  log "Writing systemd services"
  cat > /etc/systemd/system/oilbar-web.service <<UNIT
[Unit]
Description=Oilbar Next.js storefront
After=network-online.target postgresql.service
Wants=network-online.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_FILE
Environment=NODE_ENV=production
Environment=PORT=$WEB_PORT
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/npm exec -- next start -H 127.0.0.1 -p $WEB_PORT
Restart=always
RestartSec=5
TimeoutStartSec=60
NoNewPrivileges=true
PrivateTmp=true
ReadWritePaths=$APP_DIR/public/uploads $APP_DIR/.next/cache

[Install]
WantedBy=multi-user.target
UNIT

  cat > /etc/systemd/system/oilbar-payment.service <<UNIT
[Unit]
Description=Oilbar payment API service
After=network-online.target postgresql.service
Wants=network-online.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_FILE
Environment=NODE_ENV=production
Environment=PORT=$PAYMENT_PORT
ExecStart=/usr/bin/npm run payment-service
Restart=always
RestartSec=5
TimeoutStartSec=60
NoNewPrivileges=true
PrivateTmp=true
ReadWritePaths=$APP_DIR/public/uploads

[Install]
WantedBy=multi-user.target
UNIT

  systemctl daemon-reload
  systemctl enable oilbar-web oilbar-payment
  systemctl restart oilbar-web oilbar-payment
  ok "systemd services started"
}

write_nginx_config() {
  log "Writing Nginx reverse proxy"
  local storefront_server_names
  storefront_server_names="$(unique_words "$APP_DOMAIN" "$ROOT_DOMAIN")"
  cat > /etc/nginx/sites-available/oilbar.conf <<NGINX
map \$http_upgrade \$connection_upgrade {
  default upgrade;
  '' close;
}

upstream oilbar_web {
  server 127.0.0.1:$WEB_PORT;
}

upstream oilbar_payment {
  server 127.0.0.1:$PAYMENT_PORT;
}

server {
  listen 80;
  listen [::]:80;
  server_name $storefront_server_names;

  client_max_body_size 20m;

  location / {
    proxy_pass http://oilbar_web;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \$connection_upgrade;
    proxy_read_timeout 120s;
  }
}

server {
  listen 80;
  listen [::]:80;
  server_name $API_DOMAIN;

  client_max_body_size 10m;

  location / {
    proxy_pass http://oilbar_payment;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 120s;
  }
}
NGINX

  ln -sfn /etc/nginx/sites-available/oilbar.conf /etc/nginx/sites-enabled/oilbar.conf
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl enable --now nginx
  systemctl reload nginx
  ok "Nginx is ready"
}

setup_firewall() {
  log "Configuring firewall"
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
  ok "Firewall enabled"
}

public_ip() {
  curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || true
}

domain_ipv4() {
  local domain="$1"
  getent ahostsv4 "$domain" | awk '{print $1; exit}' || true
}

maybe_install_letsencrypt() {
  if [[ "$INSTALL_LETSENCRYPT" != "1" ]]; then
    warn "Skipping Let's Encrypt. Site will be HTTP until SSL is configured."
    return 0
  fi

  log "Validating DNS before Let's Encrypt"
  local server_ip app_ip root_ip api_ip
  server_ip="$(public_ip)"
  app_ip="$(domain_ipv4 "$APP_DOMAIN")"
  root_ip="$(domain_ipv4 "$ROOT_DOMAIN")"
  api_ip="$(domain_ipv4 "$API_DOMAIN")"
  warn "Server public IP: ${server_ip:-unknown}"
  warn "$APP_DOMAIN -> ${app_ip:-not-resolved}"
  warn "$ROOT_DOMAIN -> ${root_ip:-not-resolved}"
  warn "$API_DOMAIN -> ${api_ip:-not-resolved}"

  local certbot_domains=()
  local domain
  for domain in "$APP_DOMAIN" "$ROOT_DOMAIN" "$API_DOMAIN"; do
    [[ -z "$domain" ]] && continue
    if [[ " ${certbot_domains[*]} " != *" $domain "* ]]; then
      certbot_domains+=("$domain")
    fi
  done
  local certbot_args=()
  for domain in "${certbot_domains[@]}"; do
    certbot_args+=("-d" "$domain")
  done

  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx \
    "${certbot_args[@]}" \
    --redirect \
    --agree-tos \
    --no-eff-email \
    -m "${LETSENCRYPT_EMAIL:-admin@$ROOT_DOMAIN}"
  systemctl reload nginx
  ok "SSL installed"
}

write_backup_tools() {
  log "Writing backup tools"
  cat > /usr/local/bin/oilbar-backup.sh <<BACKUP
#!/usr/bin/env bash
set -Eeuo pipefail
APP_DIR="$APP_DIR"
ENV_FILE="$ENV_FILE"
BACKUP_DIR="$BACKUP_DIR"
DATE="\$(date +%Y%m%d-%H%M%S)"
mkdir -p "\$BACKUP_DIR"
set -a
source "\$ENV_FILE"
set +a
DB_FILE="\$BACKUP_DIR/oilbar-db-\$DATE.sql.gz"
UPLOADS_FILE="\$BACKUP_DIR/oilbar-uploads-\$DATE.tar.gz"
pg_dump "\$DATABASE_URL" | gzip -9 > "\$DB_FILE"
if [[ -d "\$APP_DIR/public/uploads" ]]; then
  tar -C "\$APP_DIR/public" -czf "\$UPLOADS_FILE" uploads
fi
find "\$BACKUP_DIR" -type f -name 'oilbar-*' -mtime +14 -delete
echo "Backup complete:"
echo "  \$DB_FILE"
echo "  \$UPLOADS_FILE"
BACKUP
  chmod +x /usr/local/bin/oilbar-backup.sh

  cat > /etc/systemd/system/oilbar-backup.service <<UNIT
[Unit]
Description=Oilbar daily backup

[Service]
Type=oneshot
User=$APP_USER
Group=$APP_GROUP
ExecStart=/usr/local/bin/oilbar-backup.sh
UNIT

  cat > /etc/systemd/system/oilbar-backup.timer <<UNIT
[Unit]
Description=Run Oilbar backup daily

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true

[Install]
WantedBy=timers.target
UNIT

  systemctl daemon-reload
  systemctl enable --now oilbar-backup.timer
  ok "Daily backup timer enabled"
}

write_deploy_tool() {
  log "Writing deploy helper"
  cat > /usr/local/bin/oilbar-deploy.sh <<DEPLOY
#!/usr/bin/env bash
set -Eeuo pipefail
APP_DIR="$APP_DIR"
ENV_FILE="$ENV_FILE"
APP_USER="$APP_USER"
cd "\$APP_DIR"
if [[ -d .git ]]; then
  git pull --ff-only
fi
chown -R "\$APP_USER:$APP_USER" "\$APP_DIR"
sudo -u "\$APP_USER" -H bash -lc "cd '\$APP_DIR' && set -a && source '\$ENV_FILE' && set +a && npm ci && npx prisma generate && npx prisma migrate deploy && npm run lint && npx next build"
systemctl restart oilbar-web oilbar-payment
systemctl --no-pager --full status oilbar-web oilbar-payment
DEPLOY
  chmod +x /usr/local/bin/oilbar-deploy.sh
  ok "Deploy helper installed: /usr/local/bin/oilbar-deploy.sh"
}

health_checks() {
  log "Running final health checks"
  systemctl is-active --quiet postgresql || fail "PostgreSQL is not active"
  systemctl is-active --quiet oilbar-web || fail "oilbar-web is not active"
  systemctl is-active --quiet oilbar-payment || fail "oilbar-payment is not active"
  systemctl is-active --quiet nginx || fail "nginx is not active"

  run_as_app "node - <<'NODE'
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1 AS ok\`
  .then(() => console.log('database-ok'))
  .finally(() => prisma.\$disconnect())
  .catch((error) => { console.error(error); process.exit(1); });
NODE"

  curl -fsS --max-time 20 "http://127.0.0.1:$WEB_PORT" >/dev/null || fail "Next.js local health check failed"
  curl -fsS --max-time 20 "http://127.0.0.1:$PAYMENT_PORT/health" >/dev/null || fail "Payment service health check failed"
  nginx -t
  ok "Local health checks passed"

  echo
  echo "Service status:"
  systemctl --no-pager --full status oilbar-web oilbar-payment nginx postgresql | sed -n '1,90p' || true
}

print_summary() {
  cat <<SUMMARY

${GREEN}Oilbar server bootstrap completed.${RESET}

Project:
  $APP_DIR

Domains:
  Storefront: https://$APP_DOMAIN
  Root:       https://$ROOT_DOMAIN
  Payment:   https://$API_DOMAIN

Services:
  oilbar-web      -> 127.0.0.1:$WEB_PORT
  oilbar-payment  -> 127.0.0.1:$PAYMENT_PORT
  postgresql
  nginx

Important files:
  Env:       $ENV_FILE
  Nginx:     /etc/nginx/sites-available/oilbar.conf
  Services:  /etc/systemd/system/oilbar-web.service
             /etc/systemd/system/oilbar-payment.service
  Backup:    /usr/local/bin/oilbar-backup.sh
  Deploy:    /usr/local/bin/oilbar-deploy.sh

Useful commands:
  journalctl -u oilbar-web -f
  journalctl -u oilbar-payment -f
  systemctl restart oilbar-web oilbar-payment
  /usr/local/bin/oilbar-backup.sh
  /usr/local/bin/oilbar-deploy.sh

Next manual checks:
  1. Make sure DNS A records point to this server.
  2. Fill missing secrets in $ENV_FILE if any warnings were shown.
  3. Confirm ZarinPal callback is:
     https://$API_DOMAIN/api/payments/zarinpal/callback
  4. Test OTP login, add-to-cart, checkout, payment callback, admin login, and order SMS.

SUMMARY
}

main() {
  require_root
  validate_os
  validate_project
  install_base_packages
  install_node
  create_app_user
  setup_swap_if_needed
  normalize_received_env_file
  setup_postgres
  migrate_source_database_if_needed
  install_dependencies_and_build
  write_systemd_units
  write_nginx_config
  setup_firewall
  maybe_install_letsencrypt
  write_backup_tools
  write_deploy_tool
  health_checks
  print_summary
}

main "$@"
