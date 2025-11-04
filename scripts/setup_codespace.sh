#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$REPO_ROOT"

echo "[Setup] Updating apt package index..."
sudo apt-get update -y

echo "[Setup] Installing PostgreSQL packages..."
sudo apt-get install -y postgresql postgresql-contrib

echo "[Setup] Starting PostgreSQL service..."
sudo service postgresql start

create_role_if_absent() {
  local role="$1"
  local password="$2"
  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${role}'" | grep -q 1; then
    echo "[Setup] Creating PostgreSQL role '${role}'..."
    sudo -u postgres psql -c "CREATE USER ${role} WITH PASSWORD '${password}';"
  else
    echo "[Setup] Role '${role}' already exists. Ensuring password is up to date..."
    sudo -u postgres psql -c "ALTER USER ${role} WITH PASSWORD '${password}';"
  fi
}

create_database_if_absent() {
  local db="$1"
  local owner="$2"
  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'" | grep -q 1; then
    echo "[Setup] Creating PostgreSQL database '${db}' owned by '${owner}'..."
    sudo -u postgres psql -c "CREATE DATABASE ${db} OWNER ${owner};"
  else
    echo "[Setup] Database '${db}' already exists."
  fi
}

ensure_database_seeded() {
  local db="$1"
  local table_check="$2"
  local sql_file="$3"
  if ! sudo -u postgres psql -d "$db" -tAc "$table_check" | grep -q 1; then
    echo "[Setup] Loading initial schema and data from ${sql_file}..."
    sudo -u postgres psql -d "$db" -f "$sql_file"
  else
    echo "[Setup] Database '${db}' already contains seed data. Skipping init script."
  fi
}

create_role_if_absent "crm_user" "securepassword"
create_database_if_absent "crm_saas" "crm_user"
ensure_database_seeded "crm_saas" "SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas'" "${REPO_ROOT}/database/init.sql"

copy_env_file() {
  local source_file="$1"
  local target_file="$2"
  if [ ! -f "$target_file" ]; then
    echo "[Setup] Copying $(basename "$source_file") to $(dirname "$target_file")..."
    cp "$source_file" "$target_file"
  else
    echo "[Setup] $(basename "$target_file") already exists. Skipping copy."
  fi
}

copy_env_file "${REPO_ROOT}/backend/.env.example" "${REPO_ROOT}/backend/.env"
copy_env_file "${REPO_ROOT}/frontend/.env.example" "${REPO_ROOT}/frontend/.env"

install_dependencies() {
  local dir="$1"
  echo "[Setup] Installing npm dependencies in ${dir}..."
  cd "$dir"
  npm install
  cd "$REPO_ROOT"
}

install_dependencies "${REPO_ROOT}/backend"
install_dependencies "${REPO_ROOT}/frontend"

echo "[Setup] Codespace environment ready."
