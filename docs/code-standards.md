# Code Standards - Alkana Coating

## General Principles

We follow **YAGNI (You Aren't Gonna Need It)**, **KISS (Keep It Simple, Stupid)**, and **DRY (Don't Repeat Yourself)** principles.

## File Naming Conventions

### Backend (PHP/Laravel)

**Controllers**: `PascalCase` with `Controller` suffix
```
ProductController.php
BackupController.php
AdminCategoryController.php
```

**Models**: `PascalCase` (singular)
```
Product.php
Category.php
User.php
```

**Migrations**: `snake_case` with timestamp prefix
```
2024_01_01_000000_create_products_table.php
2024_01_02_000000_add_slug_to_categories_table.php
```

**Services**: `PascalCase` with descriptive name
```
DbDumper.php
ImageOptimizer.php
```

### Frontend (React/JavaScript)

**Components**: `PascalCase.jsx`
```
ProductCard.jsx
AdminSidebar.jsx
BackupManagement.jsx
```

**Pages**: `PascalCase` with `Page` suffix
```
HomePage.jsx
ProductsPage.jsx
AdminDashboard.jsx
```

**Utilities**: `camelCase.js`
```
formatDate.js
apiHelpers.js
```

**Stores**: `camelCase` with `Store` suffix
```
authStore.js
adminStore.js
```

## Code Organization

### File Size Management

- **Keep files under 200 lines** for optimal readability
- Split large components into smaller, focused sub-components
- Extract reusable logic into custom hooks or utilities
- Create dedicated service classes for complex business logic

### Directory Structure

**Backend**:
```
app/
├── Http/Controllers/
│   ├── Api/              # Public API (read-only mostly)
│   └── Admin/            # Admin operations (CRUD)
├── Models/               # Eloquent models
├── Services/             # Business logic
└── Providers/            # Service providers
```

**Frontend**:
```
src/
├── admin/                # Admin-only code
├── components/           # Shared components
├── pages/                # Public pages
├── features/             # Feature modules
├── services/             # API services
├── stores/               # State management
├── hooks/                # Custom hooks
└── utils/                # Utilities
```

## PHP/Laravel Standards

### Naming Conventions

**Variables**: `camelCase`
```php
$productName = 'Example';
$categoryId = 1;
```

**Constants**: `UPPER_SNAKE_CASE`
```php
const MAX_UPLOAD_SIZE = 5242880;
const DEFAULT_PAGINATION = 20;
```

**Methods**: `camelCase`
```php
public function createBackup() {}
public function getProducts() {}
```

**Classes**: `PascalCase`
```php
class ProductController extends Controller {}
class DbDumper {}
```

### Code Style

**Controllers**: Keep thin, delegate to services
```php
// ✅ Good
public function createData()
{
    try {
        $filename = BackupService::createDataBackup();
        return response()->json(['success' => true, 'filename' => $filename]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

// ❌ Bad - too much logic in controller
public function createData()
{
    $filename = 'backup_' . date('Y-m-d') . '.zip';
    $zip = new ZipArchive();
    // ... 50 lines of backup logic ...
}
```

**Eloquent Queries**: Use query builder efficiently
```php
// ✅ Good - eager loading
$products = Product::with('category')->get();

// ❌ Bad - N+1 query problem
$products = Product::all();
foreach ($products as $product) {
    echo $product->category->name; // Triggers separate query each time
}
```

**Validation**: Use Form Requests or inline validation
```php
// ✅ Good
$data = $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email|unique:users',
]);

// ❌ Bad - no validation
$name = $request->input('name');
$email = $request->input('email');
```

### Error Handling

Always use try-catch for operations that can fail:
```php
try {
    DB::transaction(function () use ($data) {
        $product = Product::create($data);
        $product->images()->attach($imageIds);
    });
    return response()->json(['success' => true]);
} catch (\Exception $e) {
    Log::error('Product creation failed: ' . $e->getMessage());
    return response()->json(['error' => 'Failed to create product'], 500);
}
```

## JavaScript/React Standards

### Naming Conventions

**Variables/Functions**: `camelCase`
```javascript
const productName = 'Example';
const fetchProducts = async () => {};
```

**Constants**: `UPPER_SNAKE_CASE`
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
```

**Components**: `PascalCase`
```javascript
const ProductCard = ({ product }) => {};
const AdminSidebar = () => {};
```

**Custom Hooks**: `camelCase` with `use` prefix
```javascript
const useAuth = () => {};
const useProducts = () => {};
```

### Component Structure

**Functional Components** (preferred):
```javascript
import React, { useState, useEffect } from 'react';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Side effects here
  }, []);

  const handleClick = () => {
    // Event handler
  };

  return (
    <div className="product-card">
      {/* JSX */}
    </div>
  );
};

export default ProductCard;
```

### State Management (Zustand)

```javascript
// ✅ Good - clear, focused store
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

