#!/usr/bin/env bash
set -euo pipefail

# Variables
NODE_VERSION=18
DOMAIN=crm.example.com
EMAIL=admin@example.com

sudo apt update && sudo apt upgrade -y
sudo apt install -y curl gnupg build-essential nginx postgresql postgresql-contrib

curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pm2

sudo systemctl enable nginx
sudo systemctl start nginx

sudo -u postgres psql <<SQL
CREATE USER crm_user WITH PASSWORD 'securepassword';
CREATE DATABASE crm_saas OWNER crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_saas TO crm_user;
SQL

sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot

sudo certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" -m "$EMAIL" --agree-tos --non-interactive

sudo tee /etc/nginx/sites-available/crm <<'NGINX'
include /workspace/CRM/deploy/nginx.conf;
NGINX

sudo ln -sf /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/crm

sudo systemctl reload nginx

echo "Servidor preparado. Recuerda configurar variables de entorno y desplegar el código."
