# Codebase Summary - Alkana Coating

## Repository Overview

**Repository**: Alkana Coating Full-stack Website  
**Structure**: Monorepo (Backend + Frontend)  
**Total Size**: ~500MB (including dependencies)  
**Languages**: PHP (Laravel), JavaScript (React), SQL

## Directory Structure

```
alkanacoating/
├── backend/                    # Laravel API (PHP)
├── frontend/                   # React SPA (JavaScript)
├── docs/                       # Documentation
├── build/                      # Production build
├── scripts/                    # Utility scripts
├── .claude/                    # Claude Kit Engineer config
├── .github/                    # GitHub Actions workflows
├── deploy.php                  # Deployment installer
└── build_deploy_package.ps1   # Build script
```

## Backend (`backend/`)

### Core Application (`app/`)

#### Controllers (`app/Http/Controllers/`)

**Public API Controllers** (`Api/`)
- `ProductController.php` - Product catalog CRUD (public read, admin write)
- `ProjectController.php` - Project portfolio management
- `PostController.php` - Blog/news system
- `ContactController.php` - Contact form handling and management
- `MenuController.php` - Dynamic menu builder with mega menu support
- `SliderController.php` - Homepage slider management
- `RecruitmentController.php` - Job posting management
- `ApplicationController.php` - Job application handling
- `SettingsController.php` - System settings management

**Admin Controllers** (`Admin/`)
- `BackupController.php` - **Backup & restore system** (data + full backups)
- `UserController.php` - Admin user management
- `CategoryController.php` - Product category management
- `ImageCleanupController.php` - Unused image detection and cleanup
- `GoogleAnalyticsController.php` - Analytics data fetching
- `MenuArchiveController.php` - Archived menu management

**Main Controller**
- `AdminController.php` - Admin authentication and dashboard

#### Models (`app/Models/`)

**Core Models**:
- `User.php` - Admin users with role-based access
- `Category.php` - Product categories
- `Product.php` - Products with specs (JSON), images, categories
- `Project.php` - Portfolio projects
- `Post.php` - Blog posts with categories and tags
- `PostCategory.php` - Blog categories
- `PostTag.php` - Blog tags
- `Menu.php` - Dynamic menus with parent-child relationships
- `Slider.php` - Homepage sliders
- `Contact.php` - Customer inquiries
- `Recruitment.php` - Job postings
- `Application.php` - Job applications with CV uploads
- `Setting.php` - Key-value system settings

#### Services (`app/Services/`)

- `DbDumper.php` - **Database backup service**
  - Generates MySQL dumps with structure and data
  - Handles foreign key constraints
  - Escapes special characters properly

#### Routes (`routes/`)

- `api.php` - Public API routes (read-only mostly)
- `api_admin.php` - **Admin API routes** (165 lines, comprehensive CRUD)
- `web.php` - Web routes (minimal, SPA handles routing)

### Database (`database/`)

#### Migrations (`database/migrations/`)

**Key migrations**:
- `create_users_table` - Admin users
- `create_categories_table` - Product categories
- `create_products_table` - Products with category FK
- `create_projects_table` - Portfolio projects
- `create_posts_table` - Blog posts
- `create_menus_table` - Dynamic menu system
- `create_sliders_table` - Homepage sliders
- `create_contacts_table` - Contact inquiries
- `create_recruitments_table` - Job postings
- `create_applications_table` - Job applications
- `create_settings_table` - System settings

#### Seeders (`database/seeders/`)

- `DatabaseSeeder.php` - Master seeder
- `UserSeeder.php` - Default admin user
- `CategorySeeder.php` - Sample categories
- `ProductSeeder.php` - Sample products
- Sample data for all entities

### Configuration (`config/`)

**Important configs**:
- `cors.php` - CORS settings for SPA
- `sanctum.php` - API authentication
- `database.php` - MySQL connection
- `filesystems.php` - File storage configuration

### Storage (`storage/`)

