# API Contracts (draft)

Base URL: `/api`

- GET `/health` → `{ ok: true }`
- GET `/company` → company profile
- GET `/categories` → list of product categories
- GET `/products` → list of products with pagination and category filter
- GET `/products/{slug}` → product detail
- GET `/projects` → list of case studies / projects
- GET `/projects/{slug}` → project detail
- GET `/posts` → list of blog posts
- GET `/posts/{slug}` → blog post detail
- GET `/jobs` → list of open positions
- POST `/contact` → `{ success: true }` (sends email or logs lead)

All list endpoints support: `?page=1&limit=12&keyword=` (where relevant).
