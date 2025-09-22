#!/bin/bash

echo "Building Pimcore AI Starter Bundle..."
npm run build --prefix "$(dirname "${BASH_SOURCE[0]}")/assets/studio"

echo "Reinstalling assets..."
cd /var/www/html
bin/console assets:install -q