#!/usr/bin/env sh
set -e

APP_DIR=/var/www/html

if [ ! -f "$APP_DIR/artisan" ]; then
  echo "[init] No Laravel app found. Creating new project..."
  composer create-project laravel/laravel "$APP_DIR"
  cd "$APP_DIR"
  composer require laravel/sanctum fruitcake/laravel-cors --no-interaction
  php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
fi

cd "$APP_DIR"

# Ensure node/vite scaffolding will be used later
if ! grep -q "^VITE_" .env.example 2>/dev/null; then
  echo "VITE_API_BASE=/api" >> .env.example
fi

# Configure .env if missing
if [ ! -f .env ]; then
  cp .env.example .env
  php artisan key:generate
  sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=mysql/g' .env
  sed -i 's/DB_HOST=127.0.0.1/DB_HOST=db/g' .env
  sed -i 's/DB_PORT=3306/DB_PORT=3306/g' .env
  sed -i 's/DB_DATABASE=laravel/DB_DATABASE=alkanacoating/g' .env
  sed -i 's/DB_USERNAME=root/DB_USERNAME=app/g' .env
  sed -i 's/DB_PASSWORD=/DB_PASSWORD=app/g' .env
fi

# Ensure public/.htaccess for nginx/Apache parity
if [ ! -f public/.htaccess ]; then
  cp vendor/laravel/framework/src/Illuminate/Foundation/Resources/server.php public/index.php || true
fi

# Add basic CORS config
php -r '$f="config/cors.php"; if(!file_exists($f)){exit(0);} $c=file_get_contents($f); $c=str_replace("\'paths\' => [", "'paths' => ['api/*', 'sanctum/csrf-cookie', ", $c); file_put_contents($f,$c);'

# Create basic API route and controllers if not present
if ! grep -q "Route::get('/health'" routes/api.php; then
  cat >> routes/api.php <<'ROUTES'
Route::get('/health', fn() => response()->json(['ok' => true]));
ROUTES
fi

# Run pending migrations (will be no-op on first run before we add our migrations)
# Apply overlay (models, controllers, routes, migrations, seeders)
if [ -d /workspace/overlay ]; then
  echo "[init] Applying overlay..."
  cp -r /workspace/overlay/app/* app/ 2>/dev/null || true
  cp -r /workspace/overlay/database/* database/ 2>/dev/null || true
  cp -r /workspace/overlay/routes/* routes/ 2>/dev/null || true
fi

php artisan migrate --force || true
php artisan db:seed --force || true

exec "$@"
