# Alkana Coating – Full‑stack Website (Laravel + React)

This repository sets up:

- Backend: Laravel (PHP) with MySQL
- Frontend: React + Vite + Tailwind CSS
- Optional Docker dev stack (PHP-FPM + Nginx + MySQL + Node)

This setup uses MySQL from the start (no mock API). Docker will bootstrap Laravel, run migrations, and seed real sample data automatically.

## Dev options

### Option A — XAMPP (recommended cho Windows)

**Yêu cầu**: XAMPP đã cài và Apache + MySQL đang chạy

1. **Thêm PHP vào PATH**:

   - Mở System Properties → Environment Variables
   - Thêm `C:\xampp\php` vào PATH (hoặc đường dẫn XAMPP của bạn)
   - Restart terminal

2. **Cài Composer**: Download từ https://getcomposer.org/download/

3. **Tạo database**:

   - Mở http://localhost/phpmyadmin
   - Tạo database tên `alkanacoating`

4. **Setup Laravel backend**:

   ```bash
   cd backend
   composer create-project laravel/laravel .
   composer require laravel/sanctum fruitcake/laravel-cors
   php artisan key:generate
   ```

5. **Copy overlay và configure**:

   ```bash
   # Copy overlay files từ root project
   copy ..\overlay\app\* app\ /E
   copy ..\overlay\database\* database\ /E
   copy ..\overlay\routes\* routes\ /E
   ```

6. **Configure .env**:

   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=alkanacoating
   DB_USERNAME=root
   DB_PASSWORD=
   ```

7. **Run migrations và seed data**:

   ```bash
   php artisan migrate
   php artisan db:seed
   ```

8. **Start Laravel**:

   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```

9. **Start frontend** (terminal khác):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

10. **Truy cập**:
    - Backend: http://localhost:8000
    - API health: http://localhost:8000/api/health
    - Frontend: http://localhost:5173

### Option B — Docker

1. Install Docker Desktop for Windows.
2. From this folder, run:
   - `docker compose up -d --build`
3. Open:
   - Backend (Laravel via Nginx): http://localhost:8080
   - API health: http://localhost:8080/api/health
   - Frontend (run locally): see Frontend section

The first startup will auto-create a new Laravel app in `backend/`, configure database, and run migrations + seeders to insert sample data.

## Frontend

- Location: `frontend/`
- Dev: `npm run dev` → http://localhost:5173
- Build: `npm run build` (outputs to `frontend/dist/`)

For production with Laravel on shared hosting, you’ll commonly integrate Vite with Laravel and emit assets into `public/`. We can merge this React app into a Laravel Vite setup next.

## Backend (Laravel)

- Location: `backend/` (auto-created by Docker on first run)
- API examples planned:
  - `GET /api/health`
  - `GET /api/company`
  - `GET /api/categories`, `GET /api/products`, `GET /api/products/{slug}`
  - `GET /api/projects`, `GET /api/projects/{slug}`
  - `GET /api/posts`, `GET /api/posts/{slug}`
  - `GET /api/jobs`
  - `POST /api/contact` (send mail, log lead)

See `docs/api-contract.md` and `docs/sample-data.sql` (optional import).

## Deploy to Mat Bao Premium Cloud Hosting – Shop

- Set document root to Laravel’s `public/` folder.
- Ensure PHP >= 8.2, MySQL 8.0 is provisioned; create DB and import `docs/schema.sql`.
- Copy Laravel app files to hosting, set `.env` (APP*KEY, DB*\*, APP_URL).
- Build frontend with Vite and place assets under Laravel (either integrate Vite or copy `dist/` to `public/` and adjust index blade).
- Ensure `.htaccess` in `public/` is active for routing.

We’ll complete the Laravel migrations, models, controllers, and wire this React app into Laravel Vite after PHP/Composer/Docker is available locally.

## Scripts (optional)

- Docker up: `docker compose up -d --build`
- Docker logs: `docker compose logs -f app web db`
- Docker down: `docker compose down -v`

## Troubleshooting

- Node installed but Tailwind rules show as unknown in editor: that’s expected before Vite builds; run `npm run dev`.
- Port conflicts: change `5173` in `frontend/vite.config.js` or `8080` in `docker-compose.yml`.

## Run locally (Windows PowerShell)

Quick steps I used on Windows (PowerShell) to run this project locally. Paste these lines into a PowerShell window. Adjust paths if you use XAMPP or different DB settings.

Prerequisites: PHP (8.1+), Composer, Node.js (LTS), MySQL (or Docker).

1) Backend — install PHP deps and prepare DB:

```powershell
cd C:\dev\alkanacoating\backend
composer install
# If you don't have .env, copy from example:
if (-not (Test-Path .\.env)) { Copy-Item .\.env.example .\.env }
# Edit .env DB_* values if needed (DB_DATABASE=alkanacoating, DB_USERNAME=root)
php artisan key:generate
php artisan migrate --seed --force
php artisan serve --host=127.0.0.1 --port=8000
```

2) Frontend — install and run Vite dev server:

```powershell
cd C:\dev\alkanacoating\frontend
npm install
npm run dev
# Open http://localhost:5173
```

3) If you use Docker instead (single command):

```powershell
cd C:\dev\alkanacoating
docker compose up -d --build
# Backend may be at http://localhost:8080 depending on docker-compose.yml
```

Notes:
- If PowerShell blocks `npm` scripts (execution policy), run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force`.
- If Composer is missing, download the Windows installer from https://getcomposer.org or run the CLI installer as shown earlier in this README.
- If modal dialogs in admin overflow on small screens, the frontend now uses a responsive modal with a sticky footer so action buttons remain visible.


— Made with ❤️ for Alkana Coating.