// Usage
const { user, login, logout } = useAuthStore();
```

### API Calls

**Centralized API service**:
```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Usage in components**:
```javascript
// ✅ Good - error handling
const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await api.get('/products');
    setProducts(response.data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    toast.error('Không thể tải sản phẩm');
  } finally {
    setLoading(false);
  }
};
```

### Styling with Tailwind

**Use utility classes**:
```jsx
// ✅ Good
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Click me
</button>

// ❌ Bad - custom CSS when Tailwind can do it
<button className="custom-button">Click me</button>
```

**Extract repeated patterns**:
```jsx
// ✅ Good - component for repeated pattern
const PrimaryButton = ({ children, onClick }) => (
  <button 
    onClick={onClick}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    {children}
  </button>
);
```

## Database Standards

### Migration Naming

```php
// ✅ Good - descriptive
2024_01_01_create_products_table.php
2024_01_02_add_slug_to_categories.php
2024_01_03_create_product_images_table.php

// ❌ Bad - unclear
2024_01_01_update.php
2024_01_02_changes.php
```

### Column Naming

- Use `snake_case` for column names
- Use descriptive names
- Add `_id` suffix for foreign keys
- Add `_at` suffix for timestamps

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->nullable()->constrained();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('summary')->nullable();
    $table->longText('content')->nullable();
    $table->json('specs')->nullable();
    $table->timestamps();
});
```

## Git Commit Standards

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(products): add image gallery to product detail page

fix(backup): resolve download error for full system backups

docs(readme): update deployment instructions

refactor(api): extract backup logic to service class

chore(deps): update Laravel to 9.52
```

### Commit Rules

- ✅ Write clear, descriptive commit messages
- ✅ Keep commits focused on single changes
- ✅ Commit working code only
- ❌ Don't commit sensitive data (.env, credentials)
- ❌ Don't commit commented-out code
- ❌ Don't mention AI tools in commits

## Code Review Checklist

### Before Committing

- [ ] Code compiles/runs without errors
- [ ] No console.log() or dd() left in code
- [ ] No commented-out code
- [ ] Variables and functions have meaningful names
- [ ] Error handling is present
- [ ] No hardcoded values (use config/env)
- [ ] Code follows project structure

### Backend Checklist

- [ ] Validation rules are present
- [ ] Database queries are optimized (no N+1)
- [ ] Proper HTTP status codes used
- [ ] Authorization checks in place
- [ ] Transactions used for multi-step operations

### Frontend Checklist

- [ ] Components are properly structured
- [ ] Loading and error states handled
- [ ] API calls have error handling
- [ ] No prop drilling (use context/store if needed)
- [ ] Responsive design implemented
- [ ] Accessibility considerations (alt text, ARIA labels)

## Documentation Standards

### Code Comments

**When to comment**:
- Complex algorithms or business logic
- Non-obvious workarounds
- Important decisions or trade-offs

**When NOT to comment**:
- Self-explanatory code
- Redundant information

```php
// ✅ Good - explains WHY
// Using raw SQL because Eloquent doesn't support this specific MySQL syntax
DB::statement('SET FOREIGN_KEY_CHECKS=0');

// ❌ Bad - explains WHAT (obvious from code)
// Set the name variable to the product name
$name = $product->name;
```

### Function Documentation

**PHP DocBlocks**:
```php
/**
 * Create a full system backup including source code and database
 *
 * @return \Illuminate\Http\JsonResponse
 * @throws \Exception if backup creation fails
 */
public function createFull()
{
    // Implementation
}
```

**JavaScript JSDoc** (optional but recommended):
```javascript
/**
 * Fetch products from API with optional filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.category - Category slug
 * @param {string} filters.search - Search keyword
 * @returns {Promise<Array>} Array of products
 */
const fetchProducts = async (filters = {}) => {
  // Implementation
};
```

## Security Standards

### Input Validation

- ✅ Always validate user input
- ✅ Use Laravel validation rules
- ✅ Sanitize HTML content
- ❌ Never trust client-side validation alone

### Authentication & Authorization

- ✅ Use Laravel Sanctum for API auth
- ✅ Check permissions in controllers
- ✅ Protect admin routes with middleware
- ❌ Don't expose sensitive data in API responses

### File Uploads

```php
// ✅ Good - validation
$request->validate([
    'image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
]);

// ✅ Good - secure storage
$path = $request->file('image')->store('products', 'public');
```

## Performance Standards

### Backend

- Use database indexing on frequently queried columns
- Implement pagination for large datasets
- Use eager loading to prevent N+1 queries
- Cache expensive operations when appropriate

### Frontend

- Lazy load routes and components
- Optimize images before upload
- Debounce search inputs
- Use React.memo for expensive components

---

**Last Updated**: 2025-11-30  
**Document Owner**: Development Team