```
storage/app/
├── backups/              # System backups (data + full)
├── public/               # Public file storage (sliders, etc)
└── analytics/            # Google Analytics credentials
```

### Public Assets (`public/`)

```
public/
├── uploads/              # User-uploaded images
│   ├── products/
│   ├── projects/
│   ├── posts/
│   └── applications/     # CV files
├── index.php             # Laravel entry point
└── .htaccess             # Apache rewrite rules
```

### Tests (`tests/`)

- `Feature/` - Feature tests (API endpoints)
- `Unit/` - Unit tests (models, services)

## Frontend (`frontend/`)

### Source Code (`src/`)

#### Admin Panel (`src/admin/`)

**Components** (`admin/components/`)
- `AdminSidebar.jsx` - Navigation sidebar with menu items
- `AdminHeader.jsx` - Top header with user info
- `RichTextEditor.jsx` - Quill-based WYSIWYG editor
- `ImageUploader.jsx` - Image upload with preview
- `ConfirmDialog.jsx` - Reusable confirmation modal

**Pages** (`admin/pages/`)
- `AdminDashboard.jsx` - Dashboard with analytics
- `ProductManagement.jsx` - Product CRUD
- `CategoryManagement.jsx` - Category CRUD
- `ProjectManagement.jsx` - Project CRUD
- `PostManagement.jsx` - Blog post CRUD
- `MenuBuilder.jsx` - Dynamic menu builder with drag-drop
- `SliderManagement.jsx` - Slider CRUD
- `**BackupManagement.jsx**` - **Backup & restore interface**
- `UserManagement.jsx` - Admin user management
- `ContactManagement.jsx` - Contact inquiry management
- `RecruitmentManagement.jsx` - Job posting management
- `ApplicationManagement.jsx` - Job application review
- `SettingsPage.jsx` - System settings
- `ImageCleanup.jsx` - Unused image cleanup tool

**Routing**
- `AdminRoutes.jsx` - Admin route configuration with auth guards

#### Public Pages (`src/pages/`)

- `HomePage.jsx` - Homepage with hero, featured products
- `ProductsPage.jsx` - Product catalog with filters
- `ProductDetailPage.jsx` - Single product detail
- `ProjectsPage.jsx` - Project portfolio listing
- `ProjectDetailPage.jsx` - Single project detail
- `NewsPage.jsx` - Blog listing
- `NewsDetailPage.jsx` - Single blog post
- `CareersPage.jsx` - Job listings
- `ContactPage.jsx` - Contact form
- `AboutPage.jsx` - About company

#### Shared Components (`src/components/`)

**Layout**
- `Header.jsx` - Public site header with dynamic menu
- `Footer.jsx` - Public site footer
- `MegaMenu.jsx` - Mega menu component

**UI Components**
- `ProductCard.jsx` - Product display card
- `ProjectCard.jsx` - Project display card
- `PostCard.jsx` - Blog post card
- `Breadcrumb.jsx` - Breadcrumb navigation
- `Pagination.jsx` - Pagination component
- `LoadingSpinner.jsx` - Loading indicator
- `ErrorBoundary.jsx` - Error boundary wrapper

#### Services (`src/services/`)

- `api.js` - Axios instance with interceptors
  - Base URL configuration
  - Token injection
  - Error handling
- `adminApi.js` - Admin-specific API calls
  - Product operations
  - Backup operations
  - User management

#### State Management (`src/stores/`)

- `authStore.js` - Zustand store for authentication
  - User state
  - Token management
  - Login/logout actions
- `adminStore.js` - Admin panel state
  - Loading states
  - Cache management

#### Utilities (`src/utils/`)

- `formatDate.js` - Date formatting helpers
- `imageHelpers.js` - Image URL helpers
- `validators.js` - Form validation utilities

#### Hooks (`src/hooks/`)

- `useAuth.js` - Authentication hook

### Configuration Files

- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS customization
- `postcss.config.js` - PostCSS configuration
- `package.json` - Dependencies and scripts

### Testing (`test/`)

- `e2e/` - End-to-end tests
- `playwright/` - Playwright browser tests

## Documentation (`docs/`)

- `README.md` - Documentation index
- `project-overview-pdr.md` - Project overview
- `system-architecture.md` - Architecture documentation
- `code-standards.md` - Coding standards
- `codebase-summary.md` - This file
- `design-guidelines.md` - UI/UX guidelines
- `deployment-guide.md` - Deployment instructions
- `project-roadmap.md` - Project roadmap
- `api-contract.md` - API documentation
- `schema.sql` - Database schema
- `sample-data.sql` - Sample data
- `deployment/` - Deployment guides
  - `QUICK_START.md` - Quick deployment
  - `METHODS.md` - Deployment methods
  - `GITHUB_ACTIONS.md` - CI/CD setup

## Build & Deployment

### Scripts

- `build_deploy_package.ps1` - PowerShell build script
  - Builds frontend
  - Copies files to build directory
  - Creates deployment package
- `create-installer-v2.ps1` - Installer package creator
- `deploy.php` - Web-based deployment installer

### Build Directory (`build/`)

Production-ready files for deployment:
- `backend/` - Laravel backend
- `frontend/` - Built React app
- `README.md` - Deployment instructions

## Claude Kit Engineer (`.claude/`)

### Workflows (`.claude/workflows/`)

- `primary-workflow.md` - Main development workflow
- `development-rules.md` - Development rules and principles
- `orchestration-protocol.md` - Agent orchestration
- `documentation-management.md` - Doc management workflow

### Skills (`.claude/skills/`)

33 skill directories including:
- `backend-development/` - PHP/Laravel skills
- `frontend-development/` - React skills
- `databases/` - Database skills
- `devops/` - Deployment skills
- `code-review/` - Code review skills
- `debugging/` - Debugging skills
- `planning/` - Planning skills

### Configuration

- `settings.json` - Claude Kit settings
- `metadata.json` - Skill metadata
- `.env.example` - Environment template

## Dependencies

### Backend (Composer)

**Core**:
- `laravel/framework: ^9.19` - Laravel framework
- `laravel/sanctum: ^3.0` - API authentication
- `fruitcake/laravel-cors: ^3.0` - CORS handling

**Features**:
- `intervention/image: ^2.7` - Image processing
- `google/analytics-data: ^0.23` - Google Analytics
- `doctrine/dbal: *` - Database abstraction

**Dev**:
- `phpunit/phpunit: ^9.5` - Testing
- `laravel/pint: ^1.0` - Code formatting

### Frontend (npm)

**Core**:
- `react: ^18.3.1` - React library
- `react-dom: ^18.3.1` - React DOM
- `react-router-dom: ^6.26.2` - Routing
- `vite: ^5.4.8` - Build tool

**UI**:
- `tailwindcss: ^3.4.12` - CSS framework
- `@heroicons/react: ^2.2.0` - Icons
- `framer-motion: ^12.23.24` - Animations
- `aos: ^2.3.4` - Scroll animations

**Features**:
- `axios: ^1.7.7` - HTTP client
- `zustand: ^4.5.4` - State management
- `react-quill: ^2.0.0` - Rich text editor
- `recharts: ^3.5.0` - Charts
- `@dnd-kit/core: ^6.3.1` - Drag and drop

**Dev**:
- `@playwright/test: ^1.56.1` - E2E testing
- `@vitejs/plugin-react: ^4.3.1` - Vite React plugin

## Key Files

### Configuration

- `backend/.env` - Backend environment config
- `frontend/.env` - Frontend environment config
- `backend/composer.json` - PHP dependencies
- `frontend/package.json` - JavaScript dependencies

### Entry Points

- `backend/public/index.php` - Laravel entry point
- `frontend/index.html` - React entry point
- `frontend/src/main.jsx` - React bootstrap

### Important Scripts

- `backend/artisan` - Laravel CLI
- `frontend/vite.config.js` - Build configuration

---

**Last Updated**: 2025-11-30  
**Document Owner**: Development Team
